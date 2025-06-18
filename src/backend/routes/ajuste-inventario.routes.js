const express = require('express');
const router = express.Router();
const ajusteInventarioController = require('../controllers/ajuste-inventario.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para ajustes de inventario
router.post('/', ajusteInventarioController.createAjusteInventario);
router.get('/', ajusteInventarioController.getAjustes);
router.get('/:id', ajusteInventarioController.getAjusteById);
router.put('/:id/autorizar', ajusteInventarioController.autorizarAjuste);

module.exports = router;
