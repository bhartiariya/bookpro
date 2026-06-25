const db       = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const paginate = require('../../utils/paginate');

// helper — reused in update and delete
const findOwned = async (id, providerId) => {
  const result = await db.query(
    'SELECT * FROM services WHERE id = $1 AND is_deleted = false',
    [id]
  );
  const service = result.rows[0];
  if (!service) throw new ApiError(404, 'Service not found');
  if (service.provider_id !== providerId) throw new ApiError(403, 'You do not own this service');
  return service;
};

const create = async (providerId, body) => {
  const { title, description, price, duration_mins, category } = body;
  const result = await db.query(
    `INSERT INTO services (provider_id, title, description, price, duration_mins, category)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [providerId, title, description, price, duration_mins, category]
  );
  return result.rows[0];
};

const getAll = async ({ page = 1, limit = 10, search = '', category = '', minPrice, maxPrice }) => {
  let q  = `SELECT s.*, u.name as provider_name FROM services s
             JOIN users u ON u.id = s.provider_id
             WHERE s.is_deleted = false AND s.is_active = true`;
  let cq = `SELECT COUNT(*) FROM services s WHERE s.is_deleted = false AND s.is_active = true`;
  const params = [], cparams = [];

  if (search) {
    params.push(`%${search}%`); cparams.push(`%${search}%`);
    q  += ` AND s.title ILIKE $${params.length}`;
    cq += ` AND s.title ILIKE $${cparams.length}`;
  }
  if (category) {
    params.push(category); cparams.push(category);
    q  += ` AND s.category = $${params.length}`;
    cq += ` AND s.category = $${cparams.length}`;
  }
  if (minPrice !== undefined) {
    params.push(minPrice); cparams.push(minPrice);
    q  += ` AND s.price >= $${params.length}`;
    cq += ` AND s.price >= $${cparams.length}`;
  }
  if (maxPrice !== undefined) {
    params.push(maxPrice); cparams.push(maxPrice);
    q  += ` AND s.price <= $${params.length}`;
    cq += ` AND s.price <= $${cparams.length}`;
  }

  q += ` ORDER BY s.created_at DESC`;
  return paginate(db, q, params, cq, cparams, page, limit);
};

const getById = async (id) => {
  const result = await db.query(
    `SELECT s.*, u.name as provider_name FROM services s
     JOIN users u ON u.id = s.provider_id
     WHERE s.id = $1 AND s.is_deleted = false`,
    [id]
  );
  if (!result.rows[0]) throw new ApiError(404, 'Service not found');
  return result.rows[0];
};

const getMyServices = async (providerId) => {
  const result = await db.query(
    `SELECT * FROM services WHERE provider_id = $1 AND is_deleted = false ORDER BY created_at DESC`,
    [providerId]
  );
  return result.rows;
};

const update = async (id, providerId, body) => {
  await findOwned(id, providerId);

  const fields = Object.keys(body);
  const values = Object.values(body);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

  const result = await db.query(
    `UPDATE services SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

const remove = async (id, providerId) => {
  await findOwned(id, providerId);
  await db.query('UPDATE services SET is_deleted = true WHERE id = $1', [id]);
};

module.exports = { create, getAll, getById, getMyServices, update, remove };
