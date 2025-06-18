const request = require('supertest');
const { sequelize, Devolucion, DetalleDevolucion, Venta, DetalleVenta, Producto } = require('../models');
const { generarToken } = require('../utils/auth');

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => 
  require('./mocks/auth.middleware.mock')
);

// Import app after mocking dependencies
const app = require('../test-server');

describe('Devoluciones API', () => {
  let token;
  let ventaId;
  let devolucionId;
  let productoId1;
  let productoId2;
  let detalleVentaId;
  let usuarioAdminId = 1; // Asumiendo que existe un usuario admin con ID 1

  // Preparar datos de prueba
  beforeAll(async () => {
    // Generar token de autenticación
    token = generarToken({ id: usuarioAdminId, rol: 'admin' });
    
    // Crear productos de prueba
    const producto1 = await Producto.create({
      codigo: 'TEST-DEV-001',
      nombre: 'Producto de prueba para devoluciones 1',
      descripcion_corta: 'Producto test 1',
      categoriaId: 1,
      marcaId: 1,
      precio_compra: 100,
      precio_venta: 150,
      stock_actual: 20
    });
    productoId1 = producto1.id;
    
    const producto2 = await Producto.create({
      codigo: 'TEST-DEV-002',
      nombre: 'Producto de prueba para devoluciones 2',
      descripcion_corta: 'Producto test 2',
      categoriaId: 1,
      marcaId: 1,
      precio_compra: 200,
      precio_venta: 300,
      stock_actual: 15
    });
    productoId2 = producto2.id;
    
    // Crear una venta de prueba
    const venta = await Venta.create({
      cliente_id: null, // Venta a público general
      usuario_id: usuarioAdminId,
      fecha: new Date(),
      subtotal: 150,
      impuestos: 24,
      total: 174,
      tipo_pago: 'efectivo',
      estado: 'completada'
    });
    ventaId = venta.id;
    
    // Crear detalle de venta
    const detalleVenta = await DetalleVenta.create({
      venta_id: ventaId,
      producto_id: productoId1,
      cantidad: 1,
      precio_unitario: 150,
      subtotal: 150
    });
    detalleVentaId = detalleVenta.id;
  });
  
  // Limpiar datos de prueba
  afterAll(async () => {
    await DetalleDevolucion.destroy({ where: {}, force: true });
    await Devolucion.destroy({ where: {}, force: true });
    await DetalleVenta.destroy({ where: {}, force: true });
    await Venta.destroy({ where: {}, force: true });
    await Producto.destroy({ where: { id: [productoId1, productoId2] }, force: true });
    
    await sequelize.close();
  });
  
  // Pruebas
  describe('POST /api/devoluciones', () => {
    it('debe crear una nueva devolución', async () => {
      const res = await request(app)
        .post('/api/devoluciones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          venta_id: ventaId,
          motivo: 'defectuoso',
          descripcion_motivo: 'El producto llegó dañado',
          tipo_reembolso: 'efectivo',
          detalles: [
            {
              detalle_venta_id: detalleVentaId,
              cantidad: 1
            }
          ]
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('devolucion');
      expect(res.body.devolucion).toHaveProperty('id');
      
      devolucionId = res.body.devolucion.id;
    });
    
    it('debe rechazar una devolución con productos inexistentes en la venta', async () => {
      const res = await request(app)
        .post('/api/devoluciones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          venta_id: ventaId,
          motivo: 'defectuoso',
          tipo_reembolso: 'efectivo',
          detalles: [
            {
              detalle_venta_id: 9999, // ID inexistente
              cantidad: 1
            }
          ]
        });
      
      expect(res.statusCode).toEqual(400);
    });
    
    it('debe rechazar una devolución con cantidad mayor a la vendida', async () => {
      const res = await request(app)
        .post('/api/devoluciones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          venta_id: ventaId,
          motivo: 'defectuoso',
          tipo_reembolso: 'efectivo',
          detalles: [
            {
              detalle_venta_id: detalleVentaId,
              cantidad: 2 // Solo se vendió 1
            }
          ]
        });
      
      expect(res.statusCode).toEqual(400);
    });
  });
  
  describe('GET /api/devoluciones', () => {
    it('debe listar las devoluciones existentes', async () => {
      const res = await request(app)
        .get('/api/devoluciones')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('devoluciones');
      expect(Array.isArray(res.body.devoluciones)).toBeTruthy();
    });
  });
  
  describe('GET /api/devoluciones/:id', () => {
    it('debe obtener los detalles de una devolución específica', async () => {
      const res = await request(app)
        .get(`/api/devoluciones/${devolucionId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', devolucionId);
      expect(res.body).toHaveProperty('detalles');
      expect(Array.isArray(res.body.detalles)).toBeTruthy();
    });
    
    it('debe devolver 404 para una devolución inexistente', async () => {
      const res = await request(app)
        .get('/api/devoluciones/9999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
    });
  });
  
  describe('GET /api/devoluciones/pendientes/count', () => {
    it('debe obtener el conteo de devoluciones pendientes', async () => {
      const res = await request(app)
        .get('/api/devoluciones/pendientes/count')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('count');
      expect(typeof res.body.count).toBe('number');
    });
  });
  
  describe('POST /api/devoluciones/:id/autorizar', () => {
    it('debe autorizar una devolución pendiente', async () => {
      // Primero crear una devolución que requiera autorización
      const ventaGrande = await Venta.create({
        cliente_id: null,
        usuario_id: usuarioAdminId,
        fecha: new Date(),
        subtotal: 2000,
        impuestos: 320,
        total: 2320,
        tipo_pago: 'efectivo',
        estado: 'completada'
      });
      
      const detalleVentaGrande = await DetalleVenta.create({
        venta_id: ventaGrande.id,
        producto_id: productoId1,
        cantidad: 2,
        precio_unitario: 1000,
        subtotal: 2000
      });
      
      // Crear devolución que requiera autorización (> $1000)
      const resCreacion = await request(app)
        .post('/api/devoluciones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          venta_id: ventaGrande.id,
          motivo: 'otro',
          descripcion_motivo: 'Cliente cambió de opinión',
          tipo_reembolso: 'efectivo',
          detalles: [
            {
              detalle_venta_id: detalleVentaGrande.id,
              cantidad: 1
            }
          ]
        });
      
      expect(resCreacion.body.devolucion.estado).toBe('pendiente');
      const devolucionPendienteId = resCreacion.body.devolucion.id;
      
      // Autorizar la devolución
      const resAuth = await request(app)
        .post(`/api/devoluciones/${devolucionPendienteId}/autorizar`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(resAuth.statusCode).toEqual(200);
      
      // Verificar que la devolución ahora está completada
      const resVerificar = await request(app)
        .get(`/api/devoluciones/${devolucionPendienteId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(resVerificar.body.estado).toBe('completada');
    });
  });
  
  describe('POST /api/devoluciones/:id/cancelar', () => {
    it('debe cancelar una devolución pendiente', async () => {
      // Crear otra devolución que requiera autorización para luego cancelarla
      const ventaGrande2 = await Venta.create({
        cliente_id: null,
        usuario_id: usuarioAdminId,
        fecha: new Date(),
        subtotal: 2000,
        impuestos: 320,
        total: 2320,
        tipo_pago: 'efectivo',
        estado: 'completada'
      });
      
      const detalleVentaGrande2 = await DetalleVenta.create({
        venta_id: ventaGrande2.id,
        producto_id: productoId2,
        cantidad: 2,
        precio_unitario: 1000,
        subtotal: 2000
      });
      
      // Crear devolución que requiera autorización
      const resCreacion = await request(app)
        .post('/api/devoluciones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          venta_id: ventaGrande2.id,
          motivo: 'otro',
          descripcion_motivo: 'Cliente cambió de opinión',
          tipo_reembolso: 'efectivo',
          detalles: [
            {
              detalle_venta_id: detalleVentaGrande2.id,
              cantidad: 1
            }
          ]
        });
      
      const devolucionPendienteId = resCreacion.body.devolucion.id;
      
      // Cancelar la devolución
      const resCancelar = await request(app)
        .post(`/api/devoluciones/${devolucionPendienteId}/cancelar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ motivo: 'Información incorrecta' });
      
      expect(resCancelar.statusCode).toEqual(200);
      
      // Verificar que la devolución ahora está cancelada
      const resVerificar = await request(app)
        .get(`/api/devoluciones/${devolucionPendienteId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(resVerificar.body.estado).toBe('cancelada');
    });
  });
});
