const express = require('express');
const router = express.Router();
const { checkAuthUser, requireAdmin } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

// Public read - anyone can view
router.get('/', checkAuthUser, teacherController.getTeachers);
router.get('/search', checkAuthUser, teacherController.searchTeachers);
router.get('/:id', checkAuthUser, teacherController.getTeacherById);

// Admin only - data modification
router.post('/', checkAuthUser, requireAdmin, teacherController.createTeacher);
router.put('/:id', checkAuthUser, requireAdmin, teacherController.updateTeacher);
router.delete('/:id', checkAuthUser, requireAdmin, teacherController.deleteTeacher);
router.post('/:id/assign-batch', checkAuthUser, requireAdmin, teacherController.assignBatch);

module.exports = router;
