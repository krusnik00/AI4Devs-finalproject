const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleCompra = sequelize.define('DetalleCompra', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    compraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Compras',
        key: 'id'
      }
    },
    productoId: {
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
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'detalles_compra',
    timestamps: true
  });

  DetalleCompra.associate = (models) => {
    DetalleCompra.belongsTo(models.Compra, {
      foreignKey: 'compraId',
      as: 'compra'
    });
    
    DetalleCompra.belongsTo(models.Producto, {
      foreignKey: 'productoId',
      as: 'producto'
    });
  };
module.exports = DetalleCompra;
