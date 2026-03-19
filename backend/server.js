// ============================================
// NomadTrack Backend - Node.js + Express + MySQL
// ============================================
//
// Setup: see backend/README.md (or run: cd backend && npm install, add .env from .env.example, mysql < schema.sql, node server.js)
// ============================================

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const { authenticateToken } = require("./middleware/authenticateToken");
const { requireAdmin } = require("./middleware/requireAdmin");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_STARTED_AT = Date.now();

// Middleware – allow frontend origin(s); Vite may run on 5173 or 8080
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim()).filter(Boolean)
  : ["http://localhost:5173", "http://localhost:8080", "http://10.201.79.35:8080"];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "nomadtrack",
  waitForConnections: true,
  connectionLimit: 10,
});

// SMTP transporter for password reset emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function normalizeRole(row) {
  if (row?.role === "admin" || row?.role === "user") return row.role;
  // Backward compatibility if DB still uses legacy is_admin
  return row?.is_admin ? "admin" : "user";
}

// Smart Nomad Score: computed from internet, safety, cost affordability, climate (algorithm-driven)
function calculateNomadScore(row) {
  const internet = (row.internet_speed || 0) * 0.3;
  const safety = (row.safety_score || 0) * 10 * 0.2;
  const costAffordability = (100 - (row.cost_index || 0)) * 0.3;
  const climateScore = ((50 - Math.abs((row.temperature_avg || 22) - 22)) / 50) * 100 * 0.2;
  return Math.min(100, Math.max(0, Math.round(internet + safety + costAffordability + climateScore)));
}

// Helper: convert snake_case DB rows to camelCase for frontend (nomadScore is computed)
function toCamelCase(row) {
  return {
    id: row.id,
    city: row.city,
    country: row.country,
    continent: row.continent,
    costIndex: row.cost_index,
    internetSpeed: row.internet_speed,
    safetyScore: row.safety_score,
    climate: row.climate,
    nomadScore: calculateNomadScore(row),
    rent: row.rent,
    foodCost: row.food_cost,
    transportCost: row.transport_cost,
    coworkingCost: row.coworking_cost,
    temperatureAvg: row.temperature_avg,
    latitude: row.latitude,
    longitude: row.longitude,
    image: row.image,
  };
}

// ==================
// AUTH ROUTES
// ==================

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.insertId, email, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, role: "user" },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const role = normalizeRole(user);
    const token = jwt.sign({ id: user.id, email: user.email, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/forgot-password — send reset email with one-time token
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [users] = await pool.query("SELECT id, email FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      // Never reveal whether email exists
      return res.json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const logoPath = path.resolve(__dirname, "..", "frontend", "public", "normadlogomail.png");

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Reset your NomadTrack password",
      attachments: [
        {
          filename: "normadlogomail.png",
          path: logoPath,
          cid: "nomadtrack-logo",
        },
      ],
      html: `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0b1220; padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#020617;border-radius:16px;border:1px solid #1f2937;box-shadow:0 24px 60px rgba(15,23,42,0.85);overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #1f2937;background:linear-gradient(135deg,#0f172a,#020617);display:flex;align-items:center;gap:10px;">
        <img src="cid:nomadtrack-logo" alt="NomadTrack" width="32" height="32" style="display:block;width:32px;height:32px;border-radius:12px;object-fit:cover" />
        <div>
          <div style="font-size:14px;color:#e5e7eb;font-weight:600;">NomadTrack</div>
          <div style="font-size:12px;color:#9ca3af;">Password reset request</div>
        </div>
      </div>

      <div style="padding:24px 24px 8px 24px;color:#e5e7eb;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 12px 0;">Hi,</p>
        <p style="margin:0 0 16px 0;">
          We received a request to reset the password for your <strong>NomadTrack</strong> account.
        </p>

        <div style="margin:24px 0;">
          <a href="${resetLink}" target="_blank" rel="noreferrer"
             style="display:inline-block;padding:10px 18px;border-radius:999px;background:#0ea5e9;color:#0f172a;font-weight:600;font-size:14px;text-decoration:none;">
            Reset password
          </a>
        </div>

        <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;">
          This link will expire in <strong>30 minutes</strong>. If you didn’t request this, you can safely ignore this email.
        </p>

        <p style="margin:16px 0 0 0;font-size:12px;color:#6b7280;">
          If the button doesn’t work, copy and paste this link into your browser:<br />
          <span style="word-break:break-all;color:#9ca3af;">${resetLink}</span>
        </p>
      </div>

      <div style="padding:12px 24px 18px 24px;border-top:1px solid #111827;font-size:11px;color:#6b7280;">
        NomadTrack · Digital nomad city insights
      </div>
    </div>
  </div>
`,
    });

    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/reset-password — set a new password using token
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()",
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const reset = rows[0];

    // Ensure new password is not the same as current password
    const [users] = await pool.query("SELECT password FROM users WHERE id = ?", [reset.user_id]);
    if (users.length === 0) {
      return res.status(400).json({ message: "User for this token no longer exists" });
    }
    const current = users[0];
    const isSame = await bcrypt.compare(password, current.password);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different from your current password." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, reset.user_id]);
    await pool.query("UPDATE password_resets SET used = 1 WHERE id = ?", [reset.id]);

    res.json({ message: "Password reset successfully. You can now sign in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, bio, location, created_at, role, COALESCE(is_admin, 0) AS is_admin FROM users WHERE id = ?",
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const row = users[0];
    const role = normalizeRole(row);
    res.json({ user: { id: row.id, name: row.name, email: row.email, bio: row.bio, location: row.location, created_at: row.created_at, role } });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/auth/profile
app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { bio, location } = req.body;
    await pool.query("UPDATE users SET bio = ?, location = ? WHERE id = ?", [bio || null, location || null, req.user.id]);
    const [users] = await pool.query("SELECT id, name, email, bio, location, role, COALESCE(is_admin, 0) AS is_admin FROM users WHERE id = ?", [req.user.id]);
    const row = users[0];
    res.json({ user: { id: row.id, name: row.name, email: row.email, bio: row.bio, location: row.location, role: normalizeRole(row) } });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----- Google OAuth -----
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const OAUTH_PLACEHOLDER_PASSWORD = bcrypt.hashSync("oauth-google-placeholder", 10);

// GET /api/auth/google — redirect to Google consent screen
app.get("/api/auth/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: "Google sign-in is not configured" });
  }
  const base = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const redirectUri = `${base}/api/auth/google/callback`;
  const scope = "email profile";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
  res.redirect(url);
});

// GET /api/auth/google/callback — exchange code for tokens, get user, create/find user, redirect to frontend with JWT
app.get("/api/auth/google/callback", async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

  if (error || !code) {
    return res.redirect(`${frontendUrl}/?error=access_denied`);
  }
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/?error=google_not_configured`);
  }

  try {
    const base = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const redirectUri = `${base}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token error:", err);
      return res.redirect(`${frontendUrl}/?error=token_exchange_failed`);
    }
    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      console.error("Google userinfo error:", userRes.status);
      return res.redirect(`${frontendUrl}/?error=userinfo_failed`);
    }
    const googleUser = await userRes.json();
    const email = googleUser.email;
    const name = googleUser.name || email.split("@")[0] || "User";

    const [existing] = await pool.query("SELECT id, name, email, role, COALESCE(is_admin, 0) AS is_admin FROM users WHERE email = ?", [email]);
    let userId, userName, userRole;
    if (existing.length > 0) {
      userId = existing[0].id;
      userName = existing[0].name;
      userRole = normalizeRole(existing[0]);
    } else {
      const [insert] = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
        [name, email, OAUTH_PLACEHOLDER_PASSWORD]
      );
      userId = insert.insertId;
      userName = name;
      userRole = "user";
    }

    const token = jwt.sign({ id: userId, email, role: userRole || "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${frontendUrl}/#token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${frontendUrl}/?error=server_error`);
  }
});

// ==================
// CITY ROUTES
// ==================

// GET /api/cities
app.get("/api/cities", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cities ORDER BY nomad_score DESC");
    res.json(rows.map(toCamelCase));
  } catch (err) {
    console.error("Get cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cities/top
app.get("/api/cities/top", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const [rows] = await pool.query("SELECT * FROM cities");
    const cities = rows.map(toCamelCase).sort((a, b) => b.nomadScore - a.nomadScore).slice(0, limit);
    res.json(cities);
  } catch (err) {
    console.error("Get top cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cities/compare
app.get("/api/cities/compare", async (req, res) => {
  try {
    const ids = (req.query.ids || "").split(",").map(Number).filter(Boolean);
    if (ids.length === 0) {
      return res.status(400).json({ message: "Provide city IDs as ?ids=1,2,3" });
    }
    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await pool.query(`SELECT * FROM cities WHERE id IN (${placeholders})`, ids);
    res.json(rows.map(toCamelCase));
  } catch (err) {
    console.error("Compare cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cities/cheapest
app.get("/api/cities/cheapest", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const [rows] = await pool.query("SELECT * FROM cities ORDER BY cost_index ASC LIMIT ?", [limit]);
    res.json(rows.map(toCamelCase));
  } catch (err) {
    console.error("Get cheapest cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cities/fastest
app.get("/api/cities/fastest", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const [rows] = await pool.query("SELECT * FROM cities ORDER BY internet_speed DESC LIMIT ?", [limit]);
    res.json(rows.map(toCamelCase));
  } catch (err) {
    console.error("Get fastest internet cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================
// ANALYTICS ROUTE
// ==================

// GET /api/analytics — live platform insights (aggregations + dynamic nomad score)
app.get("/api/analytics", async (req, res) => {
  try {
    const [[{ totalCities }]] = await pool.query("SELECT COUNT(*) AS totalCities FROM cities");
    const [cityRows] = await pool.query("SELECT * FROM cities");
    const avgNomadScore = cityRows.length
      ? Math.round(cityRows.reduce((sum, row) => sum + calculateNomadScore(row), 0) / cityRows.length)
      : 0;
    const [[cheapest]] = await pool.query("SELECT city FROM cities ORDER BY cost_index ASC LIMIT 1");
    const [[fastest]] = await pool.query("SELECT city FROM cities ORDER BY internet_speed DESC LIMIT 1");

    const [favRows] = await pool.query(
      `SELECT c.city, COUNT(f.id) AS fav_count
       FROM favorites f JOIN cities c ON f.city_id = c.id
       GROUP BY f.city_id ORDER BY fav_count DESC LIMIT 1`
    );

    res.json({
      totalCities: Number(totalCities),
      avgNomadScore,
      cheapestCity: cheapest?.city || "—",
      fastestInternet: fastest?.city || "—",
      mostFavorited: favRows.length > 0 ? favRows[0].city : "—",
      mostFavoritedCount: favRows.length > 0 ? Number(favRows[0].fav_count) : 0,
    });
  } catch (err) {
    console.error("Get analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cities/:id  (must be AFTER named routes)
app.get("/api/cities/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cities WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error("Get city error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================
// FAVORITES ROUTES
// ==================

// GET /api/favorites
app.get("/api/favorites", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT f.id, f.city_id, c.* FROM favorites f JOIN cities c ON f.city_id = c.id WHERE f.user_id = ?",
      [req.user.id]
    );
    res.json(rows.map(row => ({ ...toCamelCase(row), city_id: row.city_id })));
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/favorites
app.post("/api/favorites", authenticateToken, async (req, res) => {
  try {
    const { cityId } = req.body;
    if (!cityId) return res.status(400).json({ message: "cityId is required" });

    await pool.query("INSERT IGNORE INTO favorites (user_id, city_id) VALUES (?, ?)", [req.user.id, cityId]);
    res.status(201).json({ message: "Added to favorites" });
  } catch (err) {
    console.error("Add favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/favorites/:cityId
app.delete("/api/favorites/:cityId", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM favorites WHERE user_id = ? AND city_id = ?", [req.user.id, req.params.cityId]);
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Remove favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================
// ADMIN ROUTES (auth + admin only)
// ==================

// GET /api/admin/analytics — overview for control console
app.get("/api/admin/analytics", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[{ totalCities }]] = await pool.query("SELECT COUNT(*) AS totalCities FROM cities");
    const [[{ totalFavorites }]] = await pool.query("SELECT COUNT(*) AS totalFavorites FROM favorites");

    const [favRows] = await pool.query(
      `SELECT c.city, COUNT(f.id) AS fav_count
       FROM favorites f JOIN cities c ON f.city_id = c.id
       GROUP BY f.city_id ORDER BY fav_count DESC LIMIT 5`
    );

    const topFavoritedCities = favRows.map(row => ({
      city: row.city,
      favorites: Number(row.fav_count),
    }));

    res.json({
      totalUsers: Number(totalUsers),
      totalCities: Number(totalCities),
      totalFavorites: Number(totalFavorites),
      mostFavoritedCity: topFavoritedCities.length ? topFavoritedCities[0].city : "—",
      apiStatus: "online",
      dbStatus: "connected",
      uptimeSeconds: Math.floor((Date.now() - SERVER_STARTED_AT) / 1000),
      topFavoritedCities,
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/users — list users
app.get("/api/admin/users", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, created_at, role, COALESCE(is_admin, 0) AS is_admin FROM users ORDER BY created_at DESC");
    res.json(rows.map(r => ({ id: r.id, name: r.name, email: r.email, createdAt: r.created_at, role: normalizeRole(r) })));
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/users/:id — delete user
app.delete("/api/admin/users/:id", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!targetId) return res.status(400).json({ message: "Invalid user id" });
    const [r] = await pool.query("DELETE FROM users WHERE id = ?", [targetId]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/users/:id/favorites — view a user's favorites
app.get("/api/admin/users/:id/favorites", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const [rows] = await pool.query(
      "SELECT f.id, f.city_id, c.* FROM favorites f JOIN cities c ON f.city_id = c.id WHERE f.user_id = ?",
      [userId]
    );
    res.json(rows.map(row => ({ ...toCamelCase(row), city_id: row.city_id })));
  } catch (err) {
    console.error("Admin user favorites error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/cities — list all cities
app.get("/api/admin/cities", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cities ORDER BY city");
    res.json(rows.map(toCamelCase));
  } catch (err) {
    console.error("Admin cities list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/cities — create city
app.post("/api/admin/cities", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const b = req.body;
    if (!b.city || !b.country || !b.continent) return res.status(400).json({ message: "city, country, continent required" });
    const [r] = await pool.query(
      `INSERT INTO cities (city, country, continent, cost_index, internet_speed, safety_score, climate, nomad_score, rent, food_cost, transport_cost, coworking_cost, temperature_avg, latitude, longitude, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.city, b.country, b.continent, b.costIndex ?? 0, b.internetSpeed ?? 0, b.safetyScore ?? 0, b.climate ?? "", b.nomadScore ?? 0, b.rent ?? 0, b.foodCost ?? 0, b.transportCost ?? 0, b.coworkingCost ?? 0, b.temperatureAvg ?? 20, b.latitude ?? 0, b.longitude ?? 0, b.image || null]
    );
    const [rows] = await pool.query("SELECT * FROM cities WHERE id = ?", [r.insertId]);
    res.status(201).json(toCamelCase(rows[0]));
  } catch (err) {
    console.error("Admin create city error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/cities/:id — update city
app.put("/api/admin/cities/:id", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = req.body;
    await pool.query(
      `UPDATE cities SET city=?, country=?, continent=?, cost_index=?, internet_speed=?, safety_score=?, climate=?, nomad_score=?, rent=?, food_cost=?, transport_cost=?, coworking_cost=?, temperature_avg=?, latitude=?, longitude=?, image=? WHERE id=?`,
      [b.city, b.country, b.continent, b.costIndex, b.internetSpeed, b.safetyScore, b.climate, b.nomadScore ?? 0, b.rent, b.foodCost, b.transportCost, b.coworkingCost, b.temperatureAvg, b.latitude, b.longitude, b.image || null, id]
    );
    const [rows] = await pool.query("SELECT * FROM cities WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "City not found" });
    res.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error("Admin update city error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/cities/:id — archive then delete
app.delete("/api/admin/cities/:id", authenticateToken, requireAdmin(), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const id = Number(req.params.id);
    await conn.beginTransaction();

    const [rows] = await conn.query("SELECT * FROM cities WHERE id = ?", [id]);
    if (rows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: "City not found" });
    }
    const row = rows[0];

    await conn.query(
      `INSERT INTO deleted_cities (
        original_city_id, city, country, continent, cost_index, internet_speed, safety_score, climate,
        nomad_score, rent, food_cost, transport_cost, coworking_cost, temperature_avg, latitude, longitude,
        image, import_batch_id, deleted_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        row.id,
        row.city,
        row.country,
        row.continent,
        row.cost_index,
        row.internet_speed,
        row.safety_score,
        row.climate,
        row.nomad_score,
        row.rent,
        row.food_cost,
        row.transport_cost,
        row.coworking_cost,
        row.temperature_avg,
        row.latitude,
        row.longitude,
        row.image,
        row.import_batch_id ?? null,
        req.user?.id ?? null,
      ]
    );

    await conn.query("DELETE FROM cities WHERE id = ?", [id]);
    await conn.commit();
    conn.release();

    res.json({ message: "Deleted (archived)" });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("Admin delete city error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/import-cities — bulk import from parsed CSV rows, tracked as a batch
app.post("/api/admin/import-cities", authenticateToken, requireAdmin(), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const filename = req.body?.filename || "cities.csv";
    if (!rows.length) {
      conn.release();
      return res.status(400).json({ message: "rows array is required" });
    }

    await conn.beginTransaction();

    // Create import batch record
    const [batchResult] = await conn.query(
      "INSERT INTO city_import_batches (filename, imported_by) VALUES (?, ?)",
      [filename, req.user?.id ?? null]
    );
    const batchId = batchResult.insertId;

    const values = rows.map((b) => [
      b.city,
      b.country,
      b.continent,
      b.costIndex ?? 0,
      b.internetSpeed ?? 0,
      b.safetyScore ?? 0,
      b.climate ?? "",
      b.nomadScore ?? 0,
      b.rent ?? 0,
      b.foodCost ?? 0,
      b.transportCost ?? 0,
      b.coworkingCost ?? 0,
      b.temperatureAvg ?? 20,
      b.latitude ?? 0,
      b.longitude ?? 0,
      b.image || null,
      batchId,
    ]);

    const placeholders = values.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").join(",");
    await conn.query(
      `INSERT INTO cities (city, country, continent, cost_index, internet_speed, safety_score, climate, nomad_score, rent, food_cost, transport_cost, coworking_cost, temperature_avg, latitude, longitude, image, import_batch_id)
       VALUES ${placeholders}`,
      values.flat()
    );

    await conn.commit();
    conn.release();

    res.status(201).json({ message: `Imported ${rows.length} cities`, batchId });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("Admin import cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/import-batches — list CSV import batches with summary
app.get("/api/admin/import-batches", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id,
              b.filename,
              b.created_at,
              b.imported_by,
              u.email AS imported_by_email,
              COUNT(c.id) AS city_count
       FROM city_import_batches b
       LEFT JOIN users u ON b.imported_by = u.id
       LEFT JOIN cities c ON c.import_batch_id = b.id
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    );

    const result = rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      createdAt: r.created_at,
      importedByEmail: r.imported_by_email || null,
      cityCount: Number(r.city_count) || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Admin import batches error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/import-batches/:id/cities — list cities for a given batch
app.get("/api/admin/import-batches/:id/cities", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const batchId = Number(req.params.id);
    if (!batchId) return res.status(400).json({ message: "Invalid batch id" });

    const [rows] = await pool.query("SELECT * FROM cities WHERE import_batch_id = ? ORDER BY city", [batchId]);
    res.json(rows.map(toCamelCase));
  } catch (err) {
    console.error("Admin import batch cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/import-batches/:id/cities — archive then delete all cities for a given batch
app.delete("/api/admin/import-batches/:id/cities", authenticateToken, requireAdmin(), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const batchId = Number(req.params.id);
    if (!batchId) {
      conn.release();
      return res.status(400).json({ message: "Invalid batch id" });
    }

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO deleted_cities (
        original_city_id, city, country, continent, cost_index, internet_speed, safety_score, climate,
        nomad_score, rent, food_cost, transport_cost, coworking_cost, temperature_avg, latitude, longitude,
        image, import_batch_id, deleted_by
      )
      SELECT
        c.id, c.city, c.country, c.continent, c.cost_index, c.internet_speed, c.safety_score, c.climate,
        c.nomad_score, c.rent, c.food_cost, c.transport_cost, c.coworking_cost, c.temperature_avg,
        c.latitude, c.longitude, c.image, c.import_batch_id, ?
      FROM cities c
      WHERE c.import_batch_id = ?`,
      [req.user?.id ?? null, batchId]
    );

    const [result] = await conn.query("DELETE FROM cities WHERE import_batch_id = ?", [batchId]);

    await conn.commit();
    conn.release();

    res.json({ message: `Deleted ${result.affectedRows} cities from batch (archived)` });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("Admin delete batch cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/import-batches/:id — delete batch history record (does not touch cities)
app.delete("/api/admin/import-batches/:id", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const batchId = Number(req.params.id);
    if (!batchId) return res.status(400).json({ message: "Invalid batch id" });

    const [result] = await pool.query("DELETE FROM city_import_batches WHERE id = ?", [batchId]);
    // Even if nothing was deleted, respond with 200 so UI can clean up stale entries
    const msg = result.affectedRows === 0 ? "Batch not found (already removed)" : "Import batch deleted";
    res.json({ message: msg });
  } catch (err) {
    console.error("Admin delete import batch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/deleted-cities — list archived deleted cities (recent first)
app.get("/api/admin/deleted-cities", authenticateToken, requireAdmin(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.id,
              d.city,
              d.country,
              d.continent,
              d.deleted_at,
              u.email AS deleted_by_email
       FROM deleted_cities d
       LEFT JOIN users u ON d.deleted_by = u.id
       ORDER BY d.deleted_at DESC
       LIMIT 200`
    );

    const result = rows.map((r) => ({
      id: r.id,
      city: r.city,
      country: r.country,
      continent: r.continent,
      deletedAt: r.deleted_at,
      deletedByEmail: r.deleted_by_email || null,
    }));

    res.json(result);
  } catch (err) {
    console.error("Admin deleted cities error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/deleted-cities/:id/restore — restore a deleted city from archive
app.post("/api/admin/deleted-cities/:id/restore", authenticateToken, requireAdmin(), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const archiveId = Number(req.params.id);
    await conn.beginTransaction();

    const [rows] = await conn.query("SELECT * FROM deleted_cities WHERE id = ?", [archiveId]);
    if (rows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: "Archived city not found" });
    }
    const d = rows[0];

    const [insertResult] = await conn.query(
      `INSERT INTO cities (
        city, country, continent, cost_index, internet_speed, safety_score, climate,
        nomad_score, rent, food_cost, transport_cost, coworking_cost, temperature_avg,
        latitude, longitude, image, import_batch_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        d.city,
        d.country,
        d.continent,
        d.cost_index,
        d.internet_speed,
        d.safety_score,
        d.climate,
        d.nomad_score,
        d.rent,
        d.food_cost,
        d.transport_cost,
        d.coworking_cost,
        d.temperature_avg,
        d.latitude,
        d.longitude,
        d.image,
        d.import_batch_id ?? null,
      ]
    );

    await conn.query("DELETE FROM deleted_cities WHERE id = ?", [archiveId]);

    const [restoredRows] = await conn.query("SELECT * FROM cities WHERE id = ?", [insertResult.insertId]);

    await conn.commit();
    conn.release();

    res.json({ city: toCamelCase(restoredRows[0]) });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("Admin restore city error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`NomadTrack API running on http://localhost:${PORT}`);
});
