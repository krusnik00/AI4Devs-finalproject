const { Usuario } = require('../../backend/models');
const bcryptjs = require('bcryptjs');
const { sequelize } = require('../../backend/config/database');

const seedAdmin = async () => {
  try {
    // Sincronizar los modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada.');

    const adminExists = await Usuario.findOne({ where: { email: 'admin@example.com' } });

    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash('password123', 10);
      await Usuario.create({
        nombre: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        rol: 'admin',
        activo: true
      });
      console.log('Usuario administrador creado exitosamente.');
    } else {
      console.log('El usuario administrador ya existe.');
    }
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  }
};

seedAdmin();
