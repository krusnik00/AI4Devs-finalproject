const express = require('express');
const router = express.Router();

// Este es un archivo mock para pruebas
router.get('/', (req, res) => {
  res.json({ message: 'Ruta de compras mock para pruebas' });
});

module.exports = router;
