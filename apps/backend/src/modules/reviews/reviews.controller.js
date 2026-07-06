const reviewsService = require('./reviews.service');
const asyncHandler   = require('../../utils/asyncHandler');
const sendResponse   = require('../../utils/sendResponse');

const create = asyncHandler(async (req, res) => {
  const review = await reviewsService.create(req.user.id, req.body);
  sendResponse(res, 201, 'Review submitted', review);
});

const getProviderReviews = asyncHandler(async (req, res) => {
  const result = await reviewsService.getProviderReviews(req.params.providerId, req.query);
  sendResponse(res, 200, 'Reviews fetched', result.data, result.meta);
});

const getServiceReviews = asyncHandler(async (req, res) => {
  const result = await reviewsService.getServiceReviews(req.params.serviceId);
  sendResponse(res, 200, 'Reviews fetched', result);
});

module.exports = { create, getProviderReviews, getServiceReviews };
