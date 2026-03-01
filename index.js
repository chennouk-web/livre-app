const express = require('express');
const path = require('path');
const db = require('./db');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET = process.env.JWT_SECRET || 'supersecret';

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') 
    return res.status(401).json({ error: 'Invalid token format' });
  jwt.verify(parts[1], SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
)`);

// sign up endpoint
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    // simple insertion, plaintext password for demo
    await db.run('INSERT INTO users (username, password) VALUES (?,?)', [username, password]);
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// login uses users table (with hardcoded fallback)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    // try DB first
    const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (user) {
      const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
      return res.json({ token });
    }

    // fallback hardcoded admin credentials
    const HARD_USER = process.env.HARD_ADMIN_USER || 'admin';
    const HARD_PASS = process.env.HARD_ADMIN_PASS || 'password';
    if (username === HARD_USER && password === HARD_PASS) {
      const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
      return res.json({ token, warning: 'Using hardcoded credentials' });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// protect all /api/books routes
app.use('/api/books', authenticate);

// List all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM books ORDER BY id');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await db.get('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create book
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, year, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await db.run(
      'INSERT INTO books (title, author, year, description) VALUES (?,?,?,?)',
      [title, author || '', year || null, description || '']
    );
    const book = await db.get('SELECT * FROM books WHERE id = ?', [result.id]);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update book
app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, year, description } = req.body;
    const id = req.params.id;
    const existing = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await db.run(
      'UPDATE books SET title = ?, author = ?, year = ?, description = ? WHERE id = ?',
      [title || existing.title, author || existing.author, year || existing.year, description || existing.description, id]
    );
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await db.run('DELETE FROM books WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
