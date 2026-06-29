const db       = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const paginate = require('../../utils/paginate');

const getMyNotifications = async (userId, { page = 1, limit = 20 }) => {
  const q  = `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`;
  const cq = `SELECT COUNT(*) FROM notifications WHERE user_id = $1`;
  return paginate(db, q, [userId], cq, [userId], page, limit);
};

const getUnreadCount = async (userId) => {
  const result = await db.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

const markOneRead = async (id, userId) => {
  const result = await db.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  if (!result.rows[0]) throw new ApiError(404, 'Notification not found');
  return result.rows[0];
};

const markAllRead = async (userId) => {
  await db.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
};

module.exports = { getMyNotifications, getUnreadCount, markOneRead, markAllRead };
