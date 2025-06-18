const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductoProveedor = sequelize.define('ProductoProveedor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Productos',
        key: 'id'
      }
    },
    proveedorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Proveedores',
        key: 'id'
      }
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Código del producto según el proveedor'
    },
    precioCompra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    tiempoEntrega: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tiempo estimado de entrega en días'
    },
    esProveedorPrincipal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'productos_proveedores',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['productoId', 'proveedorId']
      }
    ]
  });

  ProductoProveedor.associate = (models) => {
    ProductoProveedor.belongsTo(models.Producto, {
      foreignKey: 'productoId',
      as: 'producto'
    });
    
    ProductoProveedor.belongsTo(models.Proveedor, {
      foreignKey: 'proveedorId',
      as: 'proveedor'
    });
  };
module.exports = ProductoProveedor;
