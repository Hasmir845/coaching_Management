const express = require('express');
const router = express.Router();
const { checkAuthUser } = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');

// Reports routes - read-only, authentication required
router.get('/teacher-class-count', checkAuthUser, reportsController.getTeacherClassCount);
router.get('/absent-count', checkAuthUser, reportsController.getAbsentCount);
router.get('/batch-history/:batchId', checkAuthUser, reportsController.getBatchClassHistory);

module.exports = router;
