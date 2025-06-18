const { describe, test, expect, jest, beforeEach } = require('@jest/globals');
const productoController = require('../controllers/producto.controller');

// Mocks para los modelos de Sequelize
jest.mock('../models', () => {
  // Mock de Producto
  const Producto = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  // Mock de Categoria
  const Categoria = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  };

  // Mock de Marca
  const Marca = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  };

  // Mock de sequelize
  const mockSequelize = {
    transaction: jest.fn(() => Promise.resolve({
      commit: jest.fn(),
      rollback: jest.fn()
    })),
    Op: {
      like: jest.fn(value => ({ [Symbol('like')]: value })),
      or: jest.fn(value => ({ [Symbol('or')]: value })),
      and: jest.fn(value => ({ [Symbol('and')]: value })),
      gte: jest.fn(value => ({ [Symbol('gte')]: value })),
      lte: jest.fn(value => ({ [Symbol('lte')]: value })),
    }
  };

  return {
    sequelize: mockSequelize,
    Producto,
    Categoria,
    Marca
  };
});

// Mock del objeto Request y Response
const mockRequest = (body = {}, params = {}, query = {}, user = null) => ({
  body,
  params,
  query,
  user
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Producto Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProductos', () => {
    test('debe devolver todos los productos activos', async () => {
      // Arrange
      const mockProductos = [
        { id: 1, nombre: 'Filtro de Aceite', activo: true },
        { id: 2, nombre: 'Bujía', activo: true }
      ];
      const req = mockRequest();
      const res = mockResponse();

      require('../models').Producto.findAll.mockResolvedValue(mockProductos);

      // Act
      await productoController.getAllProductos(req, res);

      // Assert
      expect(require('../models').Producto.findAll).toHaveBeenCalledWith({
        where: { activo: true }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });

    test('debe manejar errores correctamente', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      require('../models').Producto.findAll.mockRejectedValue(new Error('Error de base de datos'));

      // Act
      await productoController.getAllProductos(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al obtener productos',
        error: 'Error de base de datos'
      });
    });
  });

  describe('getProductoById', () => {
    test('debe devolver un producto por su ID', async () => {
      // Arrange
      const mockProducto = { id: 1, nombre: 'Filtro de Aceite', activo: true };
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      require('../models').Producto.findByPk.mockResolvedValue(mockProducto);

      // Act
      await productoController.getProductoById(req, res);

      // Assert
      expect(require('../models').Producto.findByPk).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducto);
    });

    test('debe devolver 404 si el producto no existe', async () => {
      // Arrange
      const req = mockRequest({}, { id: '999' });
      const res = mockResponse();

      require('../models').Producto.findByPk.mockResolvedValue(null);

      // Act
      await productoController.getProductoById(req, res);

      // Assert
      expect(require('../models').Producto.findByPk).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    test('debe manejar errores correctamente', async () => {
      // Arrange
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();

      require('../models').Producto.findByPk.mockRejectedValue(new Error('Error de base de datos'));

      // Act
      await productoController.getProductoById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al obtener el producto',
        error: 'Error de base de datos'
      });
    });
  });

  describe('createProducto', () => {
    test('debe crear un producto con éxito', async () => {
      // Arrange
      const productoData = {
        nombre: 'Filtro de Aceite',
        descripcion_corta: 'Para motores de 4 cilindros',
        categoriaId: 1,
        marcaId: 2,
        precio_compra: 150,
        precio_venta: 300
      };
      const mockCreatedProducto = { 
        id: 1, 
        ...productoData, 
        codigo: 'PROD-123456-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const req = mockRequest(productoData, {}, {}, { id: 10 });
      const res = mockResponse();

      require('../models').Producto.count.mockResolvedValue(0);
      require('../models').Producto.create.mockResolvedValue(mockCreatedProducto);

      // Act
      await productoController.createProducto(req, res);

      // Assert
      expect(require('../models').Producto.create).toHaveBeenCalledWith({
        ...productoData,
        creado_por: 10,
        codigo: expect.any(String)
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedProducto);
    });

    test('debe generar un código si no se proporciona', async () => {
      // Arrange
      const productoData = {
        nombre: 'Filtro de Aceite',
        descripcion_corta: 'Para motores de 4 cilindros',
        categoriaId: 1,
        marcaId: 2,
        precio_compra: 150,
        precio_venta: 300
      };
      
      const req = mockRequest(productoData);
      const res = mockResponse();

      require('../models').Producto.count.mockResolvedValue(10);
      require('../models').Producto.create.mockImplementation(data => Promise.resolve({
        id: 11,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Act
      await productoController.createProducto(req, res);

      // Assert
      expect(require('../models').Producto.create).toHaveBeenCalledWith({
        ...productoData,
        codigo: expect.stringMatching(/^PROD-\d+-11$/)
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('debe manejar error de validación correctamente', async () => {
      // Arrange
      const productoData = {
        nombre: 'Filtro de Aceite',
        codigo: 'FIL-001' // Código duplicado
      };
      
      const req = mockRequest(productoData);
      const res = mockResponse();

      const validationError = new Error('Código duplicado');
      validationError.name = 'SequelizeUniqueConstraintError';
      validationError.errors = [
        { path: 'codigo', message: 'El código ya existe' }
      ];
      
      require('../models').Producto.create.mockRejectedValue(validationError);

      // Act
      await productoController.createProducto(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error de validación',
        errors: [{ field: 'codigo', message: 'El código ya existe' }]
      });
    });
  });

  describe('updateProducto', () => {
    test('debe actualizar un producto existente', async () => {
      // Arrange
      const productoId = '1';
      const updateData = {
        nombre: 'Filtro de Aceite Premium',
        precio_venta: 350
      };
      const mockExistingProducto = {
        id: 1,
        nombre: 'Filtro de Aceite',
        precio_venta: 300,
        precio_compra: 150,
        activo: true
      };
      const mockUpdatedProducto = {
        ...mockExistingProducto,
        ...updateData,
        actualizado_por: 10,
        updatedAt: new Date()
      };
      
      const req = mockRequest(updateData, { id: productoId }, {}, { id: 10 });
      const res = mockResponse();

      require('../models').Producto.findByPk.mockResolvedValue(mockExistingProducto);
      require('../models').Producto.update.mockResolvedValue([1]);

      // Act
      await productoController.updateProducto(req, res);

      // Assert
      expect(require('../models').Producto.findByPk).toHaveBeenCalledWith(productoId);
      expect(require('../models').Producto.update).toHaveBeenCalledWith(
        { ...updateData, actualizado_por: 10 },
        { where: { id: productoId } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto actualizado correctamente'
      });
    });

    test('debe devolver 404 si el producto a actualizar no existe', async () => {
      // Arrange
      const productoId = '999';
      const updateData = {
        nombre: 'Filtro de Aceite Premium',
        precio_venta: 350
      };
      
      const req = mockRequest(updateData, { id: productoId });
      const res = mockResponse();

      require('../models').Producto.findByPk.mockResolvedValue(null);

      // Act
      await productoController.updateProducto(req, res);

      // Assert
      expect(require('../models').Producto.findByPk).toHaveBeenCalledWith(productoId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto no encontrado'
      });
    });
  });

  describe('deleteProducto', () => {
    test('debe desactivar un producto (soft delete)', async () => {
      // Arrange
      const productoId = '1';
      const mockExistingProducto = {
        id: 1,
        nombre: 'Filtro de Aceite',
        activo: true
      };
      
      const req = mockRequest({}, { id: productoId }, {}, { id: 10 });
      const res = mockResponse();

      require('../models').Producto.findByPk.mockResolvedValue(mockExistingProducto);
      require('../models').Producto.update.mockResolvedValue([1]);

      // Act
      await productoController.deleteProducto(req, res);

      // Assert
      expect(require('../models').Producto.findByPk).toHaveBeenCalledWith(productoId);
      expect(require('../models').Producto.update).toHaveBeenCalledWith(
        { activo: false, eliminado_por: 10 },
        { where: { id: productoId } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto eliminado correctamente'
      });
    });

    test('debe devolver 404 si el producto a eliminar no existe', async () => {
      // Arrange
      const productoId = '999';
      
      const req = mockRequest({}, { id: productoId });
      const res = mockResponse();

      require('../models').Producto.findByPk.mockResolvedValue(null);

      // Act
      await productoController.deleteProducto(req, res);

      // Assert
      expect(require('../models').Producto.findByPk).toHaveBeenCalledWith(productoId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto no encontrado'
      });
    });
  });

  describe('searchProductos', () => {
    test('debe buscar productos con filtros', async () => {
      // Arrange
      const searchTerm = 'Filtro';
      const categoriaId = '2';
      const mockProductos = [
        { id: 1, nombre: 'Filtro de Aceite', categoriaId: 2 },
        { id: 3, nombre: 'Filtro de Aire', categoriaId: 2 }
      ];
      
      const req = mockRequest({}, {}, { search: searchTerm, categoriaId });
      const res = mockResponse();

      require('../models').Producto.findAll.mockResolvedValue(mockProductos);

      // Act
      await productoController.searchProductos(req, res);

      // Assert
      expect(require('../models').Producto.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });

    test('debe devolver productos paginados', async () => {
      // Arrange
      const mockProductosResult = {
        count: 20,
        rows: [
          { id: 1, nombre: 'Filtro de Aceite' },
          { id: 2, nombre: 'Filtro de Aire' }
        ]
      };
      
      const req = mockRequest({}, {}, { page: '1', limit: '2' });
      const res = mockResponse();

      require('../models').Producto.findAndCountAll.mockResolvedValue(mockProductosResult);

      // Act
      await productoController.getProductosPaginados(req, res);

      // Assert
      expect(require('../models').Producto.findAndCountAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        productos: mockProductosResult.rows,
        pagination: {
          totalItems: 20,
          totalPages: 10,
          currentPage: 1
        }
      });
    });
  });
});
