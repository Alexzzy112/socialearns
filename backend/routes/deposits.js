const express = require('express');
const router = express.Router();
const {
  initializeDeposit,
  verifyPaystackPayment,
  getUserDeposits,
  createManualDeposit,
} = require('../controllers/depositController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/initialize', protect, initializeDeposit);
router.post('/verify', protect, verifyPaystackPayment);
router.post('/manual', protect, upload.single('screenshot'), createManualDeposit);
router.get('/', protect, getUserDeposits);

module.exports = router;
