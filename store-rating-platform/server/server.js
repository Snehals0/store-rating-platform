require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import Models to initialize associations before syncing
require('./models');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');

const app = express();

// Standard Security & Body Parsing Middlewares
app.use(cors());
app.use(express.json());

// API Routing
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes); // Acting as Owner Routes based on naming convention

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

const PORT = process.env.PORT || 5000;

// Database Connection & Sync handling
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Using alter: true to safely update schema to match models without dropping data
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database. The server will not start.', err);
    process.exit(1); // Exit process if DB is unreachable
  });
