const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { checkAuth, checkRole } = require('../middlewares/auth');
const { validatePasswordUpdate } = require('../middlewares/validate');

// Protect all routes within this file, explicitly requiring 'OWNER' role
router.use(checkAuth);
router.use(checkRole(['OWNER']));

router.put('/change-password', validatePasswordUpdate, storeController.changePassword);
router.get('/dashboard', storeController.getOwnerDashboardMetrics);

module.exports = router;
