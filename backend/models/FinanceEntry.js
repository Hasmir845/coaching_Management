const mongoose = require('mongoose');

const financeEntrySchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    /** Optional link when collection is tied to a batch */
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinanceEntry', financeEntrySchema);
