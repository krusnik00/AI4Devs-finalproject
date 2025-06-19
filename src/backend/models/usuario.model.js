const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcryptjs = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      // Hash la contraseña antes de guardarla
      const salt = bcryptjs.genSaltSync(10);
      const hash = bcryptjs.hashSync(value, salt);
      this.setDataValue('password', hash);
    }
  },
  rol: {
    type: DataTypes.ENUM('admin', 'vendedor', 'almacen'),
    defaultValue: 'vendedor'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'usuarios'
});

// Método para verificar contraseña
Usuario.prototype.verificarPassword = function(password) {
  return bcryptjs.compareSync(password, this.password);
};

module.exports = Usuario;
