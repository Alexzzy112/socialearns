const Task = require('../models/Task');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');
const { debitWallet } = require('./walletController');
const { detectFraud } = require('../utils/aiFraudDetection');

const getAvailableTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const activationFee = parseInt(process.env.ACTIVATION_FEE || '1500');

    if (!user.isAccountActivated) {
      const wallet = await Wallet.findOne({ user: user._id });
      if (wallet && wallet.balance >= activationFee) {
        await debitWallet(user._id, activationFee, `Account activation fee: N${activationFee.toLocaleString()}`);
        user.isAccountActivated = true;
        await user.save();
      }
    }

    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const tasks = await Task.find(filter)
      .select('-createdBy')
      .sort('-createdAt');

    const submissions = await Submission.find({ user: req.user._id }).select('task status');

    const tasksWithStatus = tasks.map((task) => {
      const userSubmission = submissions.find(
        (s) => s.task.toString() === task._id.toString()
      );
      return {
        ...task.toObject(),
        userStatus: userSubmission ? userSubmission.status : 'not_submitted',
        submissionId: userSubmission ? userSubmission._id : null,
      };
    });

    res.json(tasksWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!task.isActive) return res.status(400).json({ message: 'Task is no longer active' });

    const existingSubmission = await Submission.findOne({
      user: req.user._id,
      task: task._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this task' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Screenshot proof is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user.isAccountActivated) {
      return res.status(403).json({ message: 'Account not activated. Please make a deposit of N1,500 to activate.' });
    }

    const submission = await Submission.create({
      user: req.user._id,
      task: task._id,
      screenshot: req.file.path,
      proofUrl: req.body.proofUrl || '',
    });

    const fraudResult = detectFraud(submission);
    if (fraudResult.isFraud) {
      submission.fraudScore = fraudResult.fraudScore;
      submission.isFraud = true;
      submission.status = 'rejected';
      await submission.save();

      return res.status(400).json({
        message: 'Submission flagged as potential fraud. Please contact support.',
        fraudScore: fraudResult.fraudScore,
      });
    }

    submission.fraudScore = fraudResult.fraudScore;
    await submission.save();

    task.completedCount += 1;
    await task.save();

    user.pendingTasks += 1;
    await user.save();

    await Notification.create({
      user: user._id,
      title: 'Task Submitted',
      message: `Your submission for "${task.title}" is pending review.`,
      type: 'info',
    });

    res.status(201).json({ message: 'Task submitted for review', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('task', 'title reward category')
      .sort('-createdAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isActive: true, isSuspended: false })
      .select('name avatar totalEarned completedTasks referralEarnings')
      .sort('-totalEarned')
      .limit(50);

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      totalEarned: u.totalEarned,
      completedTasks: u.completedTasks,
      referralEarnings: u.referralEarnings,
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAvailableTasks, getTaskById, submitTask, getUserSubmissions, getLeaderboard };
