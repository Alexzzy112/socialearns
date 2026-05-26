const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getLeaderboard);

module.exports = router;
