const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/search', productoController.searchProductos);
router.get('/autocomplete', productoController.autocompleteProductos);

// Rutas protegidas
router.get('/', authenticate, productoController.getAllProductos);
router.get('/bajo-stock', authenticate, productoController.getProductosBajoStock);
router.get('/:id', authenticate, productoController.getProductoById);
router.post('/', authenticate, productoController.createProducto);
router.put('/:id', authenticate, productoController.updateProducto);
router.delete('/:id', authenticate, productoController.deleteProducto);

module.exports = router;
