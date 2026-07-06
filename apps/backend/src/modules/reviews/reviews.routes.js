const router           = require('express').Router();
const reviewsController = require('./reviews.controller');
const auth             = require('../../middleware/auth');
const authorize        = require('../../middleware/authorize');
const { validate, createReviewSchema } = require('../../validators/reviews.validator');

router.get('/provider/:providerId', reviewsController.getProviderReviews); // public
router.get('/service/:serviceId',   reviewsController.getServiceReviews);  // public

router.post('/', auth, authorize('customer'), validate(createReviewSchema), reviewsController.create);

module.exports = router;
