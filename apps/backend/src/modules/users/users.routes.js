const router          = require('express').Router();
const usersController = require('./users.controller');
const auth            = require('../../middleware/auth');
const authorize       = require('../../middleware/authorize');

// All users routes — admin only
router.use(auth, authorize('admin'));

router.get  ('/',             usersController.getAll);
router.get  ('/:id',          usersController.getById);
router.patch('/block/:id',    usersController.toggleBlock);
router.delete('/:id',         usersController.deleteUser);

module.exports = router;
