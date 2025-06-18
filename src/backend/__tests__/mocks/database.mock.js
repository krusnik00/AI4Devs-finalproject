const { Sequelize } = require('sequelize');

// Create a Sequelize instance with SQLite in-memory database for testing
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

module.exports = {
  sequelize,
  Sequelize
};
