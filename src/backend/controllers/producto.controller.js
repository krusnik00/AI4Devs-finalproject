const Producto = require('../models/producto.model');
const { Op } = require('sequelize');

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { activo: true }
    });
    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    // Añadir usuario que creó el producto si está disponible en la solicitud
    if (req.user && req.user.id) {
      req.body.creado_por = req.user.id;
    }

    // Si no se proporciona un código, generar uno simple
    if (!req.body.codigo) {
      const count = await Producto.count();
      const timestamp = new Date().getTime().toString().slice(-6);
      req.body.codigo = `PROD-${timestamp}-${count + 1}`;
    }

    const nuevoProducto = await Producto.create(req.body);
    return res.status(201).json(nuevoProducto);
  } catch (error) {
    // Manejo de errores específicos
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Error de validación', 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Error de validación', 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    return res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

// Actualizar un producto existente
exports.updateProducto = async (req, res) => {
  try {
    const [updated] = await Producto.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const productoActualizado = await Producto.findByPk(req.params.id);
      return res.status(200).json(productoActualizado);
    }
    
    return res.status(404).json({ message: 'Producto no encontrado' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

// Eliminar un producto (desactivar)
exports.deleteProducto = async (req, res) => {
  try {
    const [updated] = await Producto.update(
      { activo: false },
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      return res.status(200).json({ message: 'Producto eliminado correctamente' });
    }
    
    return res.status(404).json({ message: 'Producto no encontrado' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

// Buscar productos por término con filtros avanzados
exports.searchProductos = async (req, res) => {
  try {
    const { 
      term, 
      categoriaId, 
      marcaId, 
      modelo, 
      precioMin, 
      precioMax,
      soloDisponibles,
      ordenarPor,
      direccion,
      pagina = 1,
      limite = 10
    } = req.query;
    
    // Construir cláusula WHERE
    const whereClause = { activo: true };
    
    // Búsqueda por término en múltiples campos
    if (term) {
      whereClause[Op.or] = [
        { codigo: { [Op.like]: `%${term}%` } },
        { sku: { [Op.like]: `%${term}%` } },
        { nombre: { [Op.like]: `%${term}%` } },
        { descripcion_corta: { [Op.like]: `%${term}%` } },
        { descripcion: { [Op.like]: `%${term}%` } },
        { codigo_barras: { [Op.like]: `%${term}%` } }
      ];
    }
    
    // Filtros adicionales
    if (categoriaId) whereClause.categoriaId = categoriaId;
    if (marcaId) whereClause.marcaId = marcaId;
    if (modelo) whereClause.modelo_compatible = { [Op.like]: `%${modelo}%` };
    if (precioMin) whereClause.precio_venta = { ...whereClause.precio_venta, [Op.gte]: precioMin };
    if (precioMax) whereClause.precio_venta = { ...whereClause.precio_venta, [Op.lte]: precioMax };
    if (soloDisponibles === 'true') whereClause.stock_actual = { [Op.gt]: 0 };
    
    // Opciones de ordenamiento
    const order = [];
    if (ordenarPor) {
      const dir = direccion === 'desc' ? 'DESC' : 'ASC';
      switch(ordenarPor) {
        case 'precio':
          order.push(['precio_venta', dir]);
          break;
        case 'nombre':
          order.push(['nombre', dir]);
          break;
        case 'stock':
          order.push(['stock_actual', dir]);
          break;
        default:
          order.push(['id', dir]);
      }
    } else {
      order.push(['id', 'ASC']);
    }
    
    // Paginación
    const offset = (pagina - 1) * limite;
    
    // Ejecutar consulta
    const { count, rows: productos } = await Producto.findAndCountAll({
      where: whereClause,
      order,
      limit: parseInt(limite),
      offset: parseInt(offset),
      include: [
        { association: 'categoria' },
        { association: 'marca' }
      ]
    });
    
    // Preparar respuesta paginada
    return res.status(200).json({
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / limite),
      productos
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar productos', error: error.message });
  }
};

// Obtener productos con stock bajo
exports.getProductosBajoStock = async (req, res) => {
  try {
    const { 
      categoriaId, 
      marcaId, 
      criticidad,
      pagina = 1,
      limite = 10
    } = req.query;
    
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
      // Productos con stock cero
      whereClause.stock_actual = 0;
    } else if (criticidad === 'medio') {
      // Productos con menos del 50% del stock mínimo pero no cero
      whereClause.stock_actual = { 
        [Op.and]: [
          { [Op.gt]: 0 },
          { [Op.lte]: sequelize.literal('stock_minimo * 0.5') }
        ]
      };
    } else if (criticidad === 'bajo') {
      // Productos entre 50% y 100% del stock mínimo
      whereClause.stock_actual = { 
        [Op.and]: [
          { [Op.gt]: sequelize.literal('stock_minimo * 0.5') },
          { [Op.lte]: sequelize.col('stock_minimo') }
        ]
      };
    }
    
    // Paginación
    const offset = (pagina - 1) * limite;
    
    // Ejecutar consulta principal
    const { count, rows: productos } = await Producto.findAndCountAll({
      where: whereClause,
      order: [
        [sequelize.literal('(stock_actual * 1.0 / stock_minimo)'), 'ASC'],
        ['nombre', 'ASC']
      ],
      limit: parseInt(limite),
      offset: parseInt(offset),
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
    
    // Preparar respuesta
    return res.status(200).json({
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / limite),
      productos: productosConMetricas,
      resumen: {
        total_productos_bajo_stock: count,
        stock_critico: productos.filter(p => p.stock_actual === 0).length,
        stock_medio: productos.filter(p => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo * 0.5).length,
        stock_bajo: productos.filter(p => p.stock_actual > p.stock_minimo * 0.5).length
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos con stock bajo', error: error.message });
  }
};

// Autocompletado de productos
exports.autocompleteProductos = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term || term.length < 2) {
      return res.status(400).json({ message: 'El término de búsqueda debe tener al menos 2 caracteres' });
    }
    
    // Buscar por diferentes campos, limitando resultados para mejor rendimiento
    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { codigo: { [Op.like]: `%${term}%` } },
          { nombre: { [Op.like]: `%${term}%` } },
          { sku: { [Op.like]: `%${term}%` } },
          { codigo_barras: { [Op.like]: `%${term}%` } }
        ],
        activo: true
      },
      attributes: ['id', 'codigo', 'sku', 'nombre', 'precio_venta', 'stock_actual', 'imagen_url'],
      include: [
        { 
          association: 'categoria',
          attributes: ['id', 'nombre'] 
        },
        { 
          association: 'marca',
          attributes: ['id', 'nombre'] 
        }
      ],
      limit: 10
    });
    
    // Formatear resultados para autocompletado
    const resultados = productos.map(p => ({
      id: p.id,
      codigo: p.codigo,
      sku: p.sku,
      nombre: p.nombre,
      precio: p.precio_venta,
      stock: p.stock_actual,
      categoria: p.categoria ? p.categoria.nombre : null,
      marca: p.marca ? p.marca.nombre : null,
      imagen: p.imagen_url,
      stockBajo: p.stock_actual <= p.stock_minimo
    }));
    
    return res.status(200).json(resultados);
  } catch (error) {
    return res.status(500).json({ message: 'Error en autocompletado', error: error.message });
  }
};
