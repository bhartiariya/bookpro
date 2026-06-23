const Joi = require('joi');

const listUsersSchema = Joi.object({
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').default(''),
  role:   Joi.string().valid('admin', 'customer', 'provider', '').default(''),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(d => ({
      field:   d.path[0],
      message: d.message.replace(/['"]/g, ''),
    }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

module.exports = { listUsersSchema, validate };
