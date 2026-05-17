const { Rating, Store } = require('../models');

// User: Submit or modify rating for a store
const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId || !rating) {
      return res.status(400).json({ error: 'Store ID and rating value are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Check if user already rated this store
    let existingRating = await Rating.findOne({ where: { userId, storeId } });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    } else {
      const newRating = await Rating.create({ userId, storeId, rating });
      return res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
       return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitRating
};
