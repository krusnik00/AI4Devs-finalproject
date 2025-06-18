const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (en producción debería estar en variables de entorno)
const JWT_SECRET = 'clave_secreta_para_jwt';

/**
 * Genera un token JWT con los datos del usuario
 * @param {Object} userData - Datos del usuario para incluir en el token
 * @returns {string} Token JWT generado
 */
const generarToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} Datos decodificados o null si es inválido
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generarToken,
  verificarToken
};
