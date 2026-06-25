const Joi = require('joi');
const { validate } = require('./auth.validator'); // reuse the validate helper

const createServiceSchema = Joi.object({
  title:         Joi.string().min(3).max(200).required(),
  description:   Joi.string().max(1000).optional(),
  price:         Joi.number().min(0).required(),
  duration_mins: Joi.number().integer().min(15).required(),
  category:      Joi.string().max(100).optional(),
});

const updateServiceSchema = Joi.object({
  title:         Joi.string().min(3).max(200),
  description:   Joi.string().max(1000),
  price:         Joi.number().min(0),
  duration_mins: Joi.number().integer().min(15),
  category:      Joi.string().max(100),
  is_active:     Joi.boolean(),
}).min(1); // at least one field required

module.exports = { createServiceSchema, updateServiceSchema, validate };
