const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para login
router.post('/login', authController.login);

// Ruta para verificar token
router.get('/verify', authController.verificarToken);

module.exports = router;
