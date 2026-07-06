const router             = require('express').Router();
const bookingsController = require('./bookings.controller');
const auth               = require('../../middleware/auth');
const authorize          = require('../../middleware/authorize');
const { validate, createBookingSchema, cancelBookingSchema } = require('../../validators/bookings.validator');

router.use(auth);

router.post('/',          authorize('customer'), validate(createBookingSchema), bookingsController.create);
router.get ('/my',        authorize('customer'), bookingsController.getMyBookings);
router.get ('/provider',  authorize('provider'), bookingsController.getProviderBookings);
router.get ('/:id',       bookingsController.getById);

router.patch('/:id/confirm',  authorize('provider'), bookingsController.confirm);
router.patch('/:id/reject',   authorize('provider'), bookingsController.reject);
router.patch('/:id/cancel',   validate(cancelBookingSchema), bookingsController.cancel);
router.patch('/:id/complete', authorize('provider'), bookingsController.complete);

module.exports = router;
