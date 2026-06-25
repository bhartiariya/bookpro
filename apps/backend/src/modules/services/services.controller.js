const servicesService = require('./services.service');
const asyncHandler    = require('../../utils/asyncHandler');
const sendResponse    = require('../../utils/sendResponse');

const create = asyncHandler(async (req, res) => {
  const service = await servicesService.create(req.user.id, req.body);
  sendResponse(res, 201, 'Service created', service);
});

const getAll = asyncHandler(async (req, res) => {
  const { page, limit, search, category, minPrice, maxPrice } = req.query;
  const result = await servicesService.getAll({ page, limit, search, category, minPrice, maxPrice });
  sendResponse(res, 200, 'Services fetched', result.data, result.meta);
});

const getById = asyncHandler(async (req, res) => {
  const service = await servicesService.getById(req.params.id);
  sendResponse(res, 200, 'Service fetched', service);
});

const getMyServices = asyncHandler(async (req, res) => {
  const services = await servicesService.getMyServices(req.user.id);
  sendResponse(res, 200, 'Your services', services);
});

const update = asyncHandler(async (req, res) => {
  const service = await servicesService.update(req.params.id, req.user.id, req.body);
  sendResponse(res, 200, 'Service updated', service);
});

const remove = asyncHandler(async (req, res) => {
  await servicesService.remove(req.params.id, req.user.id);
  sendResponse(res, 200, 'Service deleted');
});

module.exports = { create, getAll, getById, getMyServices, update, remove };
