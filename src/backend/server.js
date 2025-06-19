const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/ventas', require('./routes/venta.routes'));
app.use('/api/compras', require('./routes/compra.routes'));
app.use('/api/proveedores', require('./routes/proveedor.routes'));
app.use('/api/clientes', require('./routes/cliente.routes'));
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/ajustes-inventario', require('./routes/ajuste-inventario.routes'));
app.use('/api/alertas-stock', require('./routes/alerta-stock.routes'));
app.use('/api/devoluciones', require('./routes/devolucion.routes'));

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API de Sistema de Gestión para Refaccionaria funcionando correctamente' });
});

// Definir puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
const server = app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
    try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos con la base de datos - usando alter: true para actualizar tablas existentes
    // En producción debe usarse una estrategia de migración en lugar de alter: true
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
});

const gracefulShutdown = () => {
  console.log('Recibida señal de apagado, cerrando el servidor http.');
  server.close(() => {
    console.log('Servidor http cerrado.');
    sequelize.close().then(() => {
      console.log('Conexión de la base de datos cerrada.');
      process.exit(0);
    });
  });
};

// Escuchar señales de terminación
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module