'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('descuentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      tipo: {
        type: Sequelize.ENUM('porcentaje', 'monto_fijo', 'producto'),
        allowNull: false
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_fin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      condiciones: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo'),
        defaultValue: 'activo'
      },
      minimo_compra: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      maximo_descuento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      uso_maximo: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      usos_actuales: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('descuentos');
  }
};
