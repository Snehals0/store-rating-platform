const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { checkAuth, checkRole } = require('../middlewares/auth');

router.use(checkAuth);

// Only Normal Users can submit/modify ratings
router.post('/', checkRole(['USER']), ratingController.submitRating);

module.exports = router;
