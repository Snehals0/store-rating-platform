const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAuth, checkRole } = require('../middlewares/auth');

// Protect all routes within this file, explicitly requiring 'ADMIN' role
router.use(checkAuth);
router.use(checkRole(['ADMIN']));

router.get('/stats', adminController.getDashboardStats);
router.post('/users', adminController.createUser);
router.get('/users', adminController.getUsers);
router.post('/stores', adminController.createStore);
router.get('/stores', adminController.getStores);

module.exports = router;
