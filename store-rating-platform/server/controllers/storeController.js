const { Store, Rating, User } = require('../models');
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

const getOwnerDashboardMetrics = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Use efficient eager loading via associations
    const store = await Store.findOne({
      where: { ownerId },
      include: [
        {
          model: Rating,
          as: 'ratings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'] // Only fetch necessary user details
            }
          ]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({ error: 'No store found for this owner.' });
    }

    const s = store.toJSON();
    let avg = 0;
    
    if (s.ratings && s.ratings.length > 0) {
      const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      avg = sum / s.ratings.length;
    }

    // Prepare response structure
    const dashboardMetrics = {
      storeId: s.id,
      storeName: s.name,
      address: s.address,
      averageRating: avg.toFixed(1),
      ratingsList: s.ratings.map(r => ({
        ratingId: r.id,
        ratingValue: r.rating,
        userName: r.user.name,
        userEmail: r.user.email,
        submittedAt: r.createdAt
      }))
    };

    res.json(dashboardMetrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  changePassword,
  getOwnerDashboardMetrics
};
