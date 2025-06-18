const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Rutas públicas (autocompletado para el POS)
router.get('/buscar', clienteController.buscarClientes);

// Rutas protegidas
router.use(authMiddleware);

// Clientes CRUD
router.post('/', clienteController.crearCliente);
router.get('/', clienteController.listarClientes);
router.get('/:id', clienteController.obtenerClientePorId);
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.desactivarCliente);

// Historial de compras de un cliente
router.get('/:id/historial', clienteController.obtenerHistorialCompras);

module.exports = router;
