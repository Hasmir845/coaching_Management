const express = require('express');
const { checkAuthUser, requireAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  getCurrentUser,
  upsertUser,
  applyForAdmin,
  getPendingAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  applyForTeacher,
  getPendingTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
  makeAdmin,
  removeAdmin,
  removeTeacher,
  clearAdminRequest,
  clearTeacherRequest,
  assignTeacher,
  deleteUser,
  getTeachers,
} = require('../controllers/adminController');

const router = express.Router();

// Get current user info (no admin required, just auth)
router.get('/me', checkAuthUser, getCurrentUser);

// Upsert user on first login
router.post('/upsert', upsertUser);

// Apply for admin role
router.post('/apply', checkAuthUser, applyForAdmin);
router.post('/apply-teacher', checkAuthUser, applyForTeacher);

// All admin routes require admin check
router.get('/users', checkAuthUser, requireAdmin, getAllUsers);
router.get('/teachers', checkAuthUser, requireAdmin, getTeachers);
router.get('/applications', checkAuthUser, requireAdmin, getPendingAdminRequests);
router.get('/teacher-applications', checkAuthUser, requireAdmin, getPendingTeacherRequests);

router.post('/users/:userId/make-admin', checkAuthUser, requireAdmin, makeAdmin);
router.post('/users/:userId/remove-admin', checkAuthUser, requireAdmin, removeAdmin);
router.post('/users/:userId/approve-admin', checkAuthUser, requireAdmin, approveAdminRequest);
router.post('/users/:userId/reject-admin', checkAuthUser, requireAdmin, rejectAdminRequest);
router.post('/users/:userId/approve-teacher', checkAuthUser, requireAdmin, approveTeacherRequest);
router.post('/users/:userId/reject-teacher', checkAuthUser, requireAdmin, rejectTeacherRequest);
router.post('/users/:userId/clear-admin-request', checkAuthUser, requireAdmin, clearAdminRequest);
router.post('/users/:userId/clear-teacher-request', checkAuthUser, requireAdmin, clearTeacherRequest);
router.post('/users/:userId/remove-teacher', checkAuthUser, requireAdmin, removeTeacher);
router.post('/users/:userId/assign-teacher', checkAuthUser, requireAdmin, assignTeacher);

router.delete('/users/:userId', checkAuthUser, requireAdmin, deleteUser);

module.exports = router;
