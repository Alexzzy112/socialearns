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
const handleTaskUpload = (req, res, next) => {
  upload.single('screenshot')(req, res, (err) => {
    if (err) {
      const message = err.message || 'Upload failed. Check file size (max 5MB) and type (images only).';
      return res.status(err.status || 400).json({ message });
    }
    next();
  });
};

router.post('/:id/submit', protect, handleTaskUpload, submitTask);

module.exports = router;
