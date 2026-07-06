const db = require('../../config/db');

const getOverview = async () => {
  const [users, bookings, revenue, providers] = await Promise.all([

    db.query(`SELECT COUNT(*) as total FROM users WHERE is_deleted = false`),

    db.query(`SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending')   as pending,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
      FROM bookings`),

    db.query(`SELECT COALESCE(SUM(s.price), 0) as total_revenue
              FROM bookings b
              JOIN services s ON s.id = b.service_id
              WHERE b.status = 'completed'`),

    db.query(`SELECT COUNT(*) as total FROM users WHERE role = 'provider' AND is_deleted = false`),
  ]);

  return {
    total_users:     parseInt(users.rows[0].total),
    total_providers: parseInt(providers.rows[0].total),
    bookings:        bookings.rows[0],
    total_revenue:   parseFloat(revenue.rows[0].total_revenue),
  };
};

const getBookingTrend = async () => {
  const result = await db.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
      COUNT(*) as total
    FROM bookings
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC
  `);
  return result.rows;
};

const getRevenueTrend = async () => {
  const result = await db.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', b.created_at), 'Mon YYYY') as month,
      COALESCE(SUM(s.price), 0) as revenue
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.status = 'completed'
    AND b.created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', b.created_at)
    ORDER BY DATE_TRUNC('month', b.created_at) ASC
  `);
  return result.rows;
};

const getTopProviders = async () => {
  const result = await db.query(`
    SELECT
      u.id, u.name,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(s.price), 0) as total_revenue,
      ROUND(AVG(r.rating), 1) as avg_rating
    FROM users u
    LEFT JOIN bookings b  ON b.provider_id = u.id AND b.status = 'completed'
    LEFT JOIN services s  ON s.id = b.service_id
    LEFT JOIN reviews r   ON r.provider_id = u.id
    WHERE u.role = 'provider' AND u.is_deleted = false
    GROUP BY u.id, u.name
    ORDER BY total_bookings DESC
    LIMIT 5
  `);
  return result.rows;
};

module.exports = { getOverview, getBookingTrend, getRevenueTrend, getTopProviders };
