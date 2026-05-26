const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { debitWallet } = require('./walletController');

const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountName } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal is N100' });
    }

    const user = await User.findById(req.user._id);
    if (!user.bankAccount?.accountNumber && (!bankName || !accountNumber || !accountName)) {
      return res.status(400).json({ message: 'Bank account details required' });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      bankName: bankName || user.bankAccount.bankName,
      accountNumber: accountNumber || user.bankAccount.accountNumber,
      accountName: accountName || user.bankAccount.accountName,
      status: 'pending',
    });

    await debitWallet(
      req.user._id,
      amount,
      `Withdrawal request - ${withdrawal.reference}`,
      withdrawal.reference
    );

    await Notification.create({
      user: req.user._id,
      title: 'Withdrawal Requested',
      message: `Your withdrawal request of N${amount} has been submitted for processing.`,
      type: 'info',
    });

    res.status(201).json({ message: 'Withdrawal request submitted', withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .sort('-createdAt');
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWithdrawalById = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    if (withdrawal.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { requestWithdrawal, getUserWithdrawals, getWithdrawalById };
