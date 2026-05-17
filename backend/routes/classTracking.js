const express = require('express');
const router = express.Router();
const { checkAuthUser, requireAdmin } = require('../middleware/auth');
const classTrackingController = require('../controllers/classTrackingController');

// Read-only routes - authentication required
router.get('/', checkAuthUser, classTrackingController.getClassTracking);
router.get('/date/:date', checkAuthUser, classTrackingController.getByDate);
router.get('/batch/:batchId', checkAuthUser, classTrackingController.getByBatch);
router.get('/:id', checkAuthUser, classTrackingController.getClassTrackingById);

// Admin only - data modification
router.post('/', checkAuthUser, requireAdmin, classTrackingController.createClassTracking);
router.put('/:id', checkAuthUser, requireAdmin, classTrackingController.updateClassTracking);
router.delete('/:id', checkAuthUser, requireAdmin, classTrackingController.deleteClassTracking);

module.exports = router;
