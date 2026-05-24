const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware.
 * Accepts a list of allowed roles and returns middleware
 * that checks if the authenticated user has one of those roles.
 *
 * Usage: roleAuth('admin', 'manager')
 */
const roleAuth = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized, please login'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = roleAuth;
