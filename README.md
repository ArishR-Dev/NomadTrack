# 🌍 NomadTrack (City Nomad Compass)

> Your ultimate full-stack digital nomad companion.

NomadTrack is a modern, high-performance web application designed to help remote workers find their perfect destination. Browse, compare, and map cities based on cost of living, internet speed, safety, climate, and a dynamic algorithm-driven **Nomad Score**.

## 📸 Platform Previews

| User Dashboard | Interactive Global Map |
|:---:|:---:|
| <img src="SS/user/dashboard.png" width="400" alt="Dashboard Preview"> | <img src="SS/user/map.png" width="400" alt="City Map Preview"> |

| Admin Control Center | Real-time Analytics |
|:---:|:---:|
| <img src="SS/admin/admin-dashboard.png" width="400" alt="Admin Console Preview"> | <img src="SS/user/analytics.png" width="400" alt="Analytics Preview"> |

---

## ✨ Core Features

* **Smart Nomad Score Engine**: An algorithmic calculation evaluating cities based on internet viability (30%), safety index (20%), cost affordability (30%), and climate comfort (20%).
* **Advanced City Exploration**: Filter, search, and discover cities. Find the cheapest destinations or the ones with lightning-fast internet.
* **Interactive Data Visualization**: Compare up to 5 cities simultaneously using custom Radar and Bar charts built with Recharts.
* **Global Map View**: Visualize destinations geographically with a clustered interactive Leaflet map integration.
* **User Accounts & Favorites**: Users can register natively (JWT & bcrypt) or seamlessly authenticate via **Google OAuth 2.0**. Favorite cities to build a personalized bucket list.
* **Secure Password Recovery**: Automated forgotten password workflows featuring one-time secure tokens and SMTP email delivery.
* **Admin Control Console**: A protected internal dashboard (`/control-panel`). Monitor system health, live usage analytics, manage users, and perform bulk CSV/JSON imports of new cities.

## 🛠 Tech Stack

**Frontend Architecture (Vite + React 18)**
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **UI Components**: shadcn/ui & Radix UI primitives
- **Data Fetching**: TanStack React Query (`@tanstack/react-query`)
- **Routing**: React Router DOM (`react-router-dom`)
- **Visuals**: Recharts (Analytics) & Leaflet (Maps)
- **Forms**: React Hook Form + Zod validation

**Backend Architecture (Node.js)**
- **Framework**: Express.js
- **Database**: MySQL 2 (Connection Pooling)
- **Authentication**: `jsonwebtoken` & `bcryptjs`
- **Integrations**: Google OAuth2 API
- **Mailing**: Nodemailer (SMTP)

---

## 🚀 Getting Started

To run NomadTrack locally, ensure you have [Node.js](https://nodejs.org/) and [MySQL](https://www.mysql.com/) installed on your machine.

### 1. Clone the repository

```sh
git clone https://github.com/ArishR-Dev/NomadTrack.git
cd NomadTrack
```

### 2. Install dependencies

```sh
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Setup the Database

NomadTrack requires a MySQL database. Create a database named `nomadtrack`. Inside the `backend` folder, you'll find different schema options:
- `schema.no-seed.sql`: schema only (recommended for production)
- `schema.sql`: schema + demo seed cities
- `seed.cities.sql`: optional secondary seed file

Example setup via MySQL CLI:
```sh
mysql -u root -p nomadtrack < backend/schema.sql
```

### 4. Configure Environment Variables

Create a `.env` file in both directories using the provided templates:

**Backend (`backend/.env`):**
Configure your database credentials, JWT secret (`JWT_SECRET`), SMTP config for emails, and Google OAuth keys (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Start the Application

```sh
# Start the Express API (http://localhost:5000)
cd backend && npm start

# Start the Vite Frontend (http://localhost:5173)
cd ../frontend && npm run dev
```

#### ⚡ Windows Quick Start
If you are on Windows, simply double-click the `run-nomadtrack.bat` file in the root directory. It will spin up both servers in parallel!

---

## 🛡️ Internal Control Console

The administration panel is intentionally hidden from the main navigation UI. It is restricted to users with `role = 'admin'` and allows full CRUD management over the platform's data.

**Access Instructions:**
1. From anywhere in the application, press **`Ctrl + Shift + A`**.
2. If you are an Admin, you will instantly be routed to `/control-panel`.

To elevate a standard user to an Admin, manually update their role in the MySQL database:
```sql
UPDATE users SET role='admin' WHERE email='you@example.com';
```
