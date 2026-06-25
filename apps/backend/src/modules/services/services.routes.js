const router             = require('express').Router();
const servicesController = require('./services.controller');
const auth               = require('../../middleware/auth');
const authorize          = require('../../middleware/authorize');
const { validate, createServiceSchema, updateServiceSchema } = require('../../validators/services.validator');

router.get ('/',      servicesController.getAll);            // public
router.get ('/:id',   servicesController.getById);           // public

router.use(auth); // everything below requires login

router.get ('/my/list',  authorize('provider'), servicesController.getMyServices);
router.post('/',         authorize('provider'), validate(createServiceSchema), servicesController.create);
router.put ('/:id',      authorize('provider'), validate(updateServiceSchema), servicesController.update);
router.delete('/:id',    authorize('provider'), servicesController.remove);

module.exports = router;
