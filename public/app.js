// redirect unauthenticated users to login
if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

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
    // not authenticated, redirect login
    window.location.href = '/login.html';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

const listEl = document.getElementById('list');
const form = document.getElementById('book-form');
const resetBtn = document.getElementById('reset');

function renderBooks(books) {
  if (!books.length) {
    listEl.innerHTML = '<p>No books yet.</p>';
    return;
  }
  const rows = books.map(b => `
    <div class="book">
      <div class="meta">
        <strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(b.author || '')} <span class="year">${b.year||''}</span>
      </div>
      <div class="desc">${escapeHtml(b.description||'')}</div>
      <div class="controls">
        <button data-id="${b.id}" class="edit">Edit</button>
        <button data-id="${b.id}" class="delete">Delete</button>
      </div>
    </div>`).join('');
  listEl.innerHTML = rows;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function load() {
  try {
    const books = await api('/api/books');
    renderBooks(books);
  } catch (err) {
    listEl.innerHTML = '<p class="error">Failed to load books.</p>';
    console.error(err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('book-id').value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    author: document.getElementById('author').value.trim(),
    year: document.getElementById('year').value ? Number(document.getElementById('year').value) : null,
    description: document.getElementById('description').value.trim()
  };
  try {
    if (id) {
      await api('/api/books/' + id, 'PUT', payload);
    } else {
      await api('/api/books', 'POST', payload);
    }
    form.reset();
    document.getElementById('book-id').value = '';
    load();
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
});

resetBtn.addEventListener('click', () => {
  form.reset();
  document.getElementById('book-id').value = '';
});

listEl.addEventListener('click', async (e) => {
  if (e.target.matches('.edit')) {
    const id = e.target.dataset.id;
    try {
      const book = await api('/api/books/' + id);
      document.getElementById('book-id').value = book.id;
      document.getElementById('title').value = book.title;
      document.getElementById('author').value = book.author || '';
      document.getElementById('year').value = book.year || '';
      document.getElementById('description').value = book.description || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Failed to load book');
    }
  }
  if (e.target.matches('.delete')) {
    const id = e.target.dataset.id;
    if (!confirm('Delete this book?')) return;
    try {
      await api('/api/books/' + id, 'DELETE');
      load();
    } catch (err) {
      alert('Delete failed');
    }
  }
});

// logout support
const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });
}

load();
