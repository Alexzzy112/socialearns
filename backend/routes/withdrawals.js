const express = require('express');
const router = express.Router();
const {
  requestWithdrawal,
  getUserWithdrawals,
  getWithdrawalById,
} = require('../controllers/withdrawalController');
const { protect } = require('../middleware/auth');

router.post('/', protect, requestWithdrawal);
router.get('/', protect, getUserWithdrawals);
router.get('/:id', protect, getWithdrawalById);

module.exports = router;
