const Joi = require('joi');

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(50).required(),
  role:     Joi.string().valid('customer', 'provider').required(),
  // Note: 'admin' is not allowed here — admins are created manually in DB
});

const loginSchema = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
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

module.exports = { registerSchema, loginSchema, validate };
