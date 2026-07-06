const router              = require('express').Router();
const analyticsController = require('./analytics.controller');
const auth                = require('../../middleware/auth');
const authorize           = require('../../middleware/authorize');

router.use(auth, authorize('admin'));

router.get('/overview',        analyticsController.getOverview);
router.get('/bookings/trend',  analyticsController.getBookingTrend);
router.get('/revenue/trend',   analyticsController.getRevenueTrend);
router.get('/top-providers',   analyticsController.getTopProviders);

module.exports = router;
