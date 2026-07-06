const Joi = require('joi');
const { validate } = require('./auth.validator');

const createReviewSchema = Joi.object({
  booking_id: Joi.string().uuid().required(),
  rating:     Joi.number().integer().min(1).max(5).required(),
  comment:    Joi.string().max(500).optional(),
});

module.exports = { createReviewSchema, validate };
