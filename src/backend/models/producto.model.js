const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  sku: {
    type: DataTypes.STRING,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  descripcion_corta: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categorias',
      key: 'id'
    }
  },
  marcaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Marcas',
      key: 'id'
    }
  },
  modelo_compatible: {
    type: DataTypes.STRING,
    allowNull: true
  },
  anio_compatible: {
    type: DataTypes.STRING,
    allowNull: true
  },
  precio_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  margen_ganancia: {
    type: DataTypes.VIRTUAL,
    get() {
      const compra = parseFloat(this.precio_compra);
      const venta = parseFloat(this.precio_venta);
      if (compra === 0) return 0;
      return Number(((venta - compra) / compra * 100).toFixed(2));
    }
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 0
    }
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imagen_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  codigo_barras: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'productos',
  hooks: {
    beforeValidate: (producto) => {
      // Generate SKU if not provided
      if (!producto.sku && producto.codigo) {
        const prefix = 'SKU';
        const timestamp = new Date().getTime().toString().slice(-6);
        producto.sku = `${prefix}-${producto.codigo}-${timestamp}`;
      }
    }
  }
});

// Relaciones con otros modelos se establecerán en un archivo separado de asociaciones

module.exports = Producto;
