const { sequelize } = require('./config/database');
const Usuario = require('./models/usuario.model');

async function initializeDatabase() {
    try {
        // Sincronizar modelos con la base de datos
        console.log('Sincronizando base de datos...');
        await sequelize.sync({ force: true });
        console.log('Base de datos sincronizada.');

        // Buscar si ya existe el usuario administrador
        let admin = await Usuario.findOne({ where: { email: 'admin@example.com' } });
        
        if (!admin) {
            // Crear usuario administrador si no existe
            admin = await Usuario.create({
                nombre: 'Administrador',
                email: 'admin@example.com',
                password: 'admin123', // Se hasheará automáticamente
                rol: 'admin',
                activo: true
            });

            console.log('\nUsuario administrador creado:');
            console.log('==========================');
            console.log(`ID: ${admin.id}`);
            console.log(`Nombre: ${admin.nombre}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Rol: ${admin.rol}`);
            console.log(`Activo: ${admin.activo}`);
            console.log('\nPuedes iniciar sesión con:');
            console.log('Email: admin@example.com');
            console.log('Password: admin123');

            // Verificar que la contraseña funciona
            const passwordValida = admin.verificarPassword('admin123');
            console.log('\nVerificación de contraseña:', passwordValida ? 'CORRECTA' : 'INCORRECTA');
        } else {
            console.log('\nUsuario administrador ya existe');
        }

    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error; // Propagar el error para que sea manejado por el llamador
    }
}

// Si el script se ejecuta directamente
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            sequelize.close();
            process.exit(0);
        })
        .catch(error => {
            console.error('Error fatal:', error);
            sequelize.close();
            process.exit(1);
        });
} else {
    // Si el script es requerido como módulo
    module.exports = initializeDatabase;
}
