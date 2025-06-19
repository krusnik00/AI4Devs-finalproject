const { sequelize } = require('./config/database');
const Usuario = require('./models/usuario.model');
const bcryptjs = require('bcryptjs');

async function checkPassword() {
    try {
        console.log('Consultando usuario admin en la base de datos...');
        
        const usuario = await Usuario.findOne({
            where: { email: 'admin@example.com' }
        });
        
        if (!usuario) {
            console.log('¡Error! Usuario admin no encontrado');
            return;
        }

        console.log('\nInformación del usuario:');
        console.log('=======================');
        console.log(`ID: ${usuario.id}`);
        console.log(`Email: ${usuario.email}`);
        console.log(`Password hash: ${usuario.password}`);
        
        // Probar ambas contraseñas
        const passwords = ['password123', 'admin123'];
        
        for (const pwd of passwords) {
            const isValid = await bcryptjs.compare(pwd, usuario.password);
            console.log(`\nProbando contraseña "${pwd}":`);
            console.log(`Resultado: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkPassword();
