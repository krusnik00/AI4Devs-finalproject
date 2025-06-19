'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ventas', 'descuento_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'descuentos',
        key: 'id'
      }
    });

    await queryInterface.addColumn('ventas', 'descuento_aplicado', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ventas', 'descuento_id');
    await queryInterface.removeColumn('ventas', 'descuento_aplicado');
  }
};
