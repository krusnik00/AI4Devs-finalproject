const express = require('express');
const router = express.Router();
const descuentoController = require('../controllers/descuento.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Rutas protegidas por autenticación
router.use(authenticate);

// CRUD básico
router.post('/', descuentoController.crearDescuento);
router.get('/', descuentoController.obtenerDescuentos);
router.get('/:id', descuentoController.obtenerDescuento);
router.put('/:id', descuentoController.actualizarDescuento);
router.delete('/:id', descuentoController.eliminarDescuento);

// Rutas adicionales
router.post('/:id/validar', descuentoController.validarDescuento);

module.exports = router;
