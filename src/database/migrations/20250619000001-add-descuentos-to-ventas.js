'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero añadimos la columna descuento_aplicado que no tiene referencias
    await queryInterface.addColumn('ventas', 'descuento_aplicado', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false
    });

    // Luego añadimos la columna con la referencia
    await queryInterface.addColumn('ventas', 'descuento_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'descuentos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ventas', 'descuento_id');
    await queryInterface.removeColumn('ventas', 'descuento_aplicado');
  }
};
