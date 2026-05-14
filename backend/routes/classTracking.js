const express = require('express');
const router = express.Router();
const classTrackingController = require('../controllers/classTrackingController');

// CRUD routes for class tracking
router.get('/', classTrackingController.getClassTracking);
router.post('/', classTrackingController.createClassTracking);
router.get('/date/:date', classTrackingController.getByDate);
router.get('/batch/:batchId', classTrackingController.getByBatch);
router.get('/:id', classTrackingController.getClassTrackingById);
router.put('/:id', classTrackingController.updateClassTracking);
router.delete('/:id', classTrackingController.deleteClassTracking);

module.exports = router;
