const express = require('express');
const router = express.Router();
const { checkAuthUser } = require('../middleware/auth');
const slotAttendanceController = require('../controllers/slotAttendanceController');

// Read-only routes - authentication required
router.get('/checklist', checkAuthUser, slotAttendanceController.getChecklistForDate);
router.get('/week-summary', checkAuthUser, slotAttendanceController.getWeekTeacherSummary);
router.get('/taken-register', checkAuthUser, slotAttendanceController.getTakenClassRegister);

// Attendance marking - teachers can mark attendance (checkAuthUser only, no admin required)
router.post('/', checkAuthUser, slotAttendanceController.upsertSlotAttendance);

module.exports = router;
