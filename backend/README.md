# NomadTrack Backend API

Node.js + Express + MySQL API for NomadTrack. Run this locally so the frontend can load cities and auth.

## Quick setup (use this repo’s `backend/` folder)

### 1. Go to the backend folder

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

```bash
# Windows (PowerShell)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `.env` and set:

- `DB_PASSWORD` — your MySQL root (or app) password  
- `JWT_SECRET` — a long random string (e.g. from `openssl rand -hex 32`)  
- Optionally `DB_USER` / `DB_NAME` if you use different values  

### 4. Set up the MySQL database

Create the database and tables:

```bash
mysql -u root -p < schema.sql
```

(Enter your MySQL password when prompted.)

### 5. Start the server

```bash
node server.js
```

You should see: **NomadTrack API running on http://localhost:5000**

Test the API: open **http://localhost:5000/api/cities** in your browser — you should get JSON (e.g. city list or empty array if no data yet).

### 6. (Optional) Internal control console (hidden)

The project includes a hidden internal console at `/control-panel` that is only accessible to users with `role = 'admin'`.

If your database was created before the `role` column existed, run:

```bash
mysql -u root -p nomadtrack < migrations/002_add_user_role.sql
```

Then set your first console user by email (use the email you sign in with):

```bash
mysql -u root -p nomadtrack -e "UPDATE users SET role = 'admin' WHERE email = 'you@example.com';"
```

Replace `you@example.com` with your actual login email.

To open the console (no UI link is shown), use:

- URL: **http://localhost:8080/control-panel**
- Shortcut: **Ctrl + Shift + A**

---

## Running frontend + backend together

- **Backend:** in `backend/` run `node server.js` (or `npm start`) → http://localhost:5000  
- **Frontend:** in project root run `npm run dev` → open the URL Vite prints (usually http://localhost:5173)  
- **Lovable cloud preview** cannot reach your `localhost:5000`. To use the cloud preview with real data, deploy this backend to a public URL (e.g. Render, Railway) and set `VITE_API_BASE_URL` to that URL in the frontend.
