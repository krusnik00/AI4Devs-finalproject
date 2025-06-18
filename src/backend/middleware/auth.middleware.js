const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

// Middleware para verificar el token JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }
    
    // Añadir usuario al objeto de solicitud
    req.usuario = usuario;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
      return res.status(401).json({ message: 'Token inválido.' });
  }
};

// Alias de authenticate para uso en rutas (para mantener compatibilidad)
exports.authMiddleware = exports.authenticate;
