require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initDB } = require('./models/employeeModel');

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS — restrict to ALLOWED_ORIGIN ────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── HTTP request logging ──────────────────────────────────────
app.use(morgan(isDev ? 'dev' : 'combined'));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json());

// ── Serve React build (production) ───────────────────────────
// In development the Vite dev server (port 5173) serves the frontend.
// In production (Docker / `npm start`) Express serves the compiled React
// app from frontend-react/dist.
const distPath = path.join(__dirname, '../frontend-react/dist');
app.use(express.static(distPath));
// Fallback: send index.html for any non-API route (React Router support)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Rate limiting on login endpoint ──────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 attempts per window
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Dashboard stats (protected)
const authMiddleware = require('./middleware/authMiddleware');
app.get('/api/dashboard/stats', authMiddleware, require('./controllers/dashboardController').getStats);

// ── Central error handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start server only when run directly (not during tests) ────
if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  });
}

module.exports = app;
