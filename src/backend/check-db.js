const { Usuario } = require('./models');
const { sequelize } = require('./config/database');

async function checkDatabase() {
  try {
    // Verificar la conexión
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Listar todos los usuarios
    const usuarios = await Usuario.findAll();
    console.log('\nUsuarios en la base de datos:');
    console.log(JSON.stringify(usuarios, null, 2));

    // Buscar específicamente el usuario admin
    const admin = await Usuario.findOne({ where: { email: 'admin@example.com' } });
    console.log('\nBúsqueda específica del admin:');
    console.log(JSON.stringify(admin, null, 2));

  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
