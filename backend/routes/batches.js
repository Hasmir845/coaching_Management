const express = require('express');
const router = express.Router();
const { checkAuthUser, requireAdmin } = require('../middleware/auth');
const batchController = require('../controllers/batchController');

// Public read - anyone can view
router.get('/', checkAuthUser, batchController.getBatches);
router.get('/search', checkAuthUser, batchController.searchBatches);
router.get('/:id', checkAuthUser, batchController.getBatchById);

// Admin only - data modification
router.post('/', checkAuthUser, requireAdmin, batchController.createBatch);
router.put('/:id', checkAuthUser, requireAdmin, batchController.updateBatch);
router.delete('/:id', checkAuthUser, requireAdmin, batchController.deleteBatch);
router.delete('/:id/teachers/:teacherId', checkAuthUser, requireAdmin, batchController.removeTeacher);
router.post('/:id/teachers', checkAuthUser, requireAdmin, batchController.assignTeacher);
router.post('/:id/students', checkAuthUser, requireAdmin, batchController.addStudent);
router.delete('/:id/students/:studentId', checkAuthUser, requireAdmin, batchController.removeStudent);

module.exports = router;
