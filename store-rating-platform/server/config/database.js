require('dotenv').config({ path: __dirname + '/../.env' });
const { Sequelize } = require('sequelize');

// Using environment variables with fallbacks to defaults
const sequelize = new Sequelize(
  process.env.DB_NAME || 'store_rating_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
  }
);

module.exports = sequelize;
