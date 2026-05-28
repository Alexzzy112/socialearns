const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAdminDashboard,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  getAllUsers,
  getUserById,
  suspendUser,
  deleteUser,
  activateUserAccount,
  creditUser,
  getAllWithdrawals,
  approveWithdrawal,
  reverseWithdrawal,
  deleteWithdrawal,
  getAllDeposits,
  approveDeposit,
  reverseDeposit,
  deleteDeposit,
  sendAnnouncement,
  getAnnouncements,
  getPlatformStats,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/stats', getPlatformStats);

router.get('/tasks', getAllTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.get('/submissions', getPendingSubmissions);
router.put('/submissions/:id/approve', approveSubmission);
router.put('/submissions/:id/reject', rejectSubmission);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUserAccount);
router.put('/users/:id/credit', creditUser);
router.delete('/users/:id', deleteUser);

router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reverse', reverseWithdrawal);
router.put('/withdrawals/:id/delete', deleteWithdrawal);

router.get('/deposits', getAllDeposits);
router.put('/deposits/:id/approve', approveDeposit);
router.put('/deposits/:id/reverse', reverseDeposit);
router.put('/deposits/:id/delete', deleteDeposit);

router.post('/announcements', sendAnnouncement);
router.get('/announcements', getAnnouncements);

module.exports = router;
