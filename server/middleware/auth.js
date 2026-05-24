const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Authentication middleware.
 * Extracts JWT from Authorization header, verifies it,
 * and attaches the user object to req.user.
 */
const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized, no token provided'));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Token has expired, please login again'));
      }
      return next(new ApiError(401, 'Not authorized, invalid token'));
    }

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    if (!user.isActive) {
      return next(new ApiError(401, 'User account has been deactivated'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Not authorized'));
  }
};

module.exports = auth;
