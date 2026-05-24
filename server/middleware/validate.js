const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator validation results.
 * If there are validation errors, returns a 400 response
 * with all error messages. Otherwise passes to next handler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = validate;
