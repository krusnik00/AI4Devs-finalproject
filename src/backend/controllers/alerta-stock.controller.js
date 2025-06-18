const alertaStockService = require('../services/alerta-stock.service');

// Obtener resumen de alertas para el dashboard
exports.getResumenAlertas = async (req, res) => {
  try {
    const resumen = await alertaStockService.getResumenAlertas();
    return res.status(200).json(resumen);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener resumen de alertas', 
      error: error.message 
    });
  }
};

// Obtener lista detallada de productos con stock bajo
exports.getProductosBajoStock = async (req, res) => {
  try {
    const { categoriaId, marcaId, criticidad } = req.query;
    const productos = await alertaStockService.getProductosBajoStock({
      categoriaId, 
      marcaId, 
      criticidad
    });
    
    return res.status(200).json({
      total: productos.length,
      productos,
      resumen: {
        total_productos_bajo_stock: productos.length,
        stock_critico: productos.filter(p => p.nivel_criticidad === 'alto').length,
        stock_medio: productos.filter(p => p.nivel_criticidad === 'medio').length,
        stock_bajo: productos.filter(p => p.nivel_criticidad === 'bajo').length
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener productos con stock bajo', 
      error: error.message 
    });
  }
};

// Generar reporte exportable
exports.generarReporte = async (req, res) => {
  try {
    const { categoriaId, marcaId, criticidad, formato = 'excel' } = req.query;
    
    if (formato !== 'excel') {
      return res.status(400).json({ message: 'Formato no soportado. Actualmente solo se admite excel.' });
    }
    
    const resultado = await alertaStockService.generarReporteExcel({
      categoriaId,
      marcaId,
      criticidad
    });
    
    return res.status(200).json({
      message: 'Reporte generado exitosamente',
      archivo: resultado.fileName,
      url: resultado.url
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al generar reporte', 
      error: error.message 
    });
  }
};
