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

// Middleware — FRONTEND_URL on Vercel: one origin or comma-separated (prod + Netlify previews)
const frontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);
if (frontendOrigins.length === 1) {
  app.use(cors({ origin: frontendOrigins[0], credentials: true }));
} else if (frontendOrigins.length > 1) {
  app.use(cors({ origin: frontendOrigins, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
dbConnect();

// Root (opening the deployment URL without /api/...)
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Coaching API',
    health: '/api/health',
  });
});

// Routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/class-tracking', classTrackingRoutes);
app.use('/api/slot-attendance', slotAttendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/finance', financeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Local / traditional host only — Vercel loads `api/index.js` → this file (no listen)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
