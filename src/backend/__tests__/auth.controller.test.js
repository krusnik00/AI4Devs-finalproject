const { describe, test, expect, jest, beforeEach } = require('@jest/globals');
const authController = require('../controllers/auth.controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock de bcrypt
jest.mock('bcrypt');

// Mock de jsonwebtoken
jest.mock('jsonwebtoken');

// Mock de Usuario
jest.mock('../models', () => {
  const Usuario = {
    findOne: jest.fn(),
    create: jest.fn()
  };
  
  return {
    Usuario
  };
});

describe('Auth Controller', () => {
  // Mock del objeto Request y Response
  const mockRequest = (body = {}) => ({
    body
  });

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('debe devolver 400 si falta email o contraseña', async () => {
      // Arrange
      const req = mockRequest({});
      const res = mockResponse();

      // Act
      await authController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email y contraseña son requeridos'
      });
    });

    test('debe devolver 401 si el usuario no existe', async () => {
      // Arrange
      const req = mockRequest({
        email: 'noexiste@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      require('../models').Usuario.findOne.mockResolvedValue(null);

      // Act
      await authController.login(req, res);

      // Assert
      expect(require('../models').Usuario.findOne).toHaveBeenCalledWith({
        where: { correo: 'noexiste@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciales inválidas'
      });
    });

    test('debe devolver 401 si el usuario está desactivado', async () => {
      // Arrange
      const req = mockRequest({
        email: 'usuario@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      const mockUsuario = {
        id: 1,
        correo: 'usuario@example.com',
        activo: false
      };

      require('../models').Usuario.findOne.mockResolvedValue(mockUsuario);

      // Act
      await authController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario desactivado. Contacte al administrador'
      });
    });

    test('debe devolver 401 si la contraseña es incorrecta', async () => {
      // Arrange
      const req = mockRequest({
        email: 'usuario@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      const mockUsuario = {
        id: 1,
        correo: 'usuario@example.com',
        password: 'hashed_password',
        activo: true
      };

      require('../models').Usuario.findOne.mockResolvedValue(mockUsuario);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await authController.login(req, res);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Credenciales inválidas'
      });
    });

    test('debe devolver token JWT si las credenciales son válidas', async () => {
      // Arrange
      const req = mockRequest({
        email: 'usuario@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      const mockUsuario = {
        id: 1,
        nombre: 'Usuario Test',
        correo: 'usuario@example.com',
        password: 'hashed_password',
        rol: 'admin',
        activo: true
      };

      const mockToken = 'jwt_token_mocked';

      require('../models').Usuario.findOne.mockResolvedValue(mockUsuario);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);

      // Act
      await authController.login(req, res);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.any(String) })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: mockToken,
          usuario: expect.objectContaining({
            id: 1,
            nombre: 'Usuario Test',
            rol: 'admin'
          })
        })
      );
    });
  });

  describe('register', () => {
    test('debe crear un nuevo usuario correctamente', async () => {
      // Arrange
      const userData = {
        nombre: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        password: 'password123',
        rol: 'vendedor'
      };
      const req = mockRequest(userData);
      const res = mockResponse();

      const mockHash = 'hashed_password123';
      const mockCreatedUser = {
        id: 5,
        nombre: 'Nuevo Usuario',
        correo: 'nuevo@example.com',
        password: mockHash,
        rol: 'vendedor',
        activo: true
      };

      bcrypt.hash.mockResolvedValue(mockHash);
      require('../models').Usuario.findOne.mockResolvedValue(null); // Email no existente
      require('../models').Usuario.create.mockResolvedValue(mockCreatedUser);

      // Act
      await authController.register(req, res);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', expect.any(Number));
      expect(require('../models').Usuario.create).toHaveBeenCalledWith({
        nombre: 'Nuevo Usuario',
        correo: 'nuevo@example.com',
        password: mockHash,
        rol: 'vendedor'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Usuario creado correctamente',
        usuario: expect.objectContaining({
          id: 5,
          nombre: 'Nuevo Usuario'
        })
      }));
    });

    test('debe rechazar registro si el email ya existe', async () => {
      // Arrange
      const userData = {
        nombre: 'Usuario Existente',
        email: 'existente@example.com',
        password: 'password123'
      };
      const req = mockRequest(userData);
      const res = mockResponse();

      const mockExistingUser = {
        id: 2,
        correo: 'existente@example.com'
      };

      require('../models').Usuario.findOne.mockResolvedValue(mockExistingUser);

      // Act
      await authController.register(req, res);

      // Assert
      expect(require('../models').Usuario.findOne).toHaveBeenCalledWith({
        where: { correo: 'existente@example.com' }
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El correo ya está registrado'
      });
      expect(require('../models').Usuario.create).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    test('debe confirmar que un token es válido', async () => {
      // Arrange
      const req = mockRequest({
        token: 'valid_token'
      });
      const res = mockResponse();

      const mockDecodedToken = {
        id: 1,
        nombre: 'Usuario Test',
        rol: 'admin'
      };

      jwt.verify.mockReturnValue(mockDecodedToken);

      // Act
      await authController.validateToken(req, res);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid_token', expect.any(String));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        valid: true,
        user: mockDecodedToken
      });
    });

    test('debe reportar que un token es inválido', async () => {
      // Arrange
      const req = mockRequest({
        token: 'invalid_token'
      });
      const res = mockResponse();

      jwt.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      // Act
      await authController.validateToken(req, res);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('invalid_token', expect.any(String));
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Token inválido'
      });
    });
  });
});
