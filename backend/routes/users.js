const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  updatePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.get('/dashboard', protect, getUserDashboard);
router.put('/password', protect, updatePassword);

module.exports = router;
