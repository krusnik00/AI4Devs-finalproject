const { describe, test, expect, jest, beforeEach } = require('@jest/globals');
const request = require('supertest');
const app = require('../test-server');
const jwt = require('jsonwebtoken');
const { Devolucion } = require('../models');

// Mock de jsonwebtoken
jest.mock('jsonwebtoken');

// Mock de models
jest.mock('../models', () => {
  const mockDevolucion = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };
  
  return {
    Devolucion: mockDevolucion
  };
});

describe('Devolucion Routes - Authorization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería rechazar el acceso a la lista de devoluciones sin token', async () => {
    const response = await request(app)
      .get('/api/devoluciones');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Acceso denegado. Token no proporcionado.');
  });

  test('debería rechazar el acceso con un token inválido', async () => {
    const response = await request(app)
      .get('/api/devoluciones')
      .set('Authorization', 'Bearer invalid_token');

    jwt.verify.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    expect(response.status).toBe(401);
  });

  test('debería permitir acceso con token válido', async () => {
    // Configurar el mock de jwt
    const mockUsuario = { id: 1, nombre: 'Test User', rol: 'admin' };
    jwt.verify.mockReturnValue(mockUsuario);

    // Configurar mock de devolucion.findAll
    const mockDevoluciones = [
      { id: 1, venta_id: 1, motivo: 'defectuoso', estado: 'pendiente' },
      { id: 2, venta_id: 2, motivo: 'incompleto', estado: 'aprobado' }
    ];
    Devolucion.findAll.mockResolvedValue(mockDevoluciones);

    const response = await request(app)
      .get('/api/devoluciones')
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('debería rechazar la creación de devolución sin permisos adecuados', async () => {
    // Configurar el mock de jwt para un usuario con rol de solo lectura
    const mockUsuario = { id: 1, nombre: 'Read Only User', rol: 'consulta' };
    jwt.verify.mockReturnValue(mockUsuario);

    const devolucionData = {
      venta_id: 1,
      motivo: 'defectuoso',
      comentario: 'Producto llegó dañado'
    };

    const response = await request(app)
      .post('/api/devoluciones')
      .set('Authorization', 'Bearer valid_token')
      .send(devolucionData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'No tiene permisos suficientes');
  });

  test('debería permitir la creación de devolución con permisos adecuados', async () => {
    // Configurar el mock de jwt para un usuario con rol de ventas
    const mockUsuario = { id: 1, nombre: 'Sales User', rol: 'ventas' };
    jwt.verify.mockReturnValue(mockUsuario);

    const devolucionData = {
      venta_id: 1,
      motivo: 'defectuoso',
      comentario: 'Producto llegó dañado'
    };

    const mockCreatedDevolucion = {
      id: 3,
      ...devolucionData,
      estado: 'pendiente',
      creado_por: 1,
      createdAt: new Date()
    };

    Devolucion.create.mockResolvedValue(mockCreatedDevolucion);

    const response = await request(app)
      .post('/api/devoluciones')
      .set('Authorization', 'Bearer valid_token')
      .send(devolucionData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 3);
  });

  test('debería permitir la aprobación de devolución solo con rol de administrador', async () => {
    // Configurar el mock de jwt para un usuario administrador
    const mockUsuario = { id: 1, nombre: 'Admin User', rol: 'admin' };
    jwt.verify.mockReturnValue(mockUsuario);

    const mockExistingDevolucion = {
      id: 1,
      venta_id: 1,
      motivo: 'defectuoso',
      estado: 'pendiente',
      creado_por: 2
    };

    Devolucion.findByPk.mockResolvedValue(mockExistingDevolucion);
    Devolucion.update.mockResolvedValue([1]);

    const response = await request(app)
      .put('/api/devoluciones/1/aprobar')
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(200);
    expect(Devolucion.update).toHaveBeenCalledWith(
      { estado: 'aprobado', aprobado_por: 1 },
      { where: { id: '1' } }
    );
  });

  test('debería rechazar la aprobación de devolución con usuario no administrador', async () => {
    // Configurar el mock de jwt para un usuario vendedor sin privilegios de aprobación
    const mockUsuario = { id: 2, nombre: 'Sales User', rol: 'ventas' };
    jwt.verify.mockReturnValue(mockUsuario);

    const mockExistingDevolucion = {
      id: 1,
      venta_id: 1,
      motivo: 'defectuoso',
      estado: 'pendiente',
      creado_por: 2
    };

    Devolucion.findByPk.mockResolvedValue(mockExistingDevolucion);

    const response = await request(app)
      .put('/api/devoluciones/1/aprobar')
      .set('Authorization', 'Bearer valid_token');

    expect(response.status).toBe(403);
    expect(Devolucion.update).not.toHaveBeenCalled();
  });
});
