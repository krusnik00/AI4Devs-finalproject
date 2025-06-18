const express = require('express');
const router = express.Router();
const devolucionController = require('../controllers/devolucion.controller');

// Rutas para pruebas - Sin autenticación
// Ruta para buscar una venta por número de ticket (para iniciar proceso de devolución)
router.get('/buscar-venta', devolucionController.buscarVentaParaDevolucion);

// Ruta para obtener el conteo de devoluciones pendientes
router.get('/pendientes/count', devolucionController.contarDevolucionesPendientes);

// CRUD básico
router.post('/', devolucionController.crearDevolucion);
router.get('/', devolucionController.listarDevoluciones);
router.get('/:id', devolucionController.obtenerDevolucionPorId);

// Acciones específicas
router.post('/:id/autorizar', devolucionController.autorizarDevolucion);
router.post('/:id/cancelar', devolucionController.cancelarDevolucion);
router.post('/:id/finalizar', devolucionController.finalizarDevolucion);
router.post('/:id/ajustar-inventario', devolucionController.ajustarInventarioPorDevolucion);

module.exports = router;
