const router                            = require('express').Router();
const authController                    = require('./auth.controller');
const { validate, registerSchema,
        loginSchema }                   = require('../../validators/auth.validator');
const auth                              = require('../../middleware/auth');
const { authLimiter }                   = require('../../middleware/rateLimiter');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login',    authLimiter, validate(loginSchema),    authController.login);
router.get ('/me',       auth,                                  authController.getMe);

module.exports = router;
