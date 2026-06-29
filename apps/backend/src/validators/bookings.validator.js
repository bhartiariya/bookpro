const Joi = require('joi');
const { validate } = require('./auth.validator');

const createBookingSchema = Joi.object({
  service_id: Joi.string().uuid().required(),
  slot_id:    Joi.string().uuid().required(),
  notes:      Joi.string().max(500).optional(),
});

const cancelBookingSchema = Joi.object({
  cancel_reason: Joi.string().max(500).optional(),
});

module.exports = { createBookingSchema, cancelBookingSchema, validate };
