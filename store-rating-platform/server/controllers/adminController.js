const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'USER'
    });

    res.status(201).json({ message: 'User created successfully.', user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, address, ownerId } = req.body;
    
    // Validate Owner
    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== 'OWNER') {
      return res.status(400).json({ error: 'Valid Owner ID is required.' });
    }

    const newStore = await Store.create({ name, address, ownerId });
    res.status(201).json({ message: 'Store created successfully.', store: newStore });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
       return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role, sortBy = 'createdAt', order = 'DESC' } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const users = await User.findAll({
      where,
      order: [[sortField, sortOrder]],
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'stores',
          include: [{ model: Rating, as: 'ratings', attributes: ['rating'] }]
        }
      ]
    });

    const parsedUsers = users.map(user => {
      const u = user.toJSON();
      if (u.role === 'OWNER' && u.stores && u.stores.length > 0) {
        u.stores = u.stores.map(store => {
          let avg = 0;
          if (store.ratings && store.ratings.length > 0) {
            const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
            avg = sum / store.ratings.length;
          }
          return { ...store, averageRating: avg.toFixed(1) };
        });
      }
      return u;
    });

    res.json(parsedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getStores = async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', order = 'DESC' } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const validSortFields = ['name', 'address', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const stores = await Store.findAll({
      where,
      order: [[sortField, sortOrder]],
      include: [
        { model: Rating, as: 'ratings', attributes: ['rating'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });

    const storesWithAvg = stores.map(store => {
      const s = store.toJSON();
      let avg = 0;
      if (s.ratings && s.ratings.length > 0) {
        const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        avg = sum / s.ratings.length;
      }
      return { ...s, averageRating: avg.toFixed(1) };
    });

    res.json(storesWithAvg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores
};
