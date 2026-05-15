require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/db');

// Import routes
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const batchRoutes = require('./routes/batches');
const classTrackingRoutes = require('./routes/classTracking');
const slotAttendanceRoutes = require('./routes/slotAttendance');
const dashboardRoutes = require('./routes/dashboard');
const reportsRoutes = require('./routes/reports');
const financeRoutes = require('./routes/finance');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — FRONTEND_URL + any *.netlify.app (common misconfig: wrong exact Netlify URL)
const frontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  if (frontendOrigins.includes(origin)) return callback(null, true);

  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol === 'https:' || protocol === 'http:') {
      if (hostname.endsWith('.netlify.app') || hostname.endsWith('.netlify.live')) {
        return callback(null, true);
      }
      // Custom domain (e.g. Netlify custom URL) — allow https; set FRONTEND_URL to lock down
      if (protocol === 'https:') {
        return callback(null, true);
      }
    }
  } catch {
    /* ignore */
  }

  if (frontendOrigins.length === 0) return callback(null, true);
  console.warn('CORS blocked origin:', origin, 'FRONTEND_URL:', frontendOrigins);
  return callback(new Error(`CORS: ${origin} not allowed`));
}

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root (opening the deployment URL without /api/...)
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Coaching API',
    health: '/api/health',
  });
});

// Health check (no DB required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Middleware to ensure DB is connected before handling data requests
const ensureDbConnected = async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    console.error('DB connection failed:', error.message);
    res.status(503).json({ message: 'Database connection failed', error: error.message });
  }
};

// Routes with DB connection middleware
app.use('/api/teachers', ensureDbConnected, teacherRoutes);
app.use('/api/students', ensureDbConnected, studentRoutes);
app.use('/api/batches', ensureDbConnected, batchRoutes);
app.use('/api/class-tracking', ensureDbConnected, classTrackingRoutes);
app.use('/api/slot-attendance', ensureDbConnected, slotAttendanceRoutes);
app.use('/api/dashboard', ensureDbConnected, dashboardRoutes);
app.use('/api/reports', ensureDbConnected, reportsRoutes);
app.use('/api/finance', ensureDbConnected, financeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Local only — Vercel imports via api/index.js (no listen)
if (require.main === module) {
  dbConnect()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;
