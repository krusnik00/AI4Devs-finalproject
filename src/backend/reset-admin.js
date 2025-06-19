const sequelize = require('./config/database');
const Usuario = require('./models/usuario.model');
const bcryptjs = require('bcryptjs');

async function resetAdminUser() {
    try {
        console.log('Buscando usuario admin existente...');
        let admin = await Usuario.findOne({
            where: { email: 'admin@example.com' }
        });

        if (admin) {
            console.log('Eliminando usuario admin existente...');
            await admin.destroy();
        }

        console.log('\nCreando nuevo usuario admin...');
        const password = 'admin123';
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        admin = await Usuario.create({
            nombre: 'Administrador',
            email: 'admin@example.com',
            password: hashedPassword,
            rol: 'admin',
            activo: true
        });

        console.log('\nUsuario admin creado:');
        console.log('===================');
        console.log(`ID: ${admin.id}`);
        console.log(`Nombre: ${admin.nombre}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Password hash: ${admin.password}`);
        
        // Verificar la contraseña
        const isValid = await bcryptjs.compare(password, admin.password);
        console.log(`\nVerificación de contraseña: ${isValid ? 'CORRECTA' : 'INCORRECTA'}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

resetAdminUser();
