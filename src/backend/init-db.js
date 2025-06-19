const sequelize = require('./config/database');
const Usuario = require('./models/usuario.model');
const Descuento = require('./models/descuento.model');

async function initializeDatabase() {
    try {
        // Sincronizar modelos con la base de datos
        console.log('Sincronizando base de datos...');
        
        // Eliminar la base de datos existente
        console.log('Eliminando base de datos existente...');
        try {
            await sequelize.drop();
            console.log('Base de datos eliminada.');
        } catch (dropError) {
            console.log('Error al eliminar base de datos (puede ser normal si no existía):', dropError.message);
        }

        // Sincronizar todos los modelos
        console.log('Creando tablas...');
        await sequelize.sync({ force: false });
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

        // Crear algunos descuentos de ejemplo
        await Descuento.create({
            nombre: 'Descuento de Bienvenida',
            descripcion: '10% de descuento en tu primera compra',
            tipo: 'porcentaje',
            valor: 10,
            fecha_inicio: new Date(),
            fecha_fin: new Date(2026, 11, 31),
            minimo_compra: 100,
            estado: 'activo'
        });

        await Descuento.create({
            nombre: 'Descuento Fijo',
            descripcion: '$50 de descuento en compras mayores a $500',
            tipo: 'monto_fijo',
            valor: 50,
            fecha_inicio: new Date(),
            fecha_fin: new Date(2026, 11, 31),
            minimo_compra: 500,
            estado: 'activo'
        });

        console.log('Datos iniciales creados correctamente.');
        console.log('Base de datos inicializada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        process.exit(1);
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
