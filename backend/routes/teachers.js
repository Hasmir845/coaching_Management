const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// CRUD routes for teachers
router.get('/', teacherController.getTeachers);
router.post('/', teacherController.createTeacher);
router.get('/search', teacherController.searchTeachers);
router.get('/:id', teacherController.getTeacherById);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);
router.post('/:id/assign-batch', teacherController.assignBatch);

module.exports = router;
