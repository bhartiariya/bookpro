const Joi = require('joi');
const { validate } = require('./auth.validator');

const createSlotSchema = Joi.object({
  service_id: Joi.string().uuid().required(),
  start_time: Joi.date().iso().greater('now').required(), // no past dates
  end_time:   Joi.date().iso().greater(Joi.ref('start_time')).required(),
});

module.exports = { createSlotSchema, validate };
