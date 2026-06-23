const jwt      = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const db       = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-fetch from DB — catches blocked/deleted users mid-session
    const result = await db.query(
      'SELECT id, role, is_blocked, is_deleted FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];
    if (!user || user.is_deleted) throw new ApiError(401, 'User no longer exists');
    if (user.is_blocked)          throw new ApiError(403, 'Account is blocked');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
