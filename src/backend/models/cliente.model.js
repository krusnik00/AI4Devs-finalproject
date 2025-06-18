const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('particular', 'empresa'),
    allowNull: false,
    defaultValue: 'particular'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  empresa: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      len: [0, 150]
    }
  },
  rfc: {
    type: DataTypes.STRING(13),
    allowNull: true,
    validate: {
      len: [0, 13]
    }
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  codigo_postal: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  limite_credito: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  dias_credito: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  paranoid: true, // Soft delete
  indexes: [    {
      fields: ['rfc'],
      unique: true,
      where: {
        rfc: {
          [Op.ne]: null
        }
      }
    },    {
      fields: ['correo'],
      unique: true,
      where: {
        correo: {
          [Op.ne]: null
        }
      }
    },
    {
      fields: ['telefono']
    },
    {
      fields: ['nombre', 'apellido']
    }
  ]
});

// Método virtual para obtener nombre completo
Cliente.prototype.getNombreCompleto = function() {
  if (this.tipo === 'particular') {
    return `${this.nombre} ${this.apellido || ''}`.trim();
  } else {
    return this.empresa;
  }
};

// Método para verificar límite de crédito
Cliente.prototype.verificarCreditoDisponible = function(montoCompra) {
  if (!this.limite_credito || this.limite_credito <= 0) {
    return false;
  }
  // Aquí se podría implementar lógica para verificar el saldo pendiente
  // y compararlo con el límite de crédito
  return true;
};

module.exports = Cliente;
