const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Descuento extends Model {}

Descuento.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  tipo: {
    type: DataTypes.STRING,  // Cambiado de ENUM a STRING para SQLite
    allowNull: false,
    validate: {
      isIn: [['porcentaje', 'monto_fijo', 'producto']]
    }
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  condiciones: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  estado: {
    type: DataTypes.STRING,  // Cambiado de ENUM a STRING para SQLite
    defaultValue: 'activo',
    validate: {
      isIn: [['activo', 'inactivo']]
    }
  },
  minimo_compra: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  maximo_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  uso_maximo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usos_actuales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Descuento',
  tableName: 'descuentos',
  timestamps: true,
  paranoid: true
});

module.exports = Descuento;
