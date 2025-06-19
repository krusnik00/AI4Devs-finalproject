const { Descuento } = require('../models');
const { Op } = require('sequelize');

class DescuentoService {
  /**
   * Calcula el descuento aplicable a una venta
   * @param {Object} venta - Objeto con los datos de la venta
   * @param {Array} descuentosAplicables - Lista de descuentos que podrían aplicar
   * @returns {Object} Descuento calculado y detalles
   */
  async calcularDescuento(venta, descuentosAplicables = []) {
    const descuentos = descuentosAplicables.length > 0 
      ? descuentosAplicables 
      : await this.obtenerDescuentosActivos();

    let mejorDescuento = {
      valor: 0,
      descuento: null
    };

    for (const descuento of descuentos) {
      if (!this.validarCondiciones(venta, descuento)) continue;

      const valorDescuento = await this.calcularValorDescuento(venta, descuento);
      if (valorDescuento > mejorDescuento.valor) {
        mejorDescuento = {
          valor: valorDescuento,
          descuento: descuento
        };
      }
    }

    return mejorDescuento;
  }

  /**
   * Obtiene todos los descuentos activos y vigentes
   */
  async obtenerDescuentosActivos() {
    const fecha = new Date();
    return await Descuento.findAll({
      where: {
        estado: 'activo',
        fecha_inicio: {
          [Op.lte]: fecha
        },
        fecha_fin: {
          [Op.gte]: fecha
        },
        [Op.or]: [
          { uso_maximo: null },
          {
            [Op.and]: [
              { uso_maximo: { [Op.ne]: null } },
              { usos_actuales: { [Op.lt]: sequelize.col('uso_maximo') } }
            ]
          }
        ]
      }
    });
  }

  /**
   * Valida si un descuento aplica para una venta específica
   */
  validarCondiciones(venta, descuento) {
    // Validar monto mínimo
    if (venta.subtotal < descuento.minimo_compra) {
      return false;
    }

    // Validar condiciones específicas
    if (descuento.condiciones) {
      // Validar productos específicos
      if (descuento.condiciones.productos) {
        const productosVenta = new Set(venta.productos.map(p => p.producto_id));
        const productosCumplen = descuento.condiciones.productos.some(id => 
          productosVenta.has(id)
        );
        if (!productosCumplen) return false;
      }

      // Validar categorías
      if (descuento.condiciones.categorias) {
        const categoriasCumplen = venta.productos.some(p => 
          descuento.condiciones.categorias.includes(p.producto.categoria_id)
        );
        if (!categoriasCumplen) return false;
      }

      // Validar tipo de cliente
      if (descuento.condiciones.tipo_cliente && 
          venta.cliente?.tipo !== descuento.condiciones.tipo_cliente) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calcula el valor del descuento para una venta
   */
  async calcularValorDescuento(venta, descuento) {
    let valorDescuento = 0;

    switch (descuento.tipo) {
      case 'porcentaje':
        valorDescuento = venta.subtotal * (descuento.valor / 100);
        break;

      case 'monto_fijo':
        valorDescuento = descuento.valor;
        break;

      case 'producto':
        valorDescuento = this.calcularDescuentoProducto(venta, descuento);
        break;
    }

    // Aplicar límite máximo si existe
    if (descuento.maximo_descuento) {
      valorDescuento = Math.min(valorDescuento, descuento.maximo_descuento);
    }

    return valorDescuento;
  }

  /**
   * Calcula el descuento para promociones específicas de productos
   */
  calcularDescuentoProducto(venta, descuento) {
    let valorDescuento = 0;
    const productosAplicables = venta.productos.filter(p => 
      descuento.condiciones.productos?.includes(p.producto_id)
    );

    if (productosAplicables.length === 0) return 0;

    for (const item of productosAplicables) {
      const descuentoItem = item.precio_unitario * (descuento.valor / 100);
      valorDescuento += descuentoItem * item.cantidad;
    }

    return valorDescuento;
  }

  /**
   * Registra el uso de un descuento
   */
  async registrarUsoDescuento(descuentoId) {
    const descuento = await Descuento.findByPk(descuentoId);
    if (!descuento) return;

    await descuento.increment('usos_actuales');
  }
}

module.exports = new DescuentoService();
