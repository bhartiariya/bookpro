const analyticsService = require('./analytics.service');
const asyncHandler     = require('../../utils/asyncHandler');
const sendResponse     = require('../../utils/sendResponse');

const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview();
  sendResponse(res, 200, 'Overview', data);
});

const getBookingTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBookingTrend();
  sendResponse(res, 200, 'Booking trend', data);
});

const getRevenueTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.getRevenueTrend();
  sendResponse(res, 200, 'Revenue trend', data);
});

const getTopProviders = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTopProviders();
  sendResponse(res, 200, 'Top providers', data);
});

module.exports = { getOverview, getBookingTrend, getRevenueTrend, getTopProviders };
