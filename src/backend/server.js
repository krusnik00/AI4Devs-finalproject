const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// Importar modelos
const Usuario = require('./models/usuario.model');
const Descuento = require('./models/descuento.model');
const Venta = require('./models/venta.model');

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
app.use('/api/descuentos', require('./routes/descuento.routes'));

// Inicializar base de datos
const initDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // En producción, usar { force: false }
    
    // Crear usuario administrador si no existe
    const adminExists = await Usuario.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@example.com',
        password: 'admin123',
        rol: 'admin'
      });
    }

    // Crear descuentos de ejemplo
    await Descuento.bulkCreate([
      {
        nombre: 'Descuento de Bienvenida',
        descripcion: '10% de descuento en tu primera compra',
        tipo: 'porcentaje',
        valor: 10,
        fecha_inicio: new Date(),
        fecha_fin: new Date(2026, 11, 31),
        minimo_compra: 100,
        estado: 'activo'
      },
      {
        nombre: 'Descuento Fijo',
        descripcion: '$50 de descuento en compras mayores a $500',
        tipo: 'monto_fijo',
        valor: 50,
        fecha_inicio: new Date(),
        fecha_fin: new Date(2026, 11, 31),
        minimo_compra: 500,
        estado: 'activo'
      }
    ]);

    console.log('Base de datos sincronizada y datos iniciales creados');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});