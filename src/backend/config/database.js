const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Crear instancia de Sequelize con SQLite para desarrollo
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: __dirname + '/../database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

module.exports = {
  sequelize,
  Sequelize
};
