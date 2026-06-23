const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const db          = require('../../config/db');
const ApiError    = require('../../utils/ApiError');

const register = async ({ name, email, password, role }) => {
  // 1. Check if email already exists
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1 AND is_deleted = false',
    [email]
  );
  if (existing.rows.length > 0) throw new ApiError(409, 'Email already registered');

  // 2. Hash password
  const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

  // 3. Insert user
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, password_hash, role]
  );

  return result.rows[0];
};

const login = async ({ email, password }) => {
  // 1. Find user
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1 AND is_deleted = false',
    [email]
  );
  const user = result.rows[0];
  if (!user) throw new ApiError(401, 'Invalid email or password');

  // 2. Check if blocked
  if (user.is_blocked) throw new ApiError(403, 'Your account has been blocked');

  // 3. Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  // 4. Generate JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Return token + user (never return password_hash)
  const { password_hash, ...safeUser } = user;
  return { token, user: safeUser };
};

const getMe = async (userId) => {
  const result = await db.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (!result.rows[0]) throw new ApiError(404, 'User not found');
  return result.rows[0];
};

module.exports = { register, login, getMe };
