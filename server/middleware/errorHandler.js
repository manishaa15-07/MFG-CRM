const config = require('../config');

/**
 * Global error handler middleware.
 * Handles known error types (Mongoose, JWT, duplicates)
 * and returns consistent JSON error responses.
 */
const errorHandler = (err, req, res, next) => {
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    errors: null,
  };

  // Mongoose CastError - Invalid ObjectId
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = 'Validation Error';
    error.errors = messages;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    error.statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value for field '${field}'. This ${field} already exists.`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token has expired';
  }

  // Log error in development
  if (config.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode: error.statusCode,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
