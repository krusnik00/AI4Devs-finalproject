const { Categoria, Marca } = require('../models');

exports.generateSKU = async (categoriaId, marcaId) => {
    try {
        const categoria = await Categoria.findByPk(categoriaId);
        const marca = await Marca.findByPk(marcaId);
        
        if (!categoria || !marca) {
            throw new Error('Categoría o marca no encontrada');
        }

        // Obtener iniciales de categoría y marca
        const catPrefix = categoria.nombre.substring(0, 2).toUpperCase();
        const marcaPrefix = marca.nombre.substring(0, 2).toUpperCase();
        
        // Generar número secuencial
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        
        return `${catPrefix}${marcaPrefix}${year}${month}${random}`;
    } catch (error) {
        throw new Error(`Error generando SKU: ${error.message}`);
    }
};
