const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['teacher', 'student', 'batch', 'class'],
    },
    relatedId: mongoose.Schema.Types.ObjectId,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
