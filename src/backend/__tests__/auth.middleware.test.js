const { describe, test, expect, jest, beforeEach } = require('@jest/globals');
const authMiddleware = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');

// Mock para jsonwebtoken
jest.mock('jsonwebtoken');

// Mock para el modelo de Usuario
jest.mock('../models/usuario.model', () => {
  return {
    findByPk: jest.fn()
  };
});

describe('Auth Middleware', () => {
  // Mock del objeto Request y Response
  const mockRequest = (headers = {}) => {
    return {
      headers
    };
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe denegar acceso si no se proporciona token', async () => {
    // Arrange
    const req = mockRequest({});
    const res = mockResponse();

    // Act
    await authMiddleware.authenticate(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acceso denegado. Token no proporcionado.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('debe denegar acceso si el token es inválido', async () => {
    // Arrange
    const req = mockRequest({ authorization: 'Bearer invalid_token' });
    const res = mockResponse();

    jwt.verify.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    // Act
    await authMiddleware.authenticate(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('debe denegar acceso si el token está expirado', async () => {
    // Arrange
    const req = mockRequest({ authorization: 'Bearer expired_token' });
    const res = mockResponse();

    const tokenExpiredError = new Error('Token expirado');
    tokenExpiredError.name = 'TokenExpiredError';
    
    jwt.verify.mockImplementation(() => {
      throw tokenExpiredError;
    });

    // Act
    await authMiddleware.authenticate(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token expirado.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('debe denegar acceso si el usuario no existe', async () => {
    // Arrange
    const req = mockRequest({ authorization: 'Bearer valid_token' });
    const res = mockResponse();

    jwt.verify.mockReturnValue({ id: 1 });
    require('../models/usuario.model').findByPk.mockResolvedValue(null);

    // Act
    await authMiddleware.authenticate(req, res, mockNext);

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
    expect(require('../models/usuario.model').findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario no encontrado.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('debe permitir acceso con token válido y usuario existente', async () => {
    // Arrange
    const req = mockRequest({ authorization: 'Bearer valid_token' });
    const res = mockResponse();
    const mockUsuario = {
      id: 1,
      nombre: 'Usuario Test',
      email: 'test@example.com',
      rol: 'admin'
    };

    jwt.verify.mockReturnValue({ id: 1 });
    require('../models/usuario.model').findByPk.mockResolvedValue(mockUsuario);

    // Act
    await authMiddleware.authenticate(req, res, mockNext);

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
    expect(require('../models/usuario.model').findByPk).toHaveBeenCalledWith(1);
    expect(req.usuario).toEqual(mockUsuario);
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
