const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

// Variable de entorno JWT_SECRET o una clave por defecto
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_desarrollo_automotriz';

// Login de usuario
exports.login = async (req, res) => {
  try {
    console.log('Iniciando proceso de login...');
    const { email, password } = req.body;
    console.log('Datos recibidos:', { email, password: '***' });
    
    // Validar entradas
    if (!email || !password) {
      console
      return res.status(400).json({
        message: 'Email y contraseña son requeridos'
      });
    }
    
    // Buscar usuario por correo
    console.log('Buscando usuario con email:', email);
    const usuario = await Usuario.findOne({ 
      where: { email }
    });
    
    // Verificar si el usuario existe
    if (!usuario) {
      console.log('Error: Usuario no encontrado');
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }
    
    console.log('Usuario encontrado:', { id: usuario.id, nombre: usuario.nombre, email: usuario.email });
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      console.log('Error: Usuario desactivado');
      return res.status(401).json({
        message: 'Usuario desactivado. Contacte al administrador'
      });
    }    // Verificar contraseña
    console.log('Verificando contraseña...');
    const passwordEsValida = usuario.verificarPassword(password);
    console.log('Resultado de verificación de contraseña:', passwordEsValida);
    
    if (!passwordEsValida) {
      console.log('Error: Contraseña inválida');
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }
    
    // Crear token JWT
    console.log('Generando token JWT...');
    const token = jwt.sign(
      { 
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    console.log('Login exitoso, enviando respuesta...');
    // Enviar respuesta
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
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
      message: 'Error al verificar el token',
      error: error.message
    });
  }
};
