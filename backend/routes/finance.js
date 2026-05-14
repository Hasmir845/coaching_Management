const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

router.get('/summary', financeController.getSummary);
router.get('/', financeController.getEntries);
router.post('/', financeController.createEntry);
router.put('/:id', financeController.updateEntry);
router.delete('/:id', financeController.deleteEntry);

module.exports = router;
