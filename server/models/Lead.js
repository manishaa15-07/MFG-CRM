const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
      maxlength: [100, 'Contact person name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry name cannot exceed 100 characters'],
    },
    leadSource: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'TradeShow', 'ColdCall', 'LinkedIn', 'Advertisement', 'Other'],
        message: 'Invalid lead source',
      },
      default: 'Other',
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'],
        message: 'Invalid lead status',
      },
      default: 'New',
    },
    expectedRevenue: {
      type: Number,
      default: 0,
      min: [0, 'Expected revenue cannot be negative'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must be assigned to a user'],
    },
    notes: [noteSchema],
    followUpDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ companyName: 'text', contactPerson: 'text' });
leadSchema.index({ industry: 1 });
leadSchema.index({ leadSource: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ followUpDate: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
