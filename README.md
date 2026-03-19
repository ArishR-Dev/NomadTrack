# NomadTrack (City Nomad Compass)

NomadTrack is a full-stack digital nomad city explorer designed to help remote workers find their perfect destination. Browse, compare, and map cities based on cost of living, internet speed, safety, climate, and a dynamic **Nomad Score**. 

## ✨ Features & Specifications

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, shadcn-ui
- **Backend & API**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: Secure JWT-based auth & Google Sign-In integration
- **User Dashboard**: Save favorite cities and view personalized analytics widgets
- **Admin Console**: A hidden control panel for managing users and importing city data
- **Dynamic Scoring**: The "Nomad Score" calculates a city's viability based on weighted metrics

## 🚀 Getting Started

To run NomadTrack locally, you must have [Node.js](https://nodejs.org/) and [MySQL](https://www.mysql.com/) installed.

### 1. Clone the repository

```sh
git clone https://github.com/ArishR-Dev/NomadTrack.git
cd NomadTrack
```

### 2. Install dependencies

Install the required packages for both the backend and frontend:
```sh
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Setup the Database

NomadTrack requires a MySQL database. Create a database named `nomadtrack` and import the schema.

You have two schema options provided in the `backend` folder:
- `schema.no-seed.sql`: schema only (recommended for production)
- `schema.sql`: schema + demo seed cities
- `seed.cities.sql`: optional seed file (cities only)

Example setup using MySQL CLI:
```sh
# Create the schema and add demo data
mysql -u root -p nomadtrack < backend/schema.sql
```

### 4. Configure Environment Variables

Create `.env` files in both the frontend and backend directories. You can use the provided `.env.example` files as templates:

**Backend (`backend/.env`):**
Configure your database credentials, JWT secret, and Google OAuth keys.

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Start the Application

Start the backend and frontend servers:

```sh
# Start backend (API) on http://localhost:5000
cd backend && npm start

# Start frontend (Vite) on http://localhost:5173
cd ../frontend && npm run dev
```

#### Windows Quick Start
If you are on Windows, you can simply double-click the `run-nomadtrack.bat` file in the root directory. It will open two terminal windows and automatically start both the backend and frontend servers.

## ⚙️ Internal Control Console (Admin)

There is a hidden internal console at `/control-panel` to manage the platform. This route is intentionally not linked in the main UI and is only accessible to users with `role = 'admin'`.

To make a user an admin, manually update their role in the MySQL database:

```sql
UPDATE users SET role='admin' WHERE email='you@example.com';
```

Then visit:
`http://localhost:5173/control-panel`
