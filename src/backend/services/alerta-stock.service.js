const { Producto, Categoria, Marca, sequelize } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Directorio para reportes generados
const REPORTS_DIR = path.join(__dirname, '../../public/reports');

// Asegurarse que el directorio existe
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Servicio para generar alertas y reportes de stock bajo
 */
class AlertaStockService {
  /**
   * Obtiene los productos con stock bajo según varios criterios
   * @param {Object} filtros - Criterios de filtrado
   * @returns {Promise<Array>} - Productos con stock bajo y métricas adicionales
   */
  async getProductosBajoStock(filtros = {}) {
    const { categoriaId, marcaId, criticidad } = filtros;
    
    // Construir cláusula WHERE
    const whereClause = {
      stock_actual: { [Op.lte]: sequelize.col('stock_minimo') },
      activo: true
    };
    
    // Filtros adicionales
    if (categoriaId) whereClause.categoriaId = categoriaId;
    if (marcaId) whereClause.marcaId = marcaId;
    
    // Filtro por nivel de criticidad
    if (criticidad === 'alto') {
      whereClause.stock_actual = 0;
    } else if (criticidad === 'medio') {
      whereClause.stock_actual = { 
        [Op.and]: [
          { [Op.gt]: 0 },
          { [Op.lte]: sequelize.literal('stock_minimo * 0.5') }
        ]
      };
    } else if (criticidad === 'bajo') {
      whereClause.stock_actual = { 
        [Op.and]: [
          { [Op.gt]: sequelize.literal('stock_minimo * 0.5') },
          { [Op.lte]: sequelize.col('stock_minimo') }
        ]
      };
    }
    
    // Ejecutar consulta principal
    const productos = await Producto.findAll({
      where: whereClause,
      order: [
        [sequelize.literal('(stock_actual * 1.0 / stock_minimo)'), 'ASC'],
        ['nombre', 'ASC']
      ],
      include: [
        { association: 'categoria' },
        { association: 'marca' }
      ]
    });
    
    // Calcular métricas adicionales para cada producto
    const productosConMetricas = await Promise.all(productos.map(async (producto) => {
      // Obtener ventas de los últimos 3 meses para calcular velocidad de venta
      const ventasTrimestre = await sequelize.query(`
        SELECT SUM(dv.cantidad) as total_vendido
        FROM detalle_ventas dv
        INNER JOIN ventas v ON dv.venta_id = v.id
        WHERE dv.producto_id = :productoId
        AND v.fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        AND v.estado = 'completada'
      `, { 
        replacements: { productoId: producto.id },
        type: sequelize.QueryTypes.SELECT
      });
      
      const totalVendido = ventasTrimestre[0]?.total_vendido || 0;
      const ventaMensual = totalVendido / 3; // Promedio mensual
      
      // Calcular días estimados hasta agotamiento si hay ventas
      let diasHastaAgotamiento = null;
      if (ventaMensual > 0) {
        const ventaDiaria = ventaMensual / 30;
        diasHastaAgotamiento = Math.round(producto.stock_actual / ventaDiaria);
      }
      
      // Calcular cantidad sugerida a ordenar (2 meses de inventario)
      const cantidadSugerida = Math.max(
        producto.stock_minimo * 2 - producto.stock_actual,
        Math.ceil(ventaMensual * 2)
      );
      
      return {
        ...producto.toJSON(),
        porcentaje_stock: Math.round((producto.stock_actual / producto.stock_minimo) * 100),
        venta_mensual_promedio: ventaMensual,
        dias_hasta_agotamiento: diasHastaAgotamiento,
        cantidad_sugerida: cantidadSugerida,
        nivel_criticidad: producto.stock_actual === 0 ? 'alto' : 
                        producto.stock_actual <= producto.stock_minimo * 0.5 ? 'medio' : 'bajo'
      };
    }));
    
    return productosConMetricas;
  }
  
  /**
   * Genera un reporte Excel de productos con stock bajo
   * @param {Object} filtros - Criterios de filtrado
   * @returns {Promise<String>} - Ruta del archivo generado
   */
  async generarReporteExcel(filtros = {}) {
    const productos = await this.getProductosBajoStock(filtros);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos bajo stock');
    
    // Añadir encabezados
    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Stock Actual', key: 'stock_actual', width: 15 },
      { header: 'Stock Mínimo', key: 'stock_minimo', width: 15 },
      { header: '% Stock', key: 'porcentaje_stock', width: 10 },
      { header: 'Criticidad', key: 'nivel_criticidad', width: 12 },
      { header: 'Venta Mensual Prom.', key: 'venta_mensual_promedio', width: 18 },
      { header: 'Días para agotamiento', key: 'dias_hasta_agotamiento', width: 20 },
      { header: 'Cantidad Sugerida', key: 'cantidad_sugerida', width: 18 },
      { header: 'Precio Compra', key: 'precio_compra', width: 15 },
      { header: 'Valor Total Sugerido', key: 'valor_total', width: 18 }
    ];
    
    // Dar formato a las celdas del encabezado
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Añadir datos
    productos.forEach(producto => {
      worksheet.addRow({
        codigo: producto.codigo,
        sku: producto.sku,
        nombre: producto.nombre,
        categoria: producto.categoria?.nombre,
        marca: producto.marca?.nombre,
        stock_actual: producto.stock_actual,
        stock_minimo: producto.stock_minimo,
        porcentaje_stock: `${producto.porcentaje_stock}%`,
        nivel_criticidad: producto.nivel_criticidad.toUpperCase(),
        venta_mensual_promedio: Number(producto.venta_mensual_promedio.toFixed(2)),
        dias_hasta_agotamiento: producto.dias_hasta_agotamiento,
        cantidad_sugerida: producto.cantidad_sugerida,
        precio_compra: Number(producto.precio_compra),
        valor_total: Number((producto.cantidad_sugerida * producto.precio_compra).toFixed(2))
      });
    });
    
    // Dar formato condicional a la columna de criticidad
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Omitir encabezado
        const criticidadCell = row.getCell('nivel_criticidad');
        const criticidad = criticidadCell.value;
        
        if (criticidad === 'ALTO') {
          criticidadCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' } // Rojo
          };
        } else if (criticidad === 'MEDIO') {
          criticidadCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFA500' } // Naranja
          };
        } else if (criticidad === 'BAJO') {
          criticidadCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' } // Amarillo
          };
        }
      }
    });
    
    // Generar nombre de archivo único
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `stock-bajo-${timestamp}.xlsx`;
    const filePath = path.join(REPORTS_DIR, fileName);
    
    // Guardar el archivo
    await workbook.xlsx.writeFile(filePath);
    
    return {
      fileName,
      filePath,
      url: `/reports/${fileName}`
    };
  }
  
  /**
   * Obtiene un resumen de alertas para el dashboard
   * @returns {Promise<Object>} - Resumen de alertas
   */
  async getResumenAlertas() {
    // Contar productos por nivel de criticidad
    const totalStockBajo = await Producto.count({
      where: {
        stock_actual: { [Op.lte]: sequelize.col('stock_minimo') },
        activo: true
      }
    });
    
    const stockCritico = await Producto.count({
      where: {
        stock_actual: 0,
        activo: true
      }
    });
    
    const stockMedio = await Producto.count({
      where: {
        stock_actual: { 
          [Op.and]: [
            { [Op.gt]: 0 },
            { [Op.lte]: sequelize.literal('stock_minimo * 0.5') }
          ]
        },
        activo: true
      }
    });
    
    const stockBajo = await Producto.count({
      where: {
        stock_actual: { 
          [Op.and]: [
            { [Op.gt]: sequelize.literal('stock_minimo * 0.5') },
            { [Op.lte]: sequelize.col('stock_minimo') }
          ]
        },
        activo: true
      }
    });
    
    // Productos más urgentes para reabastecer
    const productosUrgentes = await Producto.findAll({
      where: {
        stock_actual: { [Op.lte]: sequelize.literal('stock_minimo * 0.2') }, // 20% del mínimo o menos
        activo: true
      },
      order: [
        [sequelize.literal('(stock_actual * 1.0 / stock_minimo)'), 'ASC']
      ],
      limit: 5,
      include: [
        { association: 'categoria' },
        { association: 'marca' }
      ]
    });
    
    // Valoración del inventario bajo mínimos
    const valoracionStockBajo = await Producto.sum('precio_compra * (stock_minimo - stock_actual)', {
      where: {
        stock_actual: { [Op.lt]: sequelize.col('stock_minimo') },
        activo: true
      }
    });
    
    return {
      resumen: {
        total_productos_bajo_stock: totalStockBajo,
        stock_critico: stockCritico,
        stock_medio: stockMedio,
        stock_bajo: stockBajo,
        valoracion_faltante: valoracionStockBajo || 0
      },
      productos_urgentes: productosUrgentes
    };
  }
}

module.exports = new AlertaStockService();
