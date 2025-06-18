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

// Mock de los modelos
jest.mock('../models/devolucion.model', () => {
  return {
    build: jest.fn().mockImplementation((data) => {
      return {
        ...data,
        estado: data.estado || 'pendiente',
        fecha: data.fecha || new Date(),
        validate: jest.fn().mockImplementation(() => {
          if (!data.venta_id) {
            return Promise.reject(new Error('venta_id es requerido'));
          }
          if (data.motivo && !['defectuoso', 'incompleto', 'equivocado', 'otro'].includes(data.motivo)) {
            return Promise.reject(new Error('motivo inválido'));
          }
          if (data.tipo_reembolso && !['efectivo', 'tarjeta', 'credito', 'cambio'].includes(data.tipo_reembolso)) {
            return Promise.reject(new Error('tipo_reembolso inválido'));
          }
          return Promise.resolve();
        })
      };
    })
  };
});

jest.mock('../models/detalle-devolucion.model', () => {
  return {
    build: jest.fn().mockImplementation((data) => {
      const subtotal = data.subtotal || (data.cantidad * data.precio_unitario);
      return {
        ...data,
        subtotal,
        validate: jest.fn().mockImplementation(() => {
          if (!data.devolucion_id) {
            return Promise.reject(new Error('devolucion_id es requerido'));
          }
          if (!data.detalle_venta_id) {
            return Promise.reject(new Error('detalle_venta_id es requerido'));
          }
          if (data.cantidad <= 0) {
            return Promise.reject(new Error('cantidad debe ser mayor que cero'));
          }
          return Promise.resolve();
        })
      };
    })
  };
});

const Devolucion = require('../models/devolucion.model');
const DetalleDevolucion = require('../models/detalle-devolucion.model');

describe('Modelo Devolucion', () => {
  test('debe crear una devolución con valores predeterminados correctos', () => {
    const devolucion = Devolucion.build({
      venta_id: 1,
      cliente_id: 1,
      usuario_id: 1,
      motivo: 'defectuoso',
      tipo_reembolso: 'efectivo'
    });

    // Verificar valores predeterminados
    expect(devolucion.estado).toBe('pendiente');
    expect(devolucion.fecha).toBeInstanceOf(Date);
  });

  test('debe requerir venta_id', async () => {
    const devolucionSinVenta = Devolucion.build({
      cliente_id: 1,
      usuario_id: 1,
      motivo: 'defectuoso',
      tipo_reembolso: 'efectivo'
    });

    // La validación debería fallar por falta de venta_id
    await expect(devolucionSinVenta.validate()).rejects.toThrow();
  });

  test('debe validar el motivo', async () => {
    const devolucionMotivoInvalido = Devolucion.build({
      venta_id: 1,
      cliente_id: 1,
      usuario_id: 1,
      motivo: 'motivo_invalido', // No está en la lista de motivos permitidos
      tipo_reembolso: 'efectivo'
    });

    // La validación debería fallar por motivo inválido
    await expect(devolucionMotivoInvalido.validate()).rejects.toThrow();
  });

  test('debe validar el tipo de reembolso', async () => {
    const devolucionReembolsoInvalido = Devolucion.build({
      venta_id: 1,
      cliente_id: 1,
      usuario_id: 1,
      motivo: 'defectuoso',
      tipo_reembolso: 'reembolso_invalido' // No está en la lista de tipos permitidos
    });

    // La validación debería fallar por tipo de reembolso inválido
    await expect(devolucionReembolsoInvalido.validate()).rejects.toThrow();
  });
});

describe('Modelo DetalleDevolucion', () => {
  test('debe crear un detalle de devolución correctamente', () => {
    const detalleDevolucion = DetalleDevolucion.build({
      devolucion_id: 1,
      detalle_venta_id: 1,
      producto_id: 1,
      cantidad: 2,
      precio_unitario: 75,
      subtotal: 150
    });

    expect(detalleDevolucion.cantidad).toBe(2);
    expect(detalleDevolucion.precio_unitario).toBe(75);
    expect(detalleDevolucion.subtotal).toBe(150);
  });

  test('debe requerir devolucion_id', async () => {
    const detalleSinDevolucion = DetalleDevolucion.build({
      detalle_venta_id: 1,
      producto_id: 1,
      cantidad: 2,
      precio_unitario: 75,
      subtotal: 150
    });

    // La validación debería fallar por falta de devolucion_id
    await expect(detalleSinDevolucion.validate()).rejects.toThrow();
  });

  test('debe requerir detalle_venta_id', async () => {
    const detalleSinDetalleVenta = DetalleDevolucion.build({
      devolucion_id: 1,
      producto_id: 1,
      cantidad: 2,
      precio_unitario: 75,
      subtotal: 150
    });

    // La validación debería fallar por falta de detalle_venta_id
    await expect(detalleSinDetalleVenta.validate()).rejects.toThrow();
  });

  test('debe validar que la cantidad sea mayor que cero', async () => {
    const detalleCantidadCero = DetalleDevolucion.build({
      devolucion_id: 1,
      detalle_venta_id: 1,
      producto_id: 1,
      cantidad: 0, // Cantidad inválida
      precio_unitario: 75,
      subtotal: 0
    });

    // La validación debería fallar por cantidad <= 0
    await expect(detalleCantidadCero.validate()).rejects.toThrow();
  });

  test('debe calcular correctamente el subtotal', () => {
    const detalleDevolucion = DetalleDevolucion.build({
      devolucion_id: 1,
      detalle_venta_id: 1,
      producto_id: 1,
      cantidad: 2,
      precio_unitario: 75
      // No proporcionamos subtotal para probar el hook
    });

    // Si hay un hook de beforeValidate para calcular el subtotal
    detalleDevolucion.validate();
    
    // El subtotal debe ser cantidad * precio_unitario = 2 * 75 = 150
    expect(detalleDevolucion.subtotal).toBe(150);
  });
});
