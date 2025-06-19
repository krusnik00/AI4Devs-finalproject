const { Sequelize } = require('sequelize');
const path = require('path');

// Crear instancia de Sequelize con SQLite para desarrollo
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
  define: {
    // Desactivar las restricciones de clave foránea para SQLite
    foreignKeys: false
  }
});

module.exports = sequelize;
