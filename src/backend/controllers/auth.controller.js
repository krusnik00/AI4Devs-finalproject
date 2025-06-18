const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Variable de entorno JWT_SECRET o una clave por defecto
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_desarrollo_automotriz';

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar entradas
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y contraseña son requeridos'
      });
    }
    
    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ 
      where: { correo: email }
    });
    
    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        message: 'Usuario desactivado. Contacte al administrador'
      });
    }
    
    // Verificar contraseña
    const passwordEsValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordEsValida) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { 
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    // Actualizar último login
    await usuario.update({ ultimo_login: new Date() });
    
    // Enviar respuesta
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

// Verificar token
exports.verificarToken = async (req, res) => {
  try {
    // El usuario viene del middleware de autenticación
    const usuario = req.user;
    
    if (!usuario) {
      return res.status(401).json({
        message: 'No autenticado'
      });
    }
    
    return res.status(200).json({
      mensaje: 'Token válido',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

// Cambiar contraseña
exports.cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const userId = req.user.id;
    
    // Validar entradas
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        message: 'Se requiere la contraseña actual y la nueva'
      });
    }
    
    // Buscar usuario
    const usuario = await Usuario.findByPk(userId);
    
    if (!usuario) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const passwordEsValida = await bcrypt.compare(passwordActual, usuario.password);
    
    if (!passwordEsValida) {
      return res.status(401).json({
        message: 'La contraseña actual es incorrecta'
      });
    }
    
    // Hashear y actualizar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordNueva, salt);
    
    await usuario.update({ 
      password: passwordHash,
      password_actualizada: new Date()
    });
    
    return res.status(200).json({
      message: 'Contraseña actualizada correctamente'
    });
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};
