const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must be associated with a user'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'lead_created',
          'lead_updated',
          'lead_status_changed',
          'task_created',
          'task_completed',
          'note_added',
          'login',
        ],
        message: 'Invalid activity type',
      },
      required: [true, 'Activity type is required'],
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    relatedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We manually manage createdAt
  }
);

// Compound index for user activity timeline
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ relatedLead: 1 });
activitySchema.index({ relatedTask: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
