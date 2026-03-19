# NomadTrack (City Nomad Compass)

NomadTrack is a full-stack digital nomad city explorer built with **React (Vite) + Tailwind** on the frontend and **Node/Express + MySQL** on the backend. Browse, compare, and map cities by cost, internet, safety, climate, and a dynamic **Nomad Score**. It includes **JWT auth**, **Google sign-in**, user favorites, analytics widgets, and a hidden admin control console for managing cities/users and imports.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Step 4: Start backend (API)
cd ../backend && node server.js

# Step 5: Start frontend (Vite)
cd ../frontend && npm run dev
```

### Quick start (Windows)

Double-click:

- `run-nomadtrack.bat`

It opens two terminals and starts:

- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

### Backend & API (why you see "0 cities" / skeletons)

The UI talks to a backend API. How you run things determines where that API must be:

| Where you open the app | Backend must be |
|------------------------|-----------------|
| **Lovable cloud preview** (e.g. their URL) | A **public URL** (e.g. Render, Railway). The cloud cannot reach your `localhost:5000`. |
| **Local browser** (e.g. `http://localhost:5173`) | Your **local backend** at `http://localhost:5000`. |

- **To test locally:** Run the backend (e.g. `cd backend && npm run dev`), then run the frontend (`npm run dev`) and open the URL Vite prints (usually `http://localhost:5173`) in your browser. Use `.env` with `VITE_API_BASE_URL=http://localhost:5000`.
- **To use the Lovable preview with real data:** Deploy the backend to a public host, then set `VITE_API_BASE_URL` to that URL (e.g. in Lovable’s env/config or in `.env` before building).

See `frontend/.env.example` (and `backend/.env.example`) for examples. **Never commit real `.env` secrets**.

### Database

NomadTrack uses **MySQL**. You have two schema options:

- `backend/schema.no-seed.sql`: schema only (recommended for production)
- `backend/schema.sql`: schema + demo seed cities
- `backend/seed.cities.sql`: optional seed file (cities only)

Example:

```sh
# schema only
mysql -u root -p nomadtrack < backend/schema.no-seed.sql

# optional demo data
mysql -u root -p nomadtrack < backend/seed.cities.sql
```

### Internal control console (hidden)

There is a hidden internal console at `/control-panel` that is only accessible to users with `role = 'admin'`. It is intentionally not linked in the UI.

To make a user admin (example):

```sh
mysql -u root -p nomadtrack -e "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

Then open:

- `http://localhost:5173/control-panel`

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

