// Mock middleware para pruebas que siempre permite el acceso
exports.authMiddleware = (req, res, next) => {
  // Mock del usuario autenticado para pruebas
  req.usuario = {
    id: 1,
    nombre: 'Usuario Test',
    rol: 'admin'
  };
  next();
};
