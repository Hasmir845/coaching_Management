const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    /** Optional; defaults to batch subject in UI if empty */
    subject: {
      type: String,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  { _id: true }
);

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    schedule: {
      type: String,
    },
    scheduleSlots: [scheduleSlotSchema],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    capacity: {
      type: Number,
    },
    /** @deprecated prefer `teachers`; kept for existing data */
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'upcoming'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', batchSchema);
