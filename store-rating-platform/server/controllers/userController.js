const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getStoresWithRatings = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.id;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const stores = await Store.findAll({
      where,
      include: [
        { model: Rating, as: 'ratings', attributes: ['rating', 'userId'] },
        { model: User, as: 'owner', attributes: ['id', 'name'] }
      ]
    });

    const parsedStores = stores.map(store => {
      const s = store.toJSON();
      let avg = 0;
      let myRating = null;

      if (s.ratings && s.ratings.length > 0) {
        const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        avg = sum / s.ratings.length;

        // Find if current user has rated this store
        const userRatingObj = s.ratings.find(r => r.userId === userId);
        if (userRatingObj) {
          myRating = userRatingObj.rating;
        }
      }

      // Remove the full ratings array from the response to save bandwidth
      delete s.ratings;

      return {
        ...s,
        averageRating: avg.toFixed(1),
        myRating
      };
    });

    res.json(parsedStores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

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

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Using findOne/update or create flow to ensure only one rating per user per store
    let existingRating = await Rating.findOne({ where: { userId, storeId } });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return res.json({ message: 'Rating updated successfully.', rating: existingRating });
    } else {
      const newRating = await Rating.create({ userId, storeId, rating });
      return res.status(201).json({ message: 'Rating submitted successfully.', rating: newRating });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  changePassword,
  getStoresWithRatings,
  submitRating
};
