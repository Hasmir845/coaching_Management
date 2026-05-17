const express = require('express');
const router = express.Router();
const { checkAuthUser } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes - read-only, authentication required
router.get('/stats', checkAuthUser, dashboardController.getStats);
router.get('/today-classes', checkAuthUser, dashboardController.getTodayClasses);
router.get('/weekly-schedule', checkAuthUser, dashboardController.getWeeklySchedule);
router.get('/absent-teachers', checkAuthUser, dashboardController.getAbsentTeachers);
router.get('/recent-activities', checkAuthUser, dashboardController.getRecentActivities);

module.exports = router;
