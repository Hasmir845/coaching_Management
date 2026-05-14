const mongoose = require('mongoose');

/** Marks whether a scheduled slot was actually held on a calendar day (from batch timetable). */
const slotAttendanceSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    scheduleSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    /** Calendar day YYYY-MM-DD (local intent; stored as literal string) */
    dateKey: {
      type: String,
      required: true,
      trim: true,
    },
    taken: {
      type: Boolean,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    batchName: { type: String },
    subject: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    dayOfWeek: { type: String },
  },
  { timestamps: true }
);

slotAttendanceSchema.index({ batch: 1, scheduleSlotId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('SlotAttendance', slotAttendanceSchema);
