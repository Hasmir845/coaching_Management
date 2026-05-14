const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Reports routes
router.get('/teacher-class-count', reportsController.getTeacherClassCount);
router.get('/absent-count', reportsController.getAbsentCount);
router.get('/batch-history/:batchId', reportsController.getBatchClassHistory);

module.exports = router;
