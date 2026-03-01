// Redirect unauthenticated users to login
if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

// ===== API Helper =====
async function api(path, method = 'GET', body) {
  const opts = { method, headers: {} };
  const token = localStorage.getItem('token');
  if (token) {
    opts.headers['Authorization'] = 'Bearer ' + token;
  }
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

// ===== DOM Elements =====
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.getElementById('logout');
const logoutDropdown = document.getElementById('logoutDropdown');

const listEl = document.getElementById('list');
const form = document.getElementById('book-form');
const resetBtn = document.getElementById('reset');
const addBookBtn = document.getElementById('addBookBtn');
const formCard = document.getElementById('formCard');

// ===== Dark Mode =====
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// ===== Navigation =====
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = item.dataset.section;
    
    // Update active nav item
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Update active section
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // Close mobile sidebar
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('active');
    }
  });
});

// ===== Sidebar Toggle (Mobile) =====
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// ===== Add Book Button =====
addBookBtn.addEventListener('click', () => {
  formCard.style.display = 'block';
  form.reset();
  document.getElementById('book-id').value = '';
  form.scrollIntoView({ behavior: 'smooth' });
});

resetBtn.addEventListener('click', () => {
  formCard.style.display = 'none';
  form.reset();
  document.getElementById('book-id').value = '';
});

// ===== Utility Functions =====
function renderBooks(books) {
  if (!books || books.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📚</span>
        <p>No books yet. Add your first book to get started!</p>
      </div>
    `;
    return;
  }
  
  const html = books.map(b => `
    <div class="book">
      <div class="meta">
        <strong>${escapeHtml(b.title)}</strong>
        <div class="author">${escapeHtml(b.author || 'Unknown Author')}</div>
        ${b.year ? `<span class="year">📅 ${b.year}</span>` : ''}
      </div>
      <div class="desc">${escapeHtml(b.description || 'No description available')}</div>
      <div class="controls">
        <button class="edit" data-id="${b.id}">Edit</button>
        <button class="delete" data-id="${b.id}">Delete</button>
      </div>
    </div>
  `).join('');
  
  listEl.innerHTML = html;
  attachBookListeners();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function attachBookListeners() {
  listEl.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      try {
        const book = await api(`/api/books/${id}`);
        document.getElementById('book-id').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author || '';
        document.getElementById('year').value = book.year || '';
        document.getElementById('description').value = book.description || '';
        formCard.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        alert('Failed to load book: ' + err.message);
      }
    });
  });

  listEl.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      if (!confirm('Are you sure you want to delete this book?')) return;
      try {
        await api(`/api/books/${id}`, 'DELETE');
        loadBooks();
      } catch (err) {
        alert('Failed to delete book: ' + err.message);
      }
    });
  });
}

async function loadBooks() {
  try {
    const books = await api('/api/books');
    renderBooks(books);
    // Update dashboard stats
    document.getElementById('totalBooks').textContent = books.length;
  } catch (err) {
    listEl.innerHTML = '<p style="color: #ef4444; text-align: center;">Failed to load books.</p>';
    console.error(err);
  }
}

// ===== Form Submit =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('book-id').value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    author: document.getElementById('author').value.trim(),
    year: document.getElementById('year').value ? Number(document.getElementById('year').value) : null,
    description: document.getElementById('description').value.trim()
  };

  if (!payload.title) {
    alert('Book title is required');
    return;
  }

  try {
    if (id) {
      await api(`/api/books/${id}`, 'PUT', payload);
    } else {
      await api('/api/books', 'POST', payload);
    }
    formCard.style.display = 'none';
    form.reset();
    loadBooks();
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
});

// ===== Logout =====
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

logoutBtn.addEventListener('click', logout);
logoutDropdown.addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

// ===== Initialize =====
loadBooks();
