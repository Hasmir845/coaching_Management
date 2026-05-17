const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
    },
    photoURL: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'user'],
      default: 'user',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    adminRequestStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    adminRequestAt: {
      type: Date,
      default: null,
    },
    adminRequestReviewedAt: {
      type: Date,
      default: null,
    },
    teacherRequestStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    teacherRequestAt: {
      type: Date,
      default: null,
    },
    teacherRequestReviewedAt: {
      type: Date,
      default: null,
    },
    teacherRequestPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
