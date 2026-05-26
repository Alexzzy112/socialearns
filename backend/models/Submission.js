const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    screenshot: { type: String, required: true },
    proofUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: { type: String },
    fraudScore: { type: Number, default: 0 },
    isFraud: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, task: 1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
