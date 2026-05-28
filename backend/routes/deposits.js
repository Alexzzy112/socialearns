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
const handleUpload = (req, res, next) => {
  upload.single('screenshot')(req, res, (err) => {
    if (err) {
      const message = err.message || 'Upload failed. Check file size (max 5MB) and type (images only).';
      return res.status(err.status || 400).json({ message });
    }
    next();
  });
};

router.post('/manual', protect, handleUpload, createManualDeposit);
router.get('/', protect, getUserDeposits);

module.exports = router;
