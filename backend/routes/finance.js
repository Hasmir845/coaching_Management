const express = require('express');
const router = express.Router();
const { checkAuthUser, requireAdmin } = require('../middleware/auth');
const financeController = require('../controllers/financeController');

// Read-only routes - authentication required
router.get('/summary', checkAuthUser, financeController.getSummary);
router.get('/', checkAuthUser, financeController.getEntries);

// Admin only - data modification
router.post('/', checkAuthUser, requireAdmin, financeController.createEntry);
router.put('/:id', checkAuthUser, requireAdmin, financeController.updateEntry);
router.delete('/:id', checkAuthUser, requireAdmin, financeController.deleteEntry);

module.exports = router;
