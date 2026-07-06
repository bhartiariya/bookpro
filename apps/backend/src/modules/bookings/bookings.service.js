const db       = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const paginate = require('../../utils/paginate');

// ── valid status transitions ──────────────────────────────────────────────────
const TRANSITIONS = {
  pending:   ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['cancelled', 'completed'],
  rejected:  [],
  cancelled: [],
  completed: [],
};

const assertTransition = (current, next) => {
  if (!TRANSITIONS[current]?.includes(next)) {
    throw new ApiError(400, `Cannot move booking from '${current}' to '${next}'`);
  }
};

// ── create ────────────────────────────────────────────────────────────────────
const create = async (customerId, { service_id, slot_id, notes }) => {
  const client = await db.connect(); // get a dedicated client for the transaction

  try {
    await client.query('BEGIN');

    // 1. Lock the slot row — prevents concurrent bookings of the same slot
    const slotResult = await client.query(
      `SELECT * FROM slots WHERE id = $1 AND is_booked = false FOR UPDATE`,
      [slot_id]
    );
    const slot = slotResult.rows[0];
    if (!slot) throw new ApiError(409, 'Slot is not available');

    // 2. Verify the service exists and matches the slot
    const svcResult = await client.query(
      `SELECT * FROM services WHERE id = $1 AND is_deleted = false AND is_active = true`,
      [service_id]
    );
    const service = svcResult.rows[0];
    if (!service) throw new ApiError(404, 'Service not found');
    if (service.id !== slot.service_id) throw new ApiError(400, 'Slot does not belong to this service');

    // 3. Create the booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, provider_id, service_id, slot_id, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customerId, slot.provider_id, service_id, slot_id, notes]
    );
    const booking = bookingResult.rows[0];

    // 4. Mark slot as booked
    await client.query(
      `UPDATE slots SET is_booked = true WHERE id = $1`,
      [slot_id]
    );

    // 5. Notify the provider
    await client.query(
      `INSERT INTO notifications (user_id, booking_id, type, message)
       VALUES ($1, $2, 'booking_created', $3)`,
      [slot.provider_id, booking.id, `New booking request for ${service.title}`]
    );

    await client.query('COMMIT');
    return booking;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── getters ───────────────────────────────────────────────────────────────────
const getMyBookings = async (customerId, { page, limit, status }) => {
  let q  = `SELECT b.*, s.title as service_title, s.price,
                   u.name as provider_name, sl.start_time, sl.end_time
             FROM bookings b
             JOIN services s  ON s.id  = b.service_id
             JOIN users u     ON u.id  = b.provider_id
             JOIN slots sl    ON sl.id = b.slot_id
             WHERE b.customer_id = $1`;
  let cq = `SELECT COUNT(*) FROM bookings b WHERE b.customer_id = $1`;
  const params = [customerId], cparams = [customerId];

  if (status) {
    params.push(status); cparams.push(status);
    q  += ` AND b.status = $${params.length}`;
    cq += ` AND b.status = $${cparams.length}`;
  }

  q += ` ORDER BY b.created_at DESC`;
  return paginate(db, q, params, cq, cparams, page, limit);
};

const getProviderBookings = async (providerId, { page, limit, status }) => {
  let q  = `SELECT b.*, s.title as service_title,
                   u.name as customer_name, sl.start_time, sl.end_time
             FROM bookings b
             JOIN services s  ON s.id  = b.service_id
             JOIN users u     ON u.id  = b.customer_id
             JOIN slots sl    ON sl.id = b.slot_id
             WHERE b.provider_id = $1`;
  let cq = `SELECT COUNT(*) FROM bookings b WHERE b.provider_id = $1`;
  const params = [providerId], cparams = [providerId];

  if (status) {
    params.push(status); cparams.push(status);
    q  += ` AND b.status = $${params.length}`;
    cq += ` AND b.status = $${cparams.length}`;
  }

  q += ` ORDER BY b.created_at DESC`;
  return paginate(db, q, params, cq, cparams, page, limit);
};

const getById = async (id, userId) => {
  const result = await db.query(
    `SELECT b.*, s.title as service_title, s.price,
            sl.start_time, sl.end_time
     FROM bookings b
     JOIN services s ON s.id  = b.service_id
     JOIN slots sl   ON sl.id = b.slot_id
     WHERE b.id = $1`,
    [id]
  );
  const booking = result.rows[0];
  if (!booking) throw new ApiError(404, 'Booking not found');
  // only the customer or provider can view it
  if (booking.customer_id !== userId && booking.provider_id !== userId) {
    throw new ApiError(403, 'Access denied');
  }
  return booking;
};

// ── status changers ───────────────────────────────────────────────────────────
const confirm = async (bookingId, providerId) => {
  const booking = await getBookingForProvider(bookingId, providerId);
  assertTransition(booking.status, 'confirmed');

  const result = await db.query(
    `UPDATE bookings SET status = 'confirmed' WHERE id = $1 RETURNING *`,
    [bookingId]
  );

  await notify(booking.customer_id, bookingId, 'booking_confirmed', 'Your booking has been confirmed');
  return result.rows[0];
};

const reject = async (bookingId, providerId) => {
  const booking = await getBookingForProvider(bookingId, providerId);
  assertTransition(booking.status, 'rejected');

  const result = await db.query(
    `UPDATE bookings SET status = 'rejected' WHERE id = $1 RETURNING *`,
    [bookingId]
  );

  // Free up the slot
  await db.query(`UPDATE slots SET is_booked = false WHERE id = $1`, [booking.slot_id]);
  await notify(booking.customer_id, bookingId, 'booking_rejected', 'Your booking was rejected');
  return result.rows[0];
};

const cancel = async (bookingId, userId, role, { cancel_reason } = {}) => {
  const result = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  const booking = result.rows[0];
  if (!booking) throw new ApiError(404, 'Booking not found');

  // both customer and provider can cancel but only their own
  if (role === 'customer' && booking.customer_id !== userId) throw new ApiError(403, 'Access denied');
  if (role === 'provider' && booking.provider_id !== userId) throw new ApiError(403, 'Access denied');

  assertTransition(booking.status, 'cancelled');

  const updated = await db.query(
    `UPDATE bookings SET status = 'cancelled', cancelled_by = $1, cancel_reason = $2
     WHERE id = $3 RETURNING *`,
    [role, cancel_reason, bookingId]
  );

  // Free up the slot
  await db.query(`UPDATE slots SET is_booked = false WHERE id = $1`, [booking.slot_id]);

  // Notify the other party
  const notifyUserId = role === 'customer' ? booking.provider_id : booking.customer_id;
  await notify(notifyUserId, bookingId, 'booking_cancelled', 'A booking has been cancelled');
  return updated.rows[0];
};

const complete = async (bookingId, providerId) => {
  const booking = await getBookingForProvider(bookingId, providerId);
  assertTransition(booking.status, 'completed');

  const result = await db.query(
    `UPDATE bookings SET status = 'completed' WHERE id = $1 RETURNING *`,
    [bookingId]
  );

  await notify(booking.customer_id, bookingId, 'booking_completed',
    'Your appointment is complete. Leave a review!');
  return result.rows[0];
};

// ── helpers ───────────────────────────────────────────────────────────────────
const getBookingForProvider = async (bookingId, providerId) => {
  const result = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  const booking = result.rows[0];
  if (!booking)                         throw new ApiError(404, 'Booking not found');
  if (booking.provider_id !== providerId) throw new ApiError(403, 'Access denied');
  return booking;
};

const notify = async (userId, bookingId, type, message) => {
  await db.query(
    `INSERT INTO notifications (user_id, booking_id, type, message) VALUES ($1,$2,$3,$4)`,
    [userId, bookingId, type, message]
  );
};

module.exports = { create, getMyBookings, getProviderBookings, getById, confirm, reject, cancel, complete };
