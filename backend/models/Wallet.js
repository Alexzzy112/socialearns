const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    totalCredited: { type: Number, default: 0 },
    totalDebited: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    ledger: [
      {
        type: { type: String, enum: ['credit', 'debit'], required: true },
        amount: { type: Number, required: true },
        description: { type: String },
        reference: { type: String },
        balanceBefore: { type: Number },
        balanceAfter: { type: Number },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
