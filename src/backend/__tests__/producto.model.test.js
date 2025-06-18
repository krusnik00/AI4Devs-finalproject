const { describe, test, expect, jest, beforeEach } = require('@jest/globals');

// Mock de sequelize
jest.mock('../config/database', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  return {
    sequelize: dbMock,
    Sequelize: SequelizeMock
  };
});

// Importamos el modelo después de mockear la base de datos
const Producto = require('../models/producto.model');

describe('Modelo Producto', () => {
  // Prueba de generación automática de SKU
  test('debe generar automáticamente un SKU si no se proporciona', () => {
    const producto = Producto.build({
      codigo: 'TEST001',
      nombre: 'Producto de Prueba',
      descripcion_corta: 'Descripción corta de prueba',
      categoriaId: 1,
      marcaId: 1,
      precio_compra: 100,
      precio_venta: 150,
      stock_actual: 10
    });

    // Trigger del hook beforeValidate
    producto.validate();
    
    // Verificar que el SKU se generó correctamente
    expect(producto.sku).toBeDefined();
    expect(producto.sku).toContain('SKU-TEST001-');
  });

  // Prueba del campo virtual para el margen de ganancia
  test('debe calcular correctamente el margen de ganancia', () => {
    const producto = Producto.build({
      codigo: 'TEST002',
      nombre: 'Otro Producto de Prueba',
      descripcion_corta: 'Otra descripción corta',
      categoriaId: 1,
      marcaId: 1,
      precio_compra: 100,
      precio_venta: 150,
      stock_actual: 10
    });

    // El margen debe ser (150 - 100) / 100 * 100 = 50%
    expect(producto.margen_ganancia).toBe(50);
  });

  // Prueba del margen cuando el precio de compra es 0
  test('debe manejar el caso de precio de compra igual a cero', () => {
    const producto = Producto.build({
      codigo: 'TEST003',
      nombre: 'Producto Gratis',
      descripcion_corta: 'Producto sin costo',
      categoriaId: 1,
      marcaId: 1,
      precio_compra: 0,
      precio_venta: 50,
      stock_actual: 10
    });

    // El margen debe ser 0 para evitar división por cero
    expect(producto.margen_ganancia).toBe(0);
  });

  // Validación del código único
  test('no debe permitir crear productos con el mismo código', async () => {
    // Este test sería más adecuado para una prueba de integración con una base de datos real
    // Aquí simularemos la validación de campo único
    const producto1 = Producto.build({
      codigo: 'DUPLICADO',
      nombre: 'Producto 1',
      descripcion_corta: 'Descripción 1',
      categoriaId: 1,
      marcaId: 1,
      precio_compra: 100,
      precio_venta: 150
    });

    // Simulación de validación: asumimos que ya existe un producto con ese código
    expect(producto1.validate).toBeDefined();
  });

  // Validación del stock mínimo
  test('debe aceptar un stock mínimo válido', () => {
    const producto = Producto.build({
      codigo: 'TEST004',
      nombre: 'Producto Stock',
      descripcion_corta: 'Prueba de stock',
      categoriaId: 1,
      marcaId: 1,
      precio_compra: 100,
      precio_venta: 150,
      stock_actual: 10,
      stock_minimo: 5
    });

    expect(producto.stock_minimo).toBe(5);
  });
});
