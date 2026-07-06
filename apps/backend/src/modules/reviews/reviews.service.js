const db       = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const create = async (customerId, { booking_id, rating, comment }) => {
  // 1. Fetch the booking
  const bRes = await db.query('SELECT * FROM bookings WHERE id = $1', [booking_id]);
  const booking = bRes.rows[0];
  if (!booking) throw new ApiError(404, 'Booking not found');

  // 2. Must be the customer who made the booking
  if (booking.customer_id !== customerId) throw new ApiError(403, 'Not your booking');

  // 3. Booking must be completed
  if (booking.status !== 'completed') throw new ApiError(400, 'Can only review completed bookings');

  // 4. Check no review already exists (DB UNIQUE handles it too, but nicer error)
  const existing = await db.query('SELECT id FROM reviews WHERE booking_id = $1', [booking_id]);
  if (existing.rows[0]) throw new ApiError(409, 'You already reviewed this booking');

  const result = await db.query(
    `INSERT INTO reviews (booking_id, customer_id, provider_id, service_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [booking_id, customerId, booking.provider_id, booking.service_id, rating, comment]
  );

  // 5. Notify the provider
  await db.query(
    `INSERT INTO notifications (user_id, booking_id, type, message)
     VALUES ($1, $2, 'review_received', $3)`,
    [booking.provider_id, booking_id, `You received a ${rating}-star review`]
  );

  return result.rows[0];
};

const getProviderReviews = async (providerId, { page = 1, limit = 10 }) => {
  const paginate = require('../../utils/paginate');
  const q  = `SELECT r.*, u.name as customer_name, s.title as service_title
               FROM reviews r
               JOIN users u    ON u.id = r.customer_id
               JOIN services s ON s.id = r.service_id
               WHERE r.provider_id = $1
               ORDER BY r.created_at DESC`;
  const cq = `SELECT COUNT(*) FROM reviews WHERE provider_id = $1`;
  return paginate(db, q, [providerId], cq, [providerId], page, limit);
};

const getServiceReviews = async (serviceId) => {
  const result = await db.query(
    `SELECT r.*, u.name as customer_name
     FROM reviews r
     JOIN users u ON u.id = r.customer_id
     WHERE r.service_id = $1
     ORDER BY r.created_at DESC`,
    [serviceId]
  );

  // also return average rating
  const avg = await db.query(
    'SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total FROM reviews WHERE service_id = $1',
    [serviceId]
  );

  return { reviews: result.rows, ...avg.rows[0] };
};

module.exports = { create, getProviderReviews, getServiceReviews };
