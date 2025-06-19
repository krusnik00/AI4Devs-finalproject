const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Devolucion = sequelize.define('Devolucion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ventas',
      key: 'id'
    }
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Clientes',
      key: 'id'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  fecha_devolucion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  impuestos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('devolucion', 'cambio'),
    allowNull: false,
    defaultValue: 'devolucion'
  },
  motivo: {
    type: DataTypes.ENUM('defectuoso', 'equivocado', 'otro'),
    allowNull: false
  },
  descripcion_motivo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_reembolso: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'nota_credito', 'cambio_producto'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completada', 'cancelada'),
    allowNull: false,
    defaultValue: 'completada'
  },
  autorizado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'devoluciones'
});

module.exports = Devolucion;
