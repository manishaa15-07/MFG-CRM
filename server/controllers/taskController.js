const { body } = require('express-validator');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all tasks with filters
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    assignedTo,
    relatedLead,
    overdue,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  // BDA sees only own tasks
  if (req.user.role === 'bda') {
    query.assignedTo = req.user._id;
  } else if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  // Filters
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (relatedLead) query.relatedLead = relatedLead;

  // Overdue filter: tasks past due date that are not completed/cancelled
  if (overdue === 'true') {
    query.dueDate = { $lt: new Date() };
    query.status = { $in: ['Pending', 'InProgress'] };
  }

  // Parse sort
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

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('relatedLead', 'companyName contactPerson status')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: {
      current: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar role phone')
    .populate('relatedLead', 'companyName contactPerson email status');

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  // BDA can only view own tasks
  if (
    req.user.role === 'bda' &&
    task.assignedTo._id.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to view this task'));
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, relatedLead, dueDate, priority, status } =
    req.body;

  const task = await Task.create({
    title,
    description,
    assignedTo: assignedTo || req.user._id,
    relatedLead,
    dueDate,
    priority: priority || 'Medium',
    status: status || 'Pending',
  });

  await task.populate('assignedTo', 'name email avatar role');
  if (task.relatedLead) {
    await task.populate('relatedLead', 'companyName contactPerson status');
  }

  // Create activity log
  await Activity.create({
    user: req.user._id,
    type: 'task_created',
    description: `Created task: ${title}`,
    relatedTask: task._id,
    relatedLead: relatedLead || undefined,
  });

  // Notify assigned user if different from creator
  if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: assignedTo,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${title}`,
      type: 'task_assigned',
      relatedEntity: task._id,
      relatedEntityType: 'Task',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  // BDA can only update own tasks
  if (
    req.user.role === 'bda' &&
    task.assignedTo.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to update this task'));
  }

  const allowedFields = [
    'title',
    'description',
    'assignedTo',
    'relatedLead',
    'dueDate',
    'priority',
    'status',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // If marking as completed, set completedAt
  if (updates.status === 'Completed' && task.status !== 'Completed') {
    updates.completedAt = new Date();
  }

  // If un-completing, remove completedAt
  if (updates.status && updates.status !== 'Completed') {
    updates.completedAt = null;
  }

  task = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email avatar role')
    .populate('relatedLead', 'companyName contactPerson status');

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  // BDA can only delete own tasks, managers/admins can delete any
  if (
    req.user.role === 'bda' &&
    task.assignedTo.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to delete this task'));
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

/**
 * @desc    Mark task as complete
 * @route   PATCH /api/tasks/:id/complete
 * @access  Private
 */
const completeTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  // BDA can only complete own tasks
  if (
    req.user.role === 'bda' &&
    task.assignedTo.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to complete this task'));
  }

  if (task.status === 'Completed') {
    return res.status(200).json({
      success: true,
      message: 'Task is already completed',
      data: task,
    });
  }

  task.status = 'Completed';
  task.completedAt = new Date();
  await task.save();

  await task.populate('assignedTo', 'name email avatar role');
  if (task.relatedLead) {
    await task.populate('relatedLead', 'companyName contactPerson status');
  }

  // Create activity log
  await Activity.create({
    user: req.user._id,
    type: 'task_completed',
    description: `Completed task: ${task.title}`,
    relatedTask: task._id,
    relatedLead: task.relatedLead ? task.relatedLead._id : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Task marked as completed',
    data: task,
  });
});

// Validation rules
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Priority must be Low, Medium, High, or Urgent'),
  body('status')
    .optional()
    .isIn(['Pending', 'InProgress', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Priority must be Low, Medium, High, or Urgent'),
  body('status')
    .optional()
    .isIn(['Pending', 'InProgress', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
];

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  createTaskValidation,
  updateTaskValidation,
};
