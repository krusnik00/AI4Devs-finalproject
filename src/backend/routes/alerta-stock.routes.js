const express = require('express');
const router = express.Router();
const alertaStockController = require('../controllers/alerta-stock.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para alertas de stock
router.get('/resumen', alertaStockController.getResumenAlertas);
router.get('/productos', alertaStockController.getProductosBajoStock);
router.get('/reporte', alertaStockController.generarReporte);

module.exports = router;
