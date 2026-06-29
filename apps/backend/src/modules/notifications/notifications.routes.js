const router                  = require('express').Router();
const notificationsController = require('./notifications.controller');
const auth                    = require('../../middleware/auth');

router.use(auth);

router.get ('/',              notificationsController.getMyNotifications);
router.get ('/unread-count',  notificationsController.getUnreadCount);
router.patch('/read-all',     notificationsController.markAllRead);
router.patch('/:id/read',     notificationsController.markOneRead);

module.exports = router;
