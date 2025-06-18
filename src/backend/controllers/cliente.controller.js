const { Cliente, Venta, sequelize } = require('../models');
const { Op } = require('sequelize');

// Crear un nuevo cliente
exports.crearCliente = async (req, res) => {
  try {
    const { 
      tipo, nombre, apellido, empresa, rfc, correo, 
      telefono, direccion, ciudad, estado, codigo_postal, 
      notas, limite_credito, dias_credito 
    } = req.body;
    
    // Verificación básica de datos
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    
    if (tipo === 'empresa' && !empresa) {
      return res.status(400).json({ message: 'El nombre de la empresa es obligatorio para clientes tipo empresa' });
    }
    
    // Verificar si ya existe un cliente con el mismo RFC o correo
    if (rfc || correo) {
      const whereClause = [];
      if (rfc) whereClause.push({ rfc });
      if (correo) whereClause.push({ correo });
      
      const clienteExistente = await Cliente.findOne({
        where: {
          [Op.or]: whereClause
        }
      });
      
      if (clienteExistente) {
        let mensaje = 'Ya existe un cliente';
        if (clienteExistente.rfc === rfc) mensaje += ' con el mismo RFC';
        if (clienteExistente.correo === correo) {
          mensaje += clienteExistente.rfc === rfc ? ' y' : ' con el mismo';
          mensaje += ' correo electrónico';
        }
        return res.status(400).json({ message: mensaje });
      }
    }
    
    // Crear el cliente
    const nuevoCliente = await Cliente.create({
      tipo,
      nombre,
      apellido,
      empresa,
      rfc,
      correo,
      telefono,
      direccion,
      ciudad,
      estado,
      codigo_postal,
      notas,
      limite_credito,
      dias_credito
    });
    
    return res.status(201).json({
      message: 'Cliente creado correctamente',
      cliente: nuevoCliente
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return res.status(500).json({ 
      message: 'Error al crear el cliente', 
      error: error.message 
    });
  }
};

// Actualizar un cliente
exports.actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tipo, nombre, apellido, empresa, rfc, correo, 
      telefono, direccion, ciudad, estado, codigo_postal, 
      notas, limite_credito, dias_credito, activo 
    } = req.body;
    
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Verificar duplicados solo si se están actualizando estos campos
    if (rfc !== cliente.rfc || correo !== cliente.correo) {
      const whereClause = [];
      if (rfc && rfc !== cliente.rfc) whereClause.push({ rfc });
      if (correo && correo !== cliente.correo) whereClause.push({ correo });
      
      if (whereClause.length > 0) {
        const clienteExistente = await Cliente.findOne({
          where: {
            id: { [Op.ne]: id },
            [Op.or]: whereClause
          }
        });
        
        if (clienteExistente) {
          let mensaje = 'Ya existe otro cliente';
          if (clienteExistente.rfc === rfc) mensaje += ' con el mismo RFC';
          if (clienteExistente.correo === correo) {
            mensaje += clienteExistente.rfc === rfc ? ' y' : ' con el mismo';
            mensaje += ' correo electrónico';
          }
          return res.status(400).json({ message: mensaje });
        }
      }
    }
    
    // Actualizar cliente
    await cliente.update({
      tipo,
      nombre,
      apellido,
      empresa,
      rfc,
      correo,
      telefono,
      direccion,
      ciudad,
      estado,
      codigo_postal,
      notas,
      limite_credito,
      dias_credito,
      activo
    });
    
    return res.status(200).json({
      message: 'Cliente actualizado correctamente',
      cliente
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return res.status(500).json({ 
      message: 'Error al actualizar el cliente', 
      error: error.message 
    });
  }
};

// Obtener un cliente por ID
exports.obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener el cliente', 
      error: error.message 
    });
  }
};

// Obtener historial de compras de un cliente
exports.obtenerHistorialCompras = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      pagina = 1,
      limite = 10
    } = req.query;
    
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Calcular offset para paginación
    const offset = (pagina - 1) * limite;
    
    // Obtener historial de compras
    const { count, rows: ventas } = await Venta.findAndCountAll({
      where: {
        cliente_id: id
      },
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['fecha_venta', 'DESC']]
    });
    
    // Obtener estadísticas de compra
    const estadisticas = await Venta.findAll({
      where: {
        cliente_id: id
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_compras'],
        [sequelize.fn('SUM', sequelize.col('total')), 'gasto_total'],
        [sequelize.fn('AVG', sequelize.col('total')), 'promedio_compra'],
        [sequelize.fn('MAX', sequelize.col('fecha_venta')), 'ultima_compra']
      ],
      raw: true
    });
    
    return res.status(200).json({
      cliente: {
        id: cliente.id,
        nombre: cliente.getNombreCompleto()
      },
      estadisticas: estadisticas[0],
      historial: {
        total: count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(count / limite),
        ventas
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener historial de compras', 
      error: error.message 
    });
  }
};

// Listar clientes con filtros
exports.listarClientes = async (req, res) => {
  try {
    const { 
      nombre, 
      rfc, 
      correo,
      telefono,
      tipo,
      activo,
      pagina = 1,
      limite = 10,
      ordenarPor = 'nombre',
      orden = 'ASC'
    } = req.query;
    
    // Construir clausula WHERE
    const where = {};
    
    if (nombre) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${nombre}%` } },
        { apellido: { [Op.like]: `%${nombre}%` } },
        { empresa: { [Op.like]: `%${nombre}%` } }
      ];
    }
    
    if (rfc) where.rfc = { [Op.like]: `%${rfc}%` };
    if (correo) where.correo = { [Op.like]: `%${correo}%` };
    if (telefono) where.telefono = { [Op.like]: `%${telefono}%` };
    if (tipo) where.tipo = tipo;
    if (activo !== undefined) where.activo = activo;
    
    // Validar campo de ordenamiento
    const camposValidos = ['nombre', 'created_at', 'rfc', 'correo', 'telefono'];
    const ordenarPorCampo = camposValidos.includes(ordenarPor) ? ordenarPor : 'nombre';
    const direccionOrden = orden.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Calcular offset para paginación
    const offset = (pagina - 1) * limite;
    
    // Obtener clientes
    const { count, rows: clientes } = await Cliente.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [[ordenarPorCampo, direccionOrden]]
    });
    
    return res.status(200).json({
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / limite),
      clientes
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al listar clientes', 
      error: error.message 
    });
  }
};

// Desactivar un cliente (soft delete)
exports.desactivarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Desactivar cliente
    await cliente.update({ activo: false });
    
    return res.status(200).json({
      message: 'Cliente desactivado correctamente'
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al desactivar el cliente', 
      error: error.message 
    });
  }
};

// Buscar cliente por término de búsqueda (para autocompletado)
exports.buscarClientes = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        message: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }
    
    const clientes = await Cliente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { apellido: { [Op.like]: `%${q}%` } },
          { empresa: { [Op.like]: `%${q}%` } },
          { rfc: { [Op.like]: `%${q}%` } },
          { correo: { [Op.like]: `%${q}%` } },
          { telefono: { [Op.like]: `%${q}%` } }
        ],
        activo: true
      },
      attributes: ['id', 'nombre', 'apellido', 'empresa', 'tipo', 'rfc', 'correo', 'telefono'],
      limit: parseInt(limit)
    });
    
    // Transformar resultados para autocompletado
    const resultados = clientes.map(cliente => ({
      id: cliente.id,
      nombre: cliente.getNombreCompleto(),
      tipo: cliente.tipo,
      rfc: cliente.rfc,
      contacto: cliente.correo || cliente.telefono || ''
    }));
    
    return res.status(200).json(resultados);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al buscar clientes', 
      error: error.message 
    });
  }
};
