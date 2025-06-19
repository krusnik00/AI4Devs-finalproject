const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AjusteInventario = sequelize.define('AjusteInventario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    }
  },
  cantidad_anterior: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad_nueva: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  diferencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_ajuste: {
    type: DataTypes.ENUM('incremento', 'decremento'),
    allowNull: false
  },
  motivo: {
    type: DataTypes.ENUM('conteo_fisico', 'merma', 'daño', 'error_registro', 'otro'),
    allowNull: false
  },
  motivo_descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  requiere_autorizacion: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  autorizado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'autorizado', 'rechazado', 'procesado'),
    allowNull: false,
    defaultValue: 'pendiente'
  }
}, {
  timestamps: true,
  tableName: 'ajustes_inventario'
});

// Relaciones con otros modelos se establecerán en un archivo separado de asociaciones

module.exports = AjusteInventario;
