const notificationsService = require('./notifications.service');
const asyncHandler         = require('../../utils/asyncHandler');
const sendResponse         = require('../../utils/sendResponse');

const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationsService.getMyNotifications(req.user.id, req.query);
  sendResponse(res, 200, 'Notifications fetched', result.data, result.meta);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationsService.getUnreadCount(req.user.id);
  sendResponse(res, 200, 'Unread count', { count });
});

const markOneRead = asyncHandler(async (req, res) => {
  const n = await notificationsService.markOneRead(req.params.id, req.user.id);
  sendResponse(res, 200, 'Marked as read', n);
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user.id);
  sendResponse(res, 200, 'All marked as read');
});

module.exports = { getMyNotifications, getUnreadCount, markOneRead, markAllRead };
