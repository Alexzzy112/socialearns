const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  sendEmailVerification,
  verifyEmail,
  sendPhoneVerification,
  verifyPhone,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-email-verification', protect, sendEmailVerification);
router.post('/verify-email', protect, verifyEmail);
router.post('/send-phone-verification', protect, sendPhoneVerification);
router.post('/verify-phone', protect, verifyPhone);

module.exports = router;
