const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes
router.get('/stats', dashboardController.getStats);
router.get('/today-classes', dashboardController.getTodayClasses);
router.get('/weekly-schedule', dashboardController.getWeeklySchedule);
router.get('/absent-teachers', dashboardController.getAbsentTeachers);
router.get('/recent-activities', dashboardController.getRecentActivities);

module.exports = router;
