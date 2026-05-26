const express = require('express');
const router = express.Router();
const { getWallet, getWalletHistory, selfActivateAccount } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWallet);
router.get('/history', protect, getWalletHistory);
router.post('/activate', protect, selfActivateAccount);

module.exports = router;
