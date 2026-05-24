const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a JWT token for a user.
 * @param {Object} user - The user object (must have _id and role)
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );
};

module.exports = generateToken;
