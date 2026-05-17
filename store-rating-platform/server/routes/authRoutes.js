const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validatePasswordUpdate } = require('../middlewares/validate');
const { checkAuth } = require('../middlewares/auth');

// Public endpoints
router.post('/login', authController.login);
router.post('/register', validateRegistration, authController.register);

// Protected endpoints for ALL authenticated users
router.put('/change-password', checkAuth, validatePasswordUpdate, authController.updatePassword);

module.exports = router;
