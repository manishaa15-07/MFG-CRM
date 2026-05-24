const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin/Manager)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      current: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user (admin only)
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  const allowedFields = ['name', 'email', 'role', 'phone', 'department', 'isActive', 'avatar'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return next(new ApiError(400, 'No valid fields to update'));
  }

  // Prevent admin from deactivating themselves
  if (
    updates.isActive === false &&
    req.params.id === req.user._id.toString()
  ) {
    return next(new ApiError(400, 'You cannot deactivate your own account'));
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
});

/**
 * @desc    Soft delete / deactivate user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  // Prevent admin from deleting themselves
  if (req.params.id === req.user._id.toString()) {
    return next(new ApiError(400, 'You cannot deactivate your own account'));
  }

  // Soft delete - deactivate
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
    data: user,
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
