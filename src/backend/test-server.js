const express = require('express');
const app = express();
const cors = require('cors');

// Use SQLite in-memory database for tests
jest.mock('./config/database', () => 
  require('./__tests__/mocks/database.mock')
);

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API - Usar versiones mock sin autenticación para pruebas
app.use('/api/devoluciones', require('./__tests__/mocks/devolucion.routes.mock'));

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API de Sistema de Gestión para Refaccionaria funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

module.exports = app;
