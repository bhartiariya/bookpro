const rateLimit = require('express-rate-limit');

// Strict limiter — for login/register endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 5,
  message: { success: false, message: 'Too many attempts, please wait a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General limiter — for all other routes
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
