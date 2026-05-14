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

// Middleware — optional strict CORS to your Netlify URL (set FRONTEND_URL on Vercel)
const frontendOrigin = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
if (frontendOrigin) {
  app.use(cors({ origin: frontendOrigin, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
dbConnect();

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

// Local / traditional host only — Vercel invokes `api/index.js` without listen()
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
