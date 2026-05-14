const mongoose = require('mongoose');

const classTrackingSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    /** taken = class was held; not_taken = teacher did not take class (absent) */
    teacherClassStatus: {
      type: String,
      enum: ['taken', 'not_taken'],
      default: 'taken',
    },
    date: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
    },
    notes: {
      type: String,
    },
    presentStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
        present: Boolean,
      },
    ],
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassTracking', classTrackingSchema);
