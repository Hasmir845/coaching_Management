const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// CRUD routes for batches
router.get('/', batchController.getBatches);
router.post('/', batchController.createBatch);
router.get('/search', batchController.searchBatches);
router.get('/:id', batchController.getBatchById);
router.put('/:id', batchController.updateBatch);
router.delete('/:id', batchController.deleteBatch);
router.delete('/:id/teachers/:teacherId', batchController.removeTeacher);
router.post('/:id/teachers', batchController.assignTeacher);
router.post('/:id/students', batchController.addStudent);
router.delete('/:id/students/:studentId', batchController.removeStudent);

module.exports = router;
