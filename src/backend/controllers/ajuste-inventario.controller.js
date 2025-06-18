const { AjusteInventario, Producto, Usuario } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Crear un nuevo ajuste de inventario
exports.createAjusteInventario = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { producto_id, cantidad_nueva, motivo, motivo_descripcion } = req.body;
    const usuario_id = req.user.id;
    
    // Verificar que el producto existe
    const producto = await Producto.findByPk(producto_id);
    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Calcular la diferencia y determinar el tipo de ajuste
    const cantidad_anterior = producto.stock_actual;
    const diferencia = cantidad_nueva - cantidad_anterior;
    
    if (diferencia === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'No hay cambio en el inventario' });
    }
    
    const tipo_ajuste = diferencia > 0 ? 'incremento' : 'decremento';
    
    // Determinar si requiere autorización (ajustes mayores a 10 unidades o cierto valor)
    const umbral_unidades = 10;
    const umbral_valor = 5000; // Valor monetario en la moneda local
    const valor_ajuste = Math.abs(diferencia * producto.precio_compra);
    const requiere_autorizacion = Math.abs(diferencia) > umbral_unidades || valor_ajuste > umbral_valor;
    
    // Estado inicial dependiendo de si requiere autorización
    const estado = requiere_autorizacion ? 'pendiente' : 'procesado';
    
    // Crear el registro de ajuste de inventario
    const ajuste = await AjusteInventario.create({
      producto_id,
      cantidad_anterior,
      cantidad_nueva,
      diferencia,
      tipo_ajuste,
      motivo,
      motivo_descripcion,
      usuario_id,
      requiere_autorizacion,
      estado
    }, { transaction });
    
    // Si no requiere autorización, actualizar el inventario inmediatamente
    if (!requiere_autorizacion) {
      await Producto.update(
        { stock_actual: cantidad_nueva },
        { where: { id: producto_id }, transaction }
      );
    }
    
    await transaction.commit();
    
    // Cargar relaciones para la respuesta
    const ajusteConRelaciones = await AjusteInventario.findByPk(ajuste.id, {
      include: [
        { model: Producto, as: 'producto', attributes: ['id', 'codigo', 'nombre'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ]
    });
    
    return res.status(201).json({
      message: requiere_autorizacion 
        ? 'Ajuste de inventario creado, pendiente de autorización'
        : 'Ajuste de inventario procesado exitosamente',
      ajuste: ajusteConRelaciones
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      message: 'Error al procesar el ajuste de inventario', 
      error: error.message 
    });
  }
};

// Autorizar un ajuste de inventario
exports.autorizarAjuste = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { autorizado, razon_rechazo } = req.body;
    const usuario_id = req.user.id;
    
    // Verificar que el usuario tenga permisos para autorizar
    if (req.user.rol !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'No tiene permisos para autorizar ajustes' });
    }
    
    // Buscar el ajuste pendiente
    const ajuste = await AjusteInventario.findOne({
      where: { 
        id,
        estado: 'pendiente'
      }
    });
    
    if (!ajuste) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Ajuste no encontrado o no está pendiente' });
    }
    
    // Actualizar estado según decisión
    if (autorizado) {
      // Actualizar el ajuste
      await AjusteInventario.update({
        estado: 'autorizado',
        autorizado_por: usuario_id
      }, { 
        where: { id },
        transaction
      });
      
      // Actualizar el inventario
      await Producto.update(
        { stock_actual: ajuste.cantidad_nueva },
        { 
          where: { id: ajuste.producto_id },
          transaction
        }
      );
      
      // Actualizar estado a procesado
      await AjusteInventario.update({
        estado: 'procesado'
      }, { 
        where: { id },
        transaction
      });
    } else {
      // Rechazar el ajuste
      await AjusteInventario.update({
        estado: 'rechazado',
        autorizado_por: usuario_id,
        motivo_descripcion: ajuste.motivo_descripcion + 
          `\nRechazado: ${razon_rechazo || 'Sin razón especificada'}`
      }, { 
        where: { id },
        transaction
      });
    }
    
    await transaction.commit();
    
    return res.status(200).json({ 
      message: autorizado 
        ? 'Ajuste de inventario autorizado y procesado' 
        : 'Ajuste de inventario rechazado'
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ 
      message: 'Error al procesar la autorización', 
      error: error.message 
    });
  }
};

// Listar ajustes de inventario con filtros
exports.getAjustes = async (req, res) => {
  try {
    const { 
      estado, 
      producto_id, 
      desde, 
      hasta, 
      motivo,
      usuario_id,
      pagina = 1,
      limite = 10
    } = req.query;
    
    // Construir cláusula WHERE
    const whereClause = {};
    
    if (estado) whereClause.estado = estado;
    if (producto_id) whereClause.producto_id = producto_id;
    if (motivo) whereClause.motivo = motivo;
    if (usuario_id) whereClause.usuario_id = usuario_id;
    
    // Filtro por fecha
    if (desde || hasta) {
      whereClause.createdAt = {};
      if (desde) whereClause.createdAt[Op.gte] = new Date(desde);
      if (hasta) whereClause.createdAt[Op.lte] = new Date(hasta);
    }
    
    // Paginación
    const offset = (pagina - 1) * limite;
    
    // Ejecutar consulta
    const { count, rows: ajustes } = await AjusteInventario.findAndCountAll({
      where: whereClause,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: Producto, as: 'producto', attributes: ['id', 'codigo', 'nombre'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'autorizador', attributes: ['id', 'nombre'] }
      ]
    });
    
    return res.status(200).json({
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / limite),
      ajustes
    });
    
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener los ajustes de inventario', 
      error: error.message 
    });
  }
};

// Obtener un ajuste específico
exports.getAjusteById = async (req, res) => {
  try {
    const ajuste = await AjusteInventario.findByPk(req.params.id, {
      include: [
        { model: Producto, as: 'producto' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'autorizador', attributes: ['id', 'nombre'] }
      ]
    });
    
    if (!ajuste) {
      return res.status(404).json({ message: 'Ajuste no encontrado' });
    }
    
    return res.status(200).json(ajuste);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el ajuste de inventario', 
      error: error.message 
    });
  }
};
