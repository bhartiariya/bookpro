const usersService = require('./users.service');
const asyncHandler = require('../../utils/asyncHandler');
const sendResponse = require('../../utils/sendResponse');

const getAll = asyncHandler(async (req, res) => {
  const { page, limit, search, role } = req.query;
  const result = await usersService.getAll({ page, limit, search, role });
  sendResponse(res, 200, 'Users fetched', result.data, result.meta);
});

const getById = asyncHandler(async (req, res) => {
  const user = await usersService.getById(req.params.id);
  sendResponse(res, 200, 'User fetched', user);
});

const toggleBlock = asyncHandler(async (req, res) => {
  const result = await usersService.toggleBlock(req.params.id, req.user.id);
  sendResponse(res, 200, `User ${result.is_blocked ? 'blocked' : 'unblocked'}`, result);
});

const deleteUser = asyncHandler(async (req, res) => {
  await usersService.softDelete(req.params.id, req.user.id);
  sendResponse(res, 200, 'User deleted successfully');
});

module.exports = { getAll, getById, toggleBlock, deleteUser };
