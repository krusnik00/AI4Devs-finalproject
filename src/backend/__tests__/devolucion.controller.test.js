const devolucionController = require('../controllers/devolucion.controller');

// Mocks para los modelos de Sequelize
jest.mock('../models', () => {
  const mockSequelize = {
    transaction: jest.fn(() => Promise.resolve({
      commit: jest.fn(),
      rollback: jest.fn()
    }))
  };

  // Mock del modelo Devolucion
  const Devolucion = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn()
  };

  // Mock del modelo Venta
  const Venta = {
    findByPk: jest.fn()
  };

  // Mock del modelo DetalleVenta
  const DetalleVenta = {
    findAll: jest.fn(),
    findByPk: jest.fn()
  };

  // Mock del modelo DetalleDevolucion
  const DetalleDevolucion = {
    create: jest.fn(),
    findAll: jest.fn()
  };

  // Mock del modelo Producto
  const Producto = {
    findByPk: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn()
  };

  return {
    sequelize: mockSequelize,
    Devolucion,
    DetalleDevolucion,
    Venta,
    DetalleVenta,
    Producto
  };
});

// Mock de req y res para pruebas
const mockReq = (data = {}) => {
  return {
    body: data,
    params: {},
    query: {},
    usuario: { id: 1, rol: 'admin' },
    ...data
  };
};

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Devoluciones Controller', () => {
  let ventaId;
  let productoId;
  let detalleVentaId;
  beforeEach(() => {
    // Configurar mocks antes de cada prueba
    const { Devolucion, Venta, DetalleVenta, Producto, DetalleDevolucion } = require('../models');
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Configurar IDs de prueba
    ventaId = 1;
    productoId = 1;
    detalleVentaId = 1;
    
    // Mock de venta
    Venta.findByPk.mockResolvedValue({
      id: ventaId,
      cliente_id: 1,
      total: 100,
      estado: 'completada',
      detalles: [
        {
          id: detalleVentaId,
          producto_id: productoId,
          cantidad: 1,
          precio_unitario: 100,
          subtotal: 100,
          producto: {
            id: productoId,
            nombre: 'Producto de prueba',
            codigo: 'TEST001'
          }
        }
      ]
    });
    
    // Mock de producto
    Producto.findByPk.mockResolvedValue({
      id: productoId,
      nombre: 'Producto de prueba',
      codigo: 'TEST001',
      stock_actual: 10
    });
    
    // Mock de creación de devolución
    Devolucion.create.mockResolvedValue({
      id: 1,
      venta_id: ventaId,
      cliente_id: 1,
      usuario_id: 1,
      fecha: new Date(),
      motivo: 'defectuoso',
      descripcion_motivo: 'Producto con falla',
      tipo_reembolso: 'efectivo',
      estado: 'pendiente'
    });
    
    // Mock de conteo de devoluciones
    Devolucion.count.mockResolvedValue(5);
    
    // Mock de DetalleDevolucion.create
    DetalleDevolucion.create.mockResolvedValue({
      id: 1,
      devolucion_id: 1,
      detalle_venta_id: detalleVentaId,
      producto_id: productoId,
      cantidad: 1,
      precio_unitario: 100,
      subtotal: 100
    });
  });

  test('debe crear una devolución', async () => {
    const req = mockReq({
      body: {
        venta_id: ventaId,
        motivo: 'defectuoso',
        descripcion_motivo: 'Producto con falla',
        tipo_reembolso: 'efectivo',
        detalles: [
          {
            detalle_venta_id: detalleVentaId,
            cantidad: 1
          }
        ]
      }
    });
    
    const res = mockRes();
    
    await devolucionController.crearDevolucion(req, res);
    
    // Verificar que se llamó a res.status con 201
    expect(res.status).toHaveBeenCalledWith(201);
    // Verificar que se devolvió una devolución
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('devolucion');
    expect(res.json.mock.calls[0][0]).toHaveProperty('message');
  });

  test('debe contar devoluciones pendientes', async () => {
    const req = mockReq();
    const res = mockRes();
    
    await devolucionController.contarDevolucionesPendientes(req, res);
    
    // Verificar que se llamó a res.status con 200
    expect(res.status).toHaveBeenCalledWith(200);
    // Verificar que se devolvió un conteo
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('count', 5);
  });
  
  test('debe listar devoluciones', async () => {
    const { Devolucion } = require('../models');
    
    // Mock de findAll para devolver una lista de devoluciones
    Devolucion.findAll.mockResolvedValue([
      {
        id: 1,
        venta_id: 1,
        estado: 'pendiente',
        fecha: new Date(),
        motivo: 'defectuoso'
      },
      {
        id: 2,
        venta_id: 2,
        estado: 'autorizada',
        fecha: new Date(),
        motivo: 'incompleto'
      }
    ]);
    
    const req = mockReq({
      query: { estado: 'todos' }
    });
    const res = mockRes();
    
    await devolucionController.listarDevoluciones(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('devoluciones');
    expect(res.json.mock.calls[0][0].devoluciones).toHaveLength(2);
  });
  
  test('debe obtener una devolución por ID', async () => {
    const { Devolucion } = require('../models');
    
    // Mock de findByPk para devolver una devolución específica
    Devolucion.findByPk.mockResolvedValue({
      id: 1,
      venta_id: ventaId,
      estado: 'pendiente',
      fecha: new Date(),
      motivo: 'defectuoso',
      detalles: [
        {
          id: 1,
          producto_id: productoId,
          cantidad: 1
        }
      ]
    });
    
    const req = mockReq({
      params: { id: 1 }
    });
    const res = mockRes();
    
    await devolucionController.obtenerDevolucionPorId(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('devolucion');
    expect(res.json.mock.calls[0][0].devolucion).toHaveProperty('id', 1);
  });
});
