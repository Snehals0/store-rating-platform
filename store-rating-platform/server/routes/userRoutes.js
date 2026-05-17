const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkAuth, checkRole } = require('../middlewares/auth');
const { validatePasswordUpdate } = require('../middlewares/validate');

// Protect all routes within this file, explicitly requiring 'USER' role
router.use(checkAuth);
router.use(checkRole(['USER']));

router.put('/change-password', validatePasswordUpdate, userController.changePassword);
router.get('/stores', userController.getStoresWithRatings);
router.post('/ratings', userController.submitRating);

module.exports = router;
