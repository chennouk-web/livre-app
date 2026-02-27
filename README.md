# Livre Management (Express + SQLite)

Minimal full-stack app to manage books (livres) using Node.js, Express and SQLite.

Quick start

1. Open a shell in `livre-app` directory.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open http://localhost:3000 in your browser.

Authentication

- A login page is available at `/login.html`.
- Use hardcoded credentials **admin/password** to access the app.
- Upon login a JWT token is stored in localStorage and required for API requests.

Development

```bash
npm run dev
```

Files

- `index.js`: Express server and API
- `db.js`: SQLite helper and initialization
- `public/`: frontend files (`index.html`, `app.js`, `styles.css`)
