const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleDevolucion = sequelize.define('DetalleDevolucion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  devolucion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Devoluciones',
      key: 'id'
    }
  },
  detalle_venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DetalleVentas',
      key: 'id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // For product exchanges
  producto_cambio_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Productos',
      key: 'id'
    }
  },
  cantidad_cambio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  precio_unitario_cambio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  subtotal_cambio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  diferencia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'detalle_devoluciones'
});

module.exports = DetalleDevolucion;
