const { body } = require('express-validator');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all leads with pagination, search, filter, and sort
 * @route   GET /api/leads
 * @access  Private
 */
const getLeads = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    industry,
    leadSource,
    assignedTo,
    priority,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  // BDA role: only see own leads
  if (req.user.role === 'bda') {
    query.assignedTo = req.user._id;
  } else if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  // Search by companyName or contactPerson
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
    ];
  }

  // Filters
  if (status) query.status = status;
  if (industry) query.industry = { $regex: industry, $options: 'i' };
  if (leadSource) query.leadSource = leadSource;
  if (priority) query.priority = priority;

  // Parse sort string (e.g., '-createdAt' or 'expectedRevenue')
  let sortObj = {};
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach((field) => {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name email avatar role')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: leads,
    pagination: {
      current: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @desc    Get single lead
 * @route   GET /api/leads/:id
 * @access  Private
 */
const getLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name email avatar role phone')
    .populate('notes.createdBy', 'name email avatar');

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  // BDA can only view own leads
  if (
    req.user.role === 'bda' &&
    lead.assignedTo._id.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to view this lead'));
  }

  res.status(200).json({
    success: true,
    data: lead,
  });
});

/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Private
 */
const createLead = asyncHandler(async (req, res) => {
  const {
    companyName,
    contactPerson,
    email,
    phone,
    industry,
    leadSource,
    status,
    expectedRevenue,
    assignedTo,
    followUpDate,
    priority,
  } = req.body;

  const lead = await Lead.create({
    companyName,
    contactPerson,
    email,
    phone,
    industry,
    leadSource,
    status: status || 'New',
    expectedRevenue: expectedRevenue || 0,
    assignedTo: assignedTo || req.user._id,
    followUpDate,
    priority: priority || 'Medium',
  });

  // Populate assignedTo for response
  await lead.populate('assignedTo', 'name email avatar role');

  // Create activity log
  await Activity.create({
    user: req.user._id,
    type: 'lead_created',
    description: `Created lead for ${companyName}`,
    relatedLead: lead._id,
  });

  // Create notification for assigned user if different from creator
  if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: assignedTo,
      title: 'New Lead Assigned',
      message: `You have been assigned a new lead: ${companyName}`,
      type: 'lead_assigned',
      relatedEntity: lead._id,
      relatedEntityType: 'Lead',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    data: lead,
  });
});

/**
 * @desc    Update a lead
 * @route   PUT /api/leads/:id
 * @access  Private
 */
const updateLead = asyncHandler(async (req, res, next) => {
  let lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  // BDA can only update own leads
  if (
    req.user.role === 'bda' &&
    lead.assignedTo.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to update this lead'));
  }

  const allowedFields = [
    'companyName',
    'contactPerson',
    'email',
    'phone',
    'industry',
    'leadSource',
    'status',
    'expectedRevenue',
    'assignedTo',
    'followUpDate',
    'priority',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const oldStatus = lead.status;

  lead = await Lead.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('assignedTo', 'name email avatar role');

  // Create activity log
  await Activity.create({
    user: req.user._id,
    type: 'lead_updated',
    description: `Updated lead: ${lead.companyName}`,
    relatedLead: lead._id,
    metadata: { updates: Object.keys(updates) },
  });

  // If status changed, create specific activity
  if (updates.status && updates.status !== oldStatus) {
    await Activity.create({
      user: req.user._id,
      type: 'lead_status_changed',
      description: `Changed ${lead.companyName} status from ${oldStatus} to ${updates.status}`,
      relatedLead: lead._id,
      metadata: { from: oldStatus, to: updates.status },
    });

    // Notifications for won/lost deals
    if (updates.status === 'Won') {
      await Notification.create({
        user: lead.assignedTo._id,
        title: 'Deal Won!',
        message: `Congratulations! Deal with ${lead.companyName} has been won! Revenue: ₹${lead.expectedRevenue.toLocaleString()}`,
        type: 'deal_won',
        relatedEntity: lead._id,
        relatedEntityType: 'Lead',
      });
    } else if (updates.status === 'Lost') {
      await Notification.create({
        user: lead.assignedTo._id,
        title: 'Deal Lost',
        message: `Deal with ${lead.companyName} has been marked as lost`,
        type: 'deal_lost',
        relatedEntity: lead._id,
        relatedEntityType: 'Lead',
      });
    }
  }

  // If reassigned, notify new assignee
  if (
    updates.assignedTo &&
    updates.assignedTo.toString() !== lead.assignedTo._id.toString()
  ) {
    await Notification.create({
      user: updates.assignedTo,
      title: 'Lead Reassigned',
      message: `Lead ${lead.companyName} has been assigned to you`,
      type: 'lead_assigned',
      relatedEntity: lead._id,
      relatedEntityType: 'Lead',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lead updated successfully',
    data: lead,
  });
});

/**
 * @desc    Delete a lead
 * @route   DELETE /api/leads/:id
 * @access  Private (Admin/Manager only)
 */
const deleteLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  await Lead.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Lead deleted successfully',
  });
});

/**
 * @desc    Update lead status (for Kanban drag-and-drop)
 * @route   PATCH /api/leads/:id/status
 * @access  Private
 */
const updateLeadStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ApiError(400, 'Status is required'));
  }

  const validStatuses = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, 'Invalid status value'));
  }

  let lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  // BDA can only update own leads
  if (
    req.user.role === 'bda' &&
    lead.assignedTo.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to update this lead'));
  }

  const oldStatus = lead.status;

  if (oldStatus === status) {
    return res.status(200).json({
      success: true,
      message: 'Status unchanged',
      data: lead,
    });
  }

  lead.status = status;
  await lead.save();

  await lead.populate('assignedTo', 'name email avatar role');

  // Create activity log for status change
  await Activity.create({
    user: req.user._id,
    type: 'lead_status_changed',
    description: `Changed ${lead.companyName} status from ${oldStatus} to ${status}`,
    relatedLead: lead._id,
    metadata: { from: oldStatus, to: status },
  });

  // Notifications for won/lost
  if (status === 'Won') {
    await Notification.create({
      user: lead.assignedTo._id,
      title: 'Deal Won!',
      message: `Congratulations! Deal with ${lead.companyName} has been won! Revenue: ₹${lead.expectedRevenue.toLocaleString()}`,
      type: 'deal_won',
      relatedEntity: lead._id,
      relatedEntityType: 'Lead',
    });
  } else if (status === 'Lost') {
    await Notification.create({
      user: lead.assignedTo._id,
      title: 'Deal Lost',
      message: `Deal with ${lead.companyName} has been marked as lost`,
      type: 'deal_lost',
      relatedEntity: lead._id,
      relatedEntityType: 'Lead',
    });
  }

  res.status(200).json({
    success: true,
    message: `Lead status updated to ${status}`,
    data: lead,
  });
});

/**
 * @desc    Add note to a lead
 * @route   POST /api/leads/:id/notes
 * @access  Private
 */
const addNote = asyncHandler(async (req, res, next) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return next(new ApiError(400, 'Note text is required'));
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  // BDA can only add notes to own leads
  if (
    req.user.role === 'bda' &&
    lead.assignedTo.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to add notes to this lead'));
  }

  lead.notes.push({
    text: text.trim(),
    createdBy: req.user._id,
    createdAt: new Date(),
  });

  await lead.save();
  await lead.populate('notes.createdBy', 'name email avatar');
  await lead.populate('assignedTo', 'name email avatar role');

  // Create activity log
  await Activity.create({
    user: req.user._id,
    type: 'note_added',
    description: `Added note to lead: ${lead.companyName}`,
    relatedLead: lead._id,
  });

  res.status(201).json({
    success: true,
    message: 'Note added successfully',
    data: lead,
  });
});

/**
 * @desc    Export leads as CSV
 * @route   GET /api/leads/export/csv
 * @access  Private
 */
const exportLeadsCSV = asyncHandler(async (req, res) => {
  const { Parser } = require('json2csv');

  const query = {};

  // BDA sees only own leads
  if (req.user.role === 'bda') {
    query.assignedTo = req.user._id;
  }

  const leads = await Lead.find(query)
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const csvData = leads.map((lead) => ({
    'Company Name': lead.companyName,
    'Contact Person': lead.contactPerson,
    Email: lead.email,
    Phone: lead.phone || '',
    Industry: lead.industry || '',
    'Lead Source': lead.leadSource,
    Status: lead.status,
    Priority: lead.priority,
    'Expected Revenue': lead.expectedRevenue,
    'Assigned To': lead.assignedTo ? lead.assignedTo.name : '',
    'Follow Up Date': lead.followUpDate
      ? new Date(lead.followUpDate).toLocaleDateString()
      : '',
    'Created At': new Date(lead.createdAt).toLocaleDateString(),
    'Notes Count': lead.notes ? lead.notes.length : 0,
  }));

  const fields = [
    'Company Name',
    'Contact Person',
    'Email',
    'Phone',
    'Industry',
    'Lead Source',
    'Status',
    'Priority',
    'Expected Revenue',
    'Assigned To',
    'Follow Up Date',
    'Created At',
    'Notes Count',
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(csvData);

  res.header('Content-Type', 'text/csv');
  res.attachment('leads_export.csv');
  return res.send(csv);
});

// Validation rules
const createLeadValidation = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim(),
  body('industry').optional().trim(),
  body('leadSource')
    .optional()
    .isIn(['Website', 'Referral', 'TradeShow', 'ColdCall', 'LinkedIn', 'Advertisement', 'Other'])
    .withMessage('Invalid lead source'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'])
    .withMessage('Invalid status'),
  body('expectedRevenue')
    .optional()
    .isNumeric()
    .withMessage('Expected revenue must be a number'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
];

const updateLeadValidation = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('contactPerson').optional().trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('leadSource')
    .optional()
    .isIn(['Website', 'Referral', 'TradeShow', 'ColdCall', 'LinkedIn', 'Advertisement', 'Other'])
    .withMessage('Invalid lead source'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'])
    .withMessage('Invalid status'),
  body('expectedRevenue')
    .optional()
    .isNumeric()
    .withMessage('Expected revenue must be a number'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
];

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  addNote,
  exportLeadsCSV,
  createLeadValidation,
  updateLeadValidation,
};
