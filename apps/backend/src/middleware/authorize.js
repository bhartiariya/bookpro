const ApiError = require('../utils/ApiError');

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}`);
  }
  next();
};

module.exports = authorize;
