const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.use(authMiddleware);

// Verificar token
router.get('/verify', authController.verificarToken);

module.exports = router;
