const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// CRUD routes for students
router.get('/', studentController.getStudents);
router.post('/', studentController.createStudent);
router.get('/batch/:batchId', studentController.getStudentsByBatch);
router.get('/search', studentController.searchStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
