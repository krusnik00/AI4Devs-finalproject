const crypto = require('crypto');

const generateSKU = async (categoria, marca, modelo) => {
    // Limpiar y normalizar los inputs
    const catClean = categoria.substring(0, 3).toUpperCase();
    const marcaClean = marca.substring(0, 3).toUpperCase();
    const modeloClean = modelo ? modelo.substring(0, 3).toUpperCase() : 'GEN';
    
    // Generar un número aleatorio de 4 dígitos
    const random = Math.floor(1000 + Math.random() * 9000);
    
    // Combinar los componentes
    const sku = `${catClean}-${marcaClean}-${modeloClean}-${random}`;
    
    return sku;
};

const generateProductCode = () => {
    // Generar un código único de 8 caracteres
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

module.exports = {
    generateSKU,
    generateProductCode
};
