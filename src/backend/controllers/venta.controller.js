const { Venta, DetalleVenta, Producto, Cliente, Usuario, sequelize } = require('../models');
const { generateTicketPDF } = require('../services/comprobante.service');

// Crear una nueva venta
exports.crearVenta = async (req, res) => {
  // Iniciar transacción para garantizar integridad de datos
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      cliente_id,
      metodo_pago,
      subtotal,
      impuestos,
      total,
      productos
    } = req.body;
    
    // Obtener el ID del usuario actual del token
    const usuario_id = req.user.id;
    
    // Validar que hay productos
    if (!productos || productos.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }
    
    // Validar stock antes de procesar
    const productosIds = productos.map(p => p.producto_id);
    const productosInfo = await Producto.findAll({
      where: { id: productosIds },
      attributes: ['id', 'stock_actual', 'codigo', 'nombre']
    });
    
    // Verificar stock suficiente
    const sinStock = [];
    productos.forEach(item => {
      const producto = productosInfo.find(p => p.id === item.producto_id);
      if (!producto) {
        sinStock.push({ id: item.producto_id, mensaje: 'Producto no encontrado' });
      } else if (producto.stock_actual < item.cantidad) {
        sinStock.push({ 
          id: item.producto_id, 
          codigo: producto.codigo,
          nombre: producto.nombre,
          stock_actual: producto.stock_actual, 
          cantidad_solicitada: item.cantidad,
          mensaje: 'Stock insuficiente' 
        });
      }
    });
    
    if (sinStock.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Algunos productos no tienen stock suficiente', 
        productos_sin_stock: sinStock 
      });
    }
    
    // Crear la venta
    const nuevaVenta = await Venta.create({
      cliente_id: cliente_id || null,
      usuario_id,
      fecha_venta: new Date(),
      subtotal,
      impuestos,
      total,
      metodo_pago,
      estado: 'completada'
    }, { transaction });
    
    // Crear los detalles de venta y actualizar el inventario
    const detallesCreados = await Promise.all(
      productos.map(async (item) => {
        // Crear detalle de venta
        const detalle = await DetalleVenta.create({
          venta_id: nuevaVenta.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.cantidad * item.precio_unitario
        }, { transaction });
        
        // Actualizar stock del producto
        await Producto.decrement('stock_actual', { 
          by: item.cantidad,
          where: { id: item.producto_id },
          transaction
        });
        
        return detalle;
      })
    );
    
    // Confirmar transacción
    await transaction.commit();
    
    // Responder con la venta creada
    const ventaCreada = await Venta.findByPk(nuevaVenta.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'rfc'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
        { model: DetalleVenta, as: 'detalles', include: [
          { model: Producto, as: 'producto', attributes: ['id', 'codigo', 'nombre'] }
        ]}
      ]
    });
    
    return res.status(201).json({
      message: 'Venta procesada correctamente',
      venta: ventaCreada
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al procesar venta:', error);
    return res.status(500).json({ 
      message: 'Error al procesar la venta', 
      error: error.message 
    });
  }
};

// Obtener una venta por ID
exports.obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
        { model: DetalleVenta, as: 'detalles', include: [
          { model: Producto, as: 'producto' }
        ]}
      ]
    });
    
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    return res.status(200).json(venta);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener la venta', 
      error: error.message 
    });
  }
};

// Listar ventas con filtros
exports.listarVentas = async (req, res) => {
  try {
    const { 
      fecha_inicio, 
      fecha_fin, 
      cliente_id, 
      usuario_id, 
      estado,
      pagina = 1,
      limite = 10
    } = req.query;
    
    // Construir clausula WHERE
    const where = {};
    
    if (fecha_inicio && fecha_fin) {
      where.fecha_venta = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
      };
    } else if (fecha_inicio) {
      where.fecha_venta = {
        [Op.gte]: new Date(fecha_inicio)
      };
    } else if (fecha_fin) {
      where.fecha_venta = {
        [Op.lte]: new Date(fecha_fin)
      };
    }
    
    if (cliente_id) where.cliente_id = cliente_id;
    if (usuario_id) where.usuario_id = usuario_id;
    if (estado) where.estado = estado;
    
    // Calcular offset para paginación
    const offset = (pagina - 1) * limite;
    
    // Obtener ventas
    const { count, rows: ventas } = await Venta.findAndCountAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ],
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['fecha_venta', 'DESC']]
    });
    
    return res.status(200).json({
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / limite),
      ventas
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al listar ventas', 
      error: error.message 
    });
  }
};

// Cancelar una venta
exports.cancelarVenta = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    // Verificar que la venta exista y no esté ya cancelada
    const venta = await Venta.findByPk(id, { transaction });
    
    if (!venta) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    if (venta.estado === 'cancelada') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La venta ya está cancelada' });
    }
    
    // Obtener detalles para devolver productos al inventario
    const detalles = await DetalleVenta.findAll({
      where: { venta_id: id },
      transaction
    });
    
    // Devolver productos al inventario
    await Promise.all(
      detalles.map(async (detalle) => {
        await Producto.increment('stock_actual', {
          by: detalle.cantidad,
          where: { id: detalle.producto_id },
          transaction
        });
      })
    );
    
    // Actualizar estado de la venta
    await Venta.update({
      estado: 'cancelada',
      comentarios: motivo ? `CANCELADA: ${motivo}` : 'CANCELADA'
    }, {
      where: { id },
      transaction
    });
    
    // Confirmar transacción
    await transaction.commit();
    
    return res.status(200).json({ 
      message: 'Venta cancelada correctamente' 
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      message: 'Error al cancelar la venta', 
      error: error.message 
    });
  }
};

// Generar comprobante de venta
exports.generarComprobante = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = 'ticket' } = req.query;
    
    // Obtener la venta con todos sus detalles
    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
        { model: DetalleVenta, as: 'detalles', include: [
          { model: Producto, as: 'producto' }
        ]}
      ]
    });
    
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Generar PDF según el tipo
    const result = await generateTicketPDF(venta, tipo);
    
    // Enviar archivo como respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="comprobante-${id}.pdf"`);
    
    return res.send(result);
  } catch (error) {
    console.error('Error al generar comprobante:', error);
    return res.status(500).json({ 
      message: 'Error al generar el comprobante', 
      error: error.message 
    });
  }
};
