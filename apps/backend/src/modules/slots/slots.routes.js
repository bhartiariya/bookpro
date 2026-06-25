const router          = require('express').Router();
const slotsController = require('./slots.controller');
const auth            = require('../../middleware/auth');
const authorize       = require('../../middleware/authorize');
const { validate, createSlotSchema } = require('../../validators/slots.validator');

// Public — customers need to see available slots before booking
router.get('/provider/:providerId',           slotsController.getByProvider);
router.get('/provider/:providerId/available', slotsController.getAvailable);

// Provider only
router.post('/',       auth, authorize('provider'), validate(createSlotSchema), slotsController.create);
router.delete('/:id',  auth, authorize('provider'), slotsController.remove);

module.exports = router;
