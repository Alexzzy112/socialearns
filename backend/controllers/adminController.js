const User = require('../models/User');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Withdrawal = require('../models/Withdrawal');
const Deposit = require('../models/Deposit');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const Wallet = require('../models/Wallet');
const { creditWallet, debitWallet } = require('./walletController');

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeUsers = await User.countDocuments({ role: { $ne: 'admin' }, isActive: true, isSuspended: false });
    const suspendedUsers = await User.countDocuments({ role: { $ne: 'admin' }, isSuspended: true });
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ isActive: true });
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });

    const totalEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarned' } } },
    ]);

    const totalWithdrawn = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalWithdrawn' } } },
    ]);

    const recentUsers = await User.find({ role: { $ne: 'admin' } }).sort('-createdAt').limit(10).select('name email role isActive isSuspended createdAt');
    const recentSubmissions = await Submission.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalTasks,
        activeTasks,
        pendingSubmissions,
        pendingWithdrawals,
        pendingDeposits,
        totalEarnings: totalEarnings[0]?.total || 0,
        totalWithdrawn: totalWithdrawn[0]?.total || 0,
      },
      recentUsers,
      recentSubmissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Submission.deleteMany({ task: req.params.id });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('task', 'title reward category')
      .sort('-createdAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('task', 'title reward');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Submission already processed' });
    }

    submission.status = 'approved';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    await creditWallet(
      submission.user,
      submission.task.reward,
      `Task reward: ${submission.task.title}`
    );

    await User.findByIdAndUpdate(submission.user, {
      $inc: { completedTasks: 1, pendingTasks: -1 },
    });

    await Notification.create({
      user: submission.user,
      title: 'Task Approved!',
      message: `Your submission for "${submission.task.title}" was approved. N${submission.task.reward} credited.`,
      type: 'success',
    });

    res.json({ message: 'Submission approved', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('task', 'title');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.status = 'rejected';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.adminNote = req.body.adminNote || 'Task requirements not met';
    await submission.save();

    await User.findByIdAndUpdate(submission.user, {
      $inc: { pendingTasks: -1 },
    });

    await Notification.create({
      user: submission.user,
      title: 'Task Rejected',
      message: `Your submission for "${submission.task.title}" was rejected. Reason: ${submission.adminNote}`,
      type: 'error',
    });

    res.json({ message: 'Submission rejected', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: { $ne: 'admin' } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password -emailVerificationToken -emailVerificationExpires -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const wallet = await Wallet.findOne({ user: user._id });
    res.json({ user, wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot suspend admin accounts' });
    user.isSuspended = !user.isSuspended;
    await user.save();

    await Notification.create({
      user: user._id,
      title: user.isSuspended ? 'Account Suspended' : 'Account Unsuspended',
      message: user.isSuspended
        ? 'Your account has been suspended. Contact support.'
        : 'Your account has been reinstated.',
      type: 'warning',
    });

    res.json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isAccountActivated) {
      return res.status(400).json({ message: 'Account is already activated' });
    }

    const amount = parseInt(process.env.ACTIVATION_FEE || '1500');

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: `Insufficient balance. User needs at least N${amount.toLocaleString()} in their wallet.` });
    }

    await debitWallet(user._id, amount, `Account activation fee: N${amount.toLocaleString()}`);

    user.isAccountActivated = true;
    await user.save();

    await Notification.create({
      user: user._id,
      title: 'Account Activated',
      message: `Your account has been activated. N${amount.toLocaleString()} activation fee debited. You can now earn!`,
      type: 'success',
    });

    res.json({ message: 'Account activated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const creditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const amount = req.body.amount || parseInt(process.env.ACTIVATION_FEE || '1500');
    const description = `Manual credit by admin: N${amount.toLocaleString()}`;

    await creditWallet(user._id, amount, description);

    if (!user.isAccountActivated) {
      user.isAccountActivated = true;
      await user.save();
    }

    await Notification.create({
      user: user._id,
      title: 'Wallet Credited',
      message: `Your wallet has been credited with N${amount.toLocaleString()} by admin.`,
      type: 'success',
    });

    res.json({ message: `Wallet credited with N${amount.toLocaleString()}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const withdrawals = await Withdrawal.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt');
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user', 'name email');
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    withdrawal.status = 'approved';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    await Notification.create({
      user: withdrawal.user._id,
      title: 'Withdrawal Approved',
      message: `Your withdrawal of N${withdrawal.amount} has been approved and is being processed.`,
      type: 'success',
    });

    res.json({ message: 'Withdrawal approved', withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reverseWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user', 'name email');
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    withdrawal.status = 'reversed';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    await creditWallet(
      withdrawal.user._id,
      withdrawal.amount,
      `Reversed withdrawal: ${withdrawal.reference}`,
      withdrawal.reference
    );

    await Notification.create({
      user: withdrawal.user._id,
      title: 'Withdrawal Reversed',
      message: `Your withdrawal of N${withdrawal.amount} has been reversed. Funds returned to wallet.`,
      type: 'warning',
    });

    res.json({ message: 'Withdrawal reversed', withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted', processedBy: req.user._id, processedAt: new Date() },
      { new: true }
    );
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    await Notification.create({
      user: withdrawal.user,
      title: 'Withdrawal Deleted',
      message: `Your withdrawal request of N${withdrawal.amount} has been deleted by admin.`,
      type: 'error',
    });

    res.json({ message: 'Withdrawal deleted', withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDeposits = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const deposits = await Deposit.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt');
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id).populate('user', 'name email');
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });

    deposit.status = 'approved';
    deposit.processedBy = req.user._id;
    deposit.processedAt = new Date();
    await deposit.save();

    await creditWallet(
      deposit.user._id,
      deposit.amount,
      `Deposit approved by admin (Ref: ${deposit.reference})`,
      deposit.reference
    );

    const user = await User.findById(deposit.user._id);
    const activationFee = parseInt(process.env.ACTIVATION_FEE || '1500');
    if (!user.isAccountActivated) {
      const wallet = await Wallet.findOne({ user: deposit.user._id });
      if (wallet && wallet.balance >= activationFee) {
        await debitWallet(deposit.user._id, activationFee, `Account activation fee: N${activationFee.toLocaleString()}`);
        user.isAccountActivated = true;
        await user.save();
      }
    }

    await Notification.create({
      user: deposit.user._id,
      title: 'Deposit Approved',
      message: `Your deposit of N${deposit.amount} has been approved and credited.`,
      type: 'success',
    });

    res.json({ message: 'Deposit approved', deposit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reverseDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });

    deposit.status = 'reversed';
    deposit.processedBy = req.user._id;
    deposit.processedAt = new Date();
    await deposit.save();

    res.json({ message: 'Deposit reversed', deposit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted', processedBy: req.user._id, processedAt: new Date() },
      { new: true }
    );
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
    res.json({ message: 'Deposit deleted', deposit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendAnnouncement = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      type: type || 'info',
      createdBy: req.user._id,
    });

    const users = await User.find({ isActive: true }).select('_id');
    const notifications = users.map((u) => ({
      user: u._id,
      title: '📢 ' + title,
      message: content,
      type: 'announcement',
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ message: 'Announcement sent to all users', announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort('-createdAt');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeUsers = await User.countDocuments({ role: { $ne: 'admin' }, isActive: true, isSuspended: false });
    const totalEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarned' } } },
    ]);
    const totalWithdrawn = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalWithdrawn' } } },
    ]);
    const totalDeposits = await Deposit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalWithdrawals = await Withdrawal.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const tasksCompleted = await Submission.countDocuments({ status: 'approved' });
    const totalReferrals = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalReferrals' } } },
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalEarnings: totalEarnings[0]?.total || 0,
      totalWithdrawn: totalWithdrawn[0]?.total || 0,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalDepositCount: totalDeposits[0]?.count || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalWithdrawalCount: totalWithdrawals[0]?.count || 0,
      tasksCompleted,
      totalReferrals: totalReferrals[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
