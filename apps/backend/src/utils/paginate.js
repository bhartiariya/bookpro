const paginate = async (db, query, params, countQuery, countParams, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  // Run data query and count query in parallel
  const [dataResult, countResult] = await Promise.all([
    db.query(query + ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
    db.query(countQuery, countParams),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: dataResult.rows,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = paginate;
