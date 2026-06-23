const authService    = require('./auth.service');
const asyncHandler   = require('../../utils/asyncHandler');
const sendResponse   = require('../../utils/sendResponse');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  sendResponse(res, 201, 'Registered successfully', user);
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  sendResponse(res, 200, 'Login successful', data);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  sendResponse(res, 200, 'User fetched', user);
});

module.exports = { register, login, getMe };
