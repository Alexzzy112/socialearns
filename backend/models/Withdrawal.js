const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'reversed', 'deleted'],
      default: 'pending',
    },
    reference: { type: String, unique: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
    adminNote: { type: String },
  },
  { timestamps: true }
);

withdrawalSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = 'WTH' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
