const express = require('express');
const router = express.Router();
const {
  getAvailableTasks,
  getTaskById,
  submitTask,
  getUserSubmissions,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getAvailableTasks);
router.get('/submissions', protect, getUserSubmissions);
router.get('/:id', protect, getTaskById);
router.post('/:id/submit', protect, upload.single('screenshot'), submitTask);

module.exports = router;
