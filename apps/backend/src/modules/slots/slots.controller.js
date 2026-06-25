const slotsService = require('./slots.service');
const asyncHandler = require('../../utils/asyncHandler');
const sendResponse = require('../../utils/sendResponse');

const create = asyncHandler(async (req, res) => {
  const slot = await slotsService.create(req.user.id, req.body);
  sendResponse(res, 201, 'Slot created', slot);
});

const getByProvider = asyncHandler(async (req, res) => {
  const slots = await slotsService.getByProvider(req.params.providerId);
  sendResponse(res, 200, 'Slots fetched', slots);
});

const getAvailable = asyncHandler(async (req, res) => {
  const slots = await slotsService.getAvailable(req.params.providerId);
  sendResponse(res, 200, 'Available slots', slots);
});

const remove = asyncHandler(async (req, res) => {
  await slotsService.remove(req.params.id, req.user.id);
  sendResponse(res, 200, 'Slot deleted');
});

module.exports = { create, getByProvider, getAvailable, remove };
