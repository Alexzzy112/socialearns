const express = require('express');
const router = express.Router();
const { getReferralInfo } = require('../controllers/referralController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getReferralInfo);

module.exports = router;
