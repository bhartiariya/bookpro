const db       = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const paginate = require('../../utils/paginate');

const getAll = async ({ page = 1, limit = 10, search = '', role = '' }) => {
  let baseQuery  = `SELECT id, name, email, role, is_blocked, created_at
                    FROM users WHERE is_deleted = false`;
  let countQuery = `SELECT COUNT(*) FROM users WHERE is_deleted = false`;
  const params   = [];
  const cParams  = [];

  if (search) {
    params.push(`%${search}%`);
    cParams.push(`%${search}%`);
    baseQuery  += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    countQuery += ` AND (name ILIKE $${cParams.length} OR email ILIKE $${cParams.length})`;
  }

  if (role) {
    params.push(role);
    cParams.push(role);
    baseQuery  += ` AND role = $${params.length}`;
    countQuery += ` AND role = $${cParams.length}`;
  }

  baseQuery += ` ORDER BY created_at DESC`;

  return paginate(db, baseQuery, params, countQuery, cParams, page, limit);
};

const getById = async (id) => {
  const result = await db.query(
    `SELECT id, name, email, role, is_blocked, created_at
     FROM users WHERE id = $1 AND is_deleted = false`,
    [id]
  );
  if (!result.rows[0]) throw new ApiError(404, 'User not found');
  return result.rows[0];
};

const toggleBlock = async (id, adminId) => {
  if (id === adminId) throw new ApiError(400, 'You cannot block yourself');

  const user = await getById(id);
  const newStatus = !user.is_blocked;

  await db.query('UPDATE users SET is_blocked = $1 WHERE id = $2', [newStatus, id]);
  return { is_blocked: newStatus };
};

const softDelete = async (id, adminId) => {
  if (id === adminId) throw new ApiError(400, 'You cannot delete yourself');
  await getById(id); // throws 404 if not found
  await db.query('UPDATE users SET is_deleted = true WHERE id = $1', [id]);
};

module.exports = { getAll, getById, toggleBlock, softDelete };
