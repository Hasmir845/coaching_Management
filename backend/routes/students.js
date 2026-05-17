const express = require('express');
const router = express.Router();
const { checkAuthUser, requireAdmin } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Public read - anyone can view
router.get('/', checkAuthUser, studentController.getStudents);
router.get('/batch/:batchId', checkAuthUser, studentController.getStudentsByBatch);
router.get('/search', checkAuthUser, studentController.searchStudents);
router.get('/:id', checkAuthUser, studentController.getStudentById);

// Admin only - data modification
router.post('/', checkAuthUser, requireAdmin, studentController.createStudent);
router.put('/:id', checkAuthUser, requireAdmin, studentController.updateStudent);
router.delete('/:id', checkAuthUser, requireAdmin, studentController.deleteStudent);

module.exports = router;
