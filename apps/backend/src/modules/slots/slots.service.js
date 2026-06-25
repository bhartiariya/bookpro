const db       = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const create = async (providerId, { service_id, start_time, end_time }) => {
  // 1. Verify the service belongs to this provider
  const svc = await db.query(
    'SELECT id FROM services WHERE id = $1 AND provider_id = $2 AND is_deleted = false',
    [service_id, providerId]
  );
  if (!svc.rows[0]) throw new ApiError(404, 'Service not found or not yours');

  // 2. Check for overlapping slots
  const overlap = await db.query(
    `SELECT id FROM slots
     WHERE provider_id = $1
     AND is_booked = false
     AND (start_time, end_time) OVERLAPS ($2::timestamptz, $3::timestamptz)`,
    [providerId, start_time, end_time]
  );
  if (overlap.rows.length > 0) throw new ApiError(409, 'This time slot overlaps with an existing slot');

  const result = await db.query(
    `INSERT INTO slots (provider_id, service_id, start_time, end_time)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [providerId, service_id, start_time, end_time]
  );
  return result.rows[0];
};

const getByProvider = async (providerId) => {
  const result = await db.query(
    `SELECT sl.*, s.title as service_title
     FROM slots sl
     JOIN services s ON s.id = sl.service_id
     WHERE sl.provider_id = $1
     ORDER BY sl.start_time ASC`,
    [providerId]
  );
  return result.rows;
};

const getAvailable = async (providerId) => {
  const result = await db.query(
    `SELECT sl.*, s.title as service_title, s.price, s.duration_mins
     FROM slots sl
     JOIN services s ON s.id = sl.service_id
     WHERE sl.provider_id = $1
     AND sl.is_booked = false
     AND sl.start_time > NOW()
     ORDER BY sl.start_time ASC`,
    [providerId]
  );
  return result.rows;
};

const remove = async (id, providerId) => {
  const result = await db.query(
    'SELECT * FROM slots WHERE id = $1',
    [id]
  );
  const slot = result.rows[0];
  if (!slot)                        throw new ApiError(404, 'Slot not found');
  if (slot.provider_id !== providerId) throw new ApiError(403, 'Not your slot');
  if (slot.is_booked)               throw new ApiError(400, 'Cannot delete a booked slot');
  if (new Date(slot.start_time) < new Date()) throw new ApiError(400, 'Cannot delete a past slot');

  await db.query('DELETE FROM slots WHERE id = $1', [id]);
  // Note: slots are the only thing we hard delete — no bookings reference a deleted slot
};

module.exports = { create, getByProvider, getAvailable, remove };
