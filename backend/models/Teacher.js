const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'leave'],
      default: 'active',
    },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
