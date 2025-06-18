const { Venta, DetalleVenta, Producto, Devolucion, DetalleDevolucion, sequelize } = require('../models');
const { Op } = require('sequelize');

// Crear una nueva devolución
exports.crearDevolucion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      venta_id, 
      cliente_id, 
      motivo, 
      descripcion_motivo,
      tipo_reembolso, 
      detalles, 
      comentarios 
    } = req.body;
    
    // Verificar que la venta existe
    const venta = await Venta.findByPk(venta_id, { 
      include: [{ model: DetalleVenta, as: 'detalles', include: ['producto'] }],
      transaction
    });
    
    if (!venta) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Verificar que la venta no esté cancelada
    if (venta.estado === 'cancelada') {
      await transaction.rollback();
      return res.status(400).json({ message: 'No se puede procesar devolución de una venta cancelada' });
    }
    
    // Calcular valores totales de la devolución
    let subtotal = 0;
    let impuestos = 0;

    // Validar que los productos a devolver existan en la venta original
    for (const detalle of detalles) {
      const detalleOriginal = venta.detalles.find(d => d.id === detalle.detalle_venta_id);
      
      if (!detalleOriginal) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `El producto con ID de detalle ${detalle.detalle_venta_id} no existe en esta venta` 
        });
      }
      
      // Validar que no se está devolviendo más cantidad que la vendida
      if (detalle.cantidad > detalleOriginal.cantidad) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `No se puede devolver más cantidad (${detalle.cantidad}) que la vendida (${detalleOriginal.cantidad}) para el producto ${detalleOriginal.producto.nombre}` 
        });
      }
      
      // Acumular subtotales
      const precioUnitario = detalleOriginal.precio_unitario;
      const subtotalItem = precioUnitario * detalle.cantidad;
      subtotal += subtotalItem;
    }
    
    // Calcular impuestos proporcionales (misma tasa que venta original)
    const tasaImpuesto = venta.subtotal > 0 ? venta.impuestos / venta.subtotal : 0;
    impuestos = subtotal * tasaImpuesto;
    const total = subtotal + impuestos;
    
    // Verificar si se requiere autorización (monto configurable)
    // Valor de ejemplo: requerir autorización para devoluciones mayores a $1000
    const montoAutorizacion = 1000; 
    const requiereAutorizacion = total > montoAutorizacion;
    
    // Si requiere autorización y no se ha proporcionado, marcar como pendiente
    const estado = requiereAutorizacion && !req.body.autorizado_por ? 'pendiente' : 'completada';
    
    // Crear la devolución
    const nuevaDevolucion = await Devolucion.create({
      venta_id,
      cliente_id: cliente_id || venta.cliente_id,
      usuario_id: req.user.id,
      motivo,
      descripcion_motivo,
      tipo_reembolso,
      subtotal,
      impuestos,
      total,
      estado,
      autorizado_por: req.body.autorizado_por,
      comentarios,
      tipo: req.body.tipo || 'devolucion'
    }, { transaction });
    
    // Crear los detalles de la devolución
    for (const detalle of detalles) {
      const detalleOriginal = venta.detalles.find(d => d.id === detalle.detalle_venta_id);
      const precio = detalleOriginal.precio_unitario;
      const subtotalItem = precio * detalle.cantidad;
      
      const nuevoDetalle = await DetalleDevolucion.create({
        devolucion_id: nuevaDevolucion.id,
        detalle_venta_id: detalle.detalle_venta_id,
        producto_id: detalleOriginal.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: precio,
        subtotal: subtotalItem,
        // Si es un cambio, registrar los datos del producto de cambio
        producto_cambio_id: detalle.producto_cambio_id,
        cantidad_cambio: detalle.cantidad_cambio,
        precio_unitario_cambio: detalle.precio_unitario_cambio,
        subtotal_cambio: detalle.subtotal_cambio,
        diferencia: detalle.diferencia
      }, { transaction });
      
      // Si la devolución está completada, actualizar inventario
      if (estado === 'completada') {
        // Aumentar stock del producto devuelto
        await Producto.increment(
          { stock_actual: detalle.cantidad }, 
          { where: { id: detalleOriginal.producto_id }, transaction }
        );
        
        // Si es cambio, reducir stock del producto por el que se cambió
        if (detalle.producto_cambio_id && detalle.cantidad_cambio) {
          await Producto.decrement(
            { stock_actual: detalle.cantidad_cambio }, 
            { where: { id: detalle.producto_cambio_id }, transaction }
          );
        }
      }
    }
    
    // Finalizar la transacción
    await transaction.commit();
    
    return res.status(201).json({
      message: estado === 'completada' ? 
        'Devolución procesada correctamente' : 
        'Devolución registrada y en espera de autorización',
      devolucion: nuevaDevolucion
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al procesar devolución:', error);
    return res.status(500).json({ 
      message: 'Error al procesar la devolución', 
      error: error.message 
    });
  }
};

// Autorizar una devolución pendiente
exports.autorizarDevolucion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Buscar la devolución
    const devolucion = await Devolucion.findByPk(id, {
      include: [{ model: DetalleDevolucion, as: 'detalles' }],
      transaction
    });
    
    if (!devolucion) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }
    
    // Verificar que la devolución esté pendiente
    if (devolucion.estado !== 'pendiente') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La devolución ya ha sido procesada o cancelada' });
    }
    
    // Actualizar el estado de la devolución
    await devolucion.update({
      estado: 'completada',
      autorizado_por: req.user.id
    }, { transaction });
    
    // Actualizar inventario para cada detalle
    for (const detalle of devolucion.detalles) {
      // Aumentar stock del producto devuelto
      await Producto.increment(
        { stock_actual: detalle.cantidad }, 
        { where: { id: detalle.producto_id }, transaction }
      );
      
      // Si es cambio, reducir stock del producto por el que se cambió
      if (detalle.producto_cambio_id && detalle.cantidad_cambio) {
        await Producto.decrement(
          { stock_actual: detalle.cantidad_cambio }, 
          { where: { id: detalle.producto_cambio_id }, transaction }
        );
      }
    }
    
    // Finalizar la transacción
    await transaction.commit();
    
    return res.status(200).json({
      message: 'Devolución autorizada y procesada correctamente',
      devolucion
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al autorizar devolución:', error);
    return res.status(500).json({ 
      message: 'Error al autorizar la devolución', 
      error: error.message 
    });
  }
};

// Cancelar una devolución
exports.cancelarDevolucion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    if (!motivo) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Es necesario proporcionar un motivo para la cancelación' });
    }
    
    // Buscar la devolución
    const devolucion = await Devolucion.findByPk(id, { transaction });
    
    if (!devolucion) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }
    
    // Verificar que la devolución no esté ya cancelada
    if (devolucion.estado === 'cancelada') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La devolución ya ha sido cancelada' });
    }
    
    // Si la devolución ya fue completada, hay que reversar los cambios en el inventario
    if (devolucion.estado === 'completada') {
      // Obtener detalles
      const detalles = await DetalleDevolucion.findAll({
        where: { devolucion_id: id },
        transaction
      });
      
      // Reversar cambios en el inventario
      for (const detalle of detalles) {
        // Reducir stock por los productos que se habían devuelto
        await Producto.decrement(
          { stock_actual: detalle.cantidad }, 
          { where: { id: detalle.producto_id }, transaction }
        );
        
        // Si fue un cambio, restaurar el stock del producto cambiado
        if (detalle.producto_cambio_id && detalle.cantidad_cambio) {
          await Producto.increment(
            { stock_actual: detalle.cantidad_cambio }, 
            { where: { id: detalle.producto_cambio_id }, transaction }
          );
        }
      }
    }
    
    // Actualizar el estado de la devolución
    await devolucion.update({
      estado: 'cancelada',
      comentarios: devolucion.comentarios + ' | CANCELACIÓN: ' + motivo
    }, { transaction });
    
    // Finalizar la transacción
    await transaction.commit();
    
    return res.status(200).json({
      message: 'Devolución cancelada correctamente',
      devolucion
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al cancelar devolución:', error);
    return res.status(500).json({ 
      message: 'Error al cancelar la devolución', 
      error: error.message 
    });
  }
};

// Obtener devolución por ID
exports.obtenerDevolucionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const devolucion = await Devolucion.findByPk(id, {
      include: [
        { 
          model: DetalleDevolucion, 
          as: 'detalles',
          include: [
            { model: Producto, as: 'producto' },
            { model: Producto, as: 'productoCambio' },
            { model: DetalleVenta, as: 'detalleVenta' }
          ]
        },
        { model: Venta, as: 'venta' }
      ]
    });
    
    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }
    
    return res.status(200).json(devolucion);
  } catch (error) {
    console.error('Error al obtener devolución:', error);
    return res.status(500).json({ 
      message: 'Error al obtener la devolución', 
      error: error.message 
    });
  }
};

// Listar todas las devoluciones con filtros
exports.listarDevoluciones = async (req, res) => {
  try {
    const { 
      venta_id, 
      cliente_id, 
      estado, 
      fecha_inicio, 
      fecha_fin, 
      pagina = 1, 
      limite = 10 
    } = req.query;
    
    // Construir las opciones de búsqueda
    const where = {};
    if (venta_id) where.venta_id = venta_id;
    if (cliente_id) where.cliente_id = cliente_id;
    if (estado) where.estado = estado;
    
    if (fecha_inicio || fecha_fin) {
      where.fecha_devolucion = {};
      if (fecha_inicio) where.fecha_devolucion[Op.gte] = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_devolucion[Op.lte] = new Date(fecha_fin);
    }
    
    // Calcular offset para paginación
    const offset = (pagina - 1) * limite;
    
    const { count, rows: devoluciones } = await Devolucion.findAndCountAll({
      where,
      include: [
        { model: Venta, as: 'venta' }
      ],
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['fecha_devolucion', 'DESC']]
    });
    
    return res.status(200).json({
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / limite),
      devoluciones
    });
  } catch (error) {
    console.error('Error al listar devoluciones:', error);
    return res.status(500).json({ 
      message: 'Error al obtener las devoluciones', 
      error: error.message 
    });
  }
};

// Buscar venta para devolución
exports.buscarVentaParaDevolucion = async (req, res) => {
  try {
    const { ticket, factura } = req.query;
    
    if (!ticket && !factura) {
      return res.status(400).json({ message: 'Debe proporcionar un número de ticket o factura' });
    }
    
    // Buscar la venta por número de ticket o factura
    const where = {};
    if (ticket) where.id = ticket;  // Asumiendo que el ID de venta es el número de ticket
    
    const venta = await Venta.findOne({
      where,
      include: [
        { 
          model: DetalleVenta, 
          as: 'detalles',
          include: [
            { model: Producto, as: 'producto' }
          ]
        }
      ]
    });
    
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Verificar si ya hay devoluciones para esta venta
    const devoluciones = await Devolucion.findAll({
      where: { venta_id: venta.id },
      include: [
        { 
          model: DetalleDevolucion, 
          as: 'detalles'
        }
      ]
    });
    
    // Marcar los productos que ya han sido devueltos
    if (devoluciones.length > 0) {
      // Crear un mapa para realizar un seguimiento de las cantidades devueltas por detalle de venta
      const cantidadesDevueltas = {};
      
      // Sumar todas las cantidades devueltas por cada detalle de venta
      for (const devolucion of devoluciones) {
        for (const detalle of devolucion.detalles) {
          if (!cantidadesDevueltas[detalle.detalle_venta_id]) {
            cantidadesDevueltas[detalle.detalle_venta_id] = 0;
          }
          cantidadesDevueltas[detalle.detalle_venta_id] += detalle.cantidad;
        }
      }
      
      // Actualizar los detalles de venta con las cantidades ya devueltas
      venta.detalles.forEach(detalle => {
        detalle.dataValues.cantidadDevuelta = cantidadesDevueltas[detalle.id] || 0;
        detalle.dataValues.cantidadDevolvible = Math.max(0, detalle.cantidad - (cantidadesDevueltas[detalle.id] || 0));
      });
    } else {
      // Si no hay devoluciones, todas las cantidades son devolvibles
      venta.detalles.forEach(detalle => {
        detalle.dataValues.cantidadDevuelta = 0;
        detalle.dataValues.cantidadDevolvible = detalle.cantidad;
      });
    }
    
    return res.status(200).json({
      venta,
      devoluciones
    });
  } catch (error) {
    console.error('Error al buscar venta para devolución:', error);
    return res.status(500).json({ 
      message: 'Error al buscar la venta', 
      error: error.message 
    });
  }
};

// Generar comprobante de devolución
exports.generarComprobante = async (req, res) => {
  try {
    const { id } = req.params;
    
    const devolucion = await Devolucion.findByPk(id, {
      include: [
        { 
          model: DetalleDevolucion, 
          as: 'detalles',
          include: [
            { model: Producto, as: 'producto' },
            { model: Producto, as: 'productoCambio' }
          ]
        },
        { model: Venta, as: 'venta' }
      ]
    });
    
    if (!devolucion) {
      return res.status(404).json({ message: 'Devolución no encontrada' });
    }
    
    // Aquí iría la lógica para generar el comprobante (PDF, HTML, etc.)
    // Por ahora solo devolvemos los datos de la devolución
    
    return res.status(200).json({
      message: 'Comprobante generado',
      devolucion
    });
  } catch (error) {
    console.error('Error al generar comprobante de devolución:', error);
    return res.status(500).json({ 
      message: 'Error al generar el comprobante', 
      error: error.message 
    });
  }
};

// Obtener conteo de devoluciones pendientes
exports.contarDevolucionesPendientes = async (req, res) => {
  try {
    const count = await Devolucion.count({
      where: {
        estado: 'pendiente'
      }
    });
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error al contar devoluciones pendientes:', error);
    return res.status(500).json({ 
      message: 'Error al obtener el conteo de devoluciones pendientes', 
      error: error.message 
    });
  }
};
