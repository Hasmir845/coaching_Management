const express = require('express');
const router = express.Router();
const slotAttendanceController = require('../controllers/slotAttendanceController');

router.get('/checklist', slotAttendanceController.getChecklistForDate);
router.get('/week-summary', slotAttendanceController.getWeekTeacherSummary);
router.get('/taken-register', slotAttendanceController.getTakenClassRegister);
router.post('/', slotAttendanceController.upsertSlotAttendance);

module.exports = router;
