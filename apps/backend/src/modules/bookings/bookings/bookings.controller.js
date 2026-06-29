const bookingsService = require('./bookings.service');
const asyncHandler    = require('../../utils/asyncHandler');
const sendResponse    = require('../../utils/sendResponse');

const create = asyncHandler(async (req, res) => {
  const booking = await bookingsService.create(req.user.id, req.body);
  sendResponse(res, 201, 'Booking created', booking);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingsService.getMyBookings(req.user.id, req.query);
  sendResponse(res, 200, 'Bookings fetched', result.data, result.meta);
});

const getProviderBookings = asyncHandler(async (req, res) => {
  const result = await bookingsService.getProviderBookings(req.user.id, req.query);
  sendResponse(res, 200, 'Bookings fetched', result.data, result.meta);
});

const getById = asyncHandler(async (req, res) => {
  const booking = await bookingsService.getById(req.params.id, req.user.id);
  sendResponse(res, 200, 'Booking fetched', booking);
});

const confirm = asyncHandler(async (req, res) => {
  const booking = await bookingsService.confirm(req.params.id, req.user.id);
  sendResponse(res, 200, 'Booking confirmed', booking);
});

const reject = asyncHandler(async (req, res) => {
  const booking = await bookingsService.reject(req.params.id, req.user.id);
  sendResponse(res, 200, 'Booking rejected', booking);
});

const cancel = asyncHandler(async (req, res) => {
  const booking = await bookingsService.cancel(req.params.id, req.user.id, req.user.role, req.body);
  sendResponse(res, 200, 'Booking cancelled', booking);
});

const complete = asyncHandler(async (req, res) => {
  const booking = await bookingsService.complete(req.params.id, req.user.id);
  sendResponse(res, 200, 'Booking completed', booking);
});

module.exports = { create, getMyBookings, getProviderBookings, getById, confirm, reject, cancel, complete };
