const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

/**
 * Servicio para análisis predictivo básico de ventas
 */
class AnalisisService {
  /**
   * Predice la demanda de productos basada en datos históricos
   * @param {number} meses - Número de meses a predecir
   * @returns {Promise<Array>} - Lista de productos con predicción de demanda
   */
  async predecirDemanda(meses = 3) {
    try {
      // Consulta SQL para obtener ventas históricas agrupadas por mes
      const query = `
        SELECT 
          p.id, 
          p.nombre,
          DATE_FORMAT(v.fecha_venta, '%Y-%m') AS mes,
          SUM(d.cantidad) AS cantidad_vendida
        FROM productos p
        JOIN detalle_ventas d ON p.id = d.producto_id
        JOIN ventas v ON d.venta_id = v.id
        WHERE v.fecha_venta >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY p.id, p.nombre, mes
        ORDER BY p.id, mes
      `;
      
      const ventasHistoricas = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      // Implementación de un algoritmo simple de promedio móvil para predicción
      const productos = {};
      ventasHistoricas.forEach(venta => {
        if (!productos[venta.id]) {
          productos[venta.id] = {
            id: venta.id,
            nombre: venta.nombre,
            ventas: []
          };
        }
        productos[venta.id].ventas.push({
          mes: venta.mes,
          cantidad: venta.cantidad_vendida
        });
      });
      
      // Calcular predicción para cada producto
      const predicciones = Object.values(productos).map(producto => {
        // Si hay menos de 3 meses de datos, usar el promedio simple
        if (producto.ventas.length < 3) {
          const promedio = producto.ventas.reduce((sum, venta) => sum + venta.cantidad, 0) / producto.ventas.length;
          return {
            id: producto.id,
            nombre: producto.nombre,
            prediccion_proximos_meses: new Array(meses).fill(Math.round(promedio))
          };
        }
        
        // Usar los últimos 3 meses para predecir tendencia
        const ultimosMeses = producto.ventas.slice(-3);
        let tendencia = 0;
        
        for (let i = 1; i < ultimosMeses.length; i++) {
          tendencia += (ultimosMeses[i].cantidad - ultimosMeses[i-1].cantidad);
        }
        
        tendencia = tendencia / (ultimosMeses.length - 1);
        
        // Calcular predicción para los próximos meses
        const ultimaCantidad = ultimosMeses[ultimosMeses.length - 1].cantidad;
        const prediccion = new Array(meses).fill(0).map((_, index) => {
          return Math.max(0, Math.round(ultimaCantidad + (tendencia * (index + 1))));
        });
        
        return {
          id: producto.id,
          nombre: producto.nombre,
          prediccion_proximos_meses: prediccion
        };
      });
      
      return predicciones;
    } catch (error) {
      console.error('Error en predecirDemanda:', error);
      throw error;
    }
  }
  
  /**
   * Compara precios entre diferentes proveedores para los productos
   * @returns {Promise<Array>} - Lista de productos con comparación de precios por proveedor
   */
  async compararPreciosProveedores() {
    try {
      const query = `
        SELECT 
          p.id,
          p.nombre,
          pr.id AS proveedor_id,
          pr.nombre AS proveedor_nombre,
          pp.precio,
          pp.fecha_actualizacion
        FROM productos p
        JOIN productos_proveedores pp ON p.id = pp.producto_id
        JOIN proveedores pr ON pp.proveedor_id = pr.id
        WHERE pp.activo = true
        ORDER BY p.id, pp.precio ASC
      `;
      
      const precios = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      // Agrupar por producto
      const productos = {};
      precios.forEach(precio => {
        if (!productos[precio.id]) {
          productos[precio.id] = {
            id: precio.id,
            nombre: precio.nombre,
            proveedores: []
          };
        }
        
        productos[precio.id].proveedores.push({
          id: precio.proveedor_id,
          nombre: precio.proveedor_nombre,
          precio: precio.precio,
          fecha_actualizacion: precio.fecha_actualizacion
        });
      });
      
      // Procesar datos para agregar información sobre mejor proveedor
      return Object.values(productos).map(producto => {
        // Ordenar proveedores por precio ascendente
        producto.proveedores.sort((a, b) => a.precio - b.precio);
        
        // Calcular diferencia porcentual entre el mejor y peor precio
        if (producto.proveedores.length > 1) {
          const mejorPrecio = producto.proveedores[0].precio;
          const peorPrecio = producto.proveedores[producto.proveedores.length - 1].precio;
          producto.diferencia_porcentual = ((peorPrecio - mejorPrecio) / peorPrecio) * 100;
          producto.ahorro_potencial = peorPrecio - mejorPrecio;
        } else {
          producto.diferencia_porcentual = 0;
          producto.ahorro_potencial = 0;
        }
        
        // Identificar proveedor recomendado
        if (producto.proveedores.length > 0) {
          producto.proveedor_recomendado = producto.proveedores[0];
        }
        
        return producto;
      });
    } catch (error) {
      console.error('Error en compararPreciosProveedores:', error);
      throw error;
    }
  }
}

module.exports = new AnalisisService();
