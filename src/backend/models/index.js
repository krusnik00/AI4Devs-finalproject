const sequelize = require('../config/database');

// Importar modelos
const Usuario = require('./usuario.model');
const Producto = require('./producto.model');
const Categoria = require('./categoria.model');
const Marca = require('./marca.model');
const Proveedor = require('./proveedor.model');
const Cliente = require('./cliente.model');
const Venta = require('./venta.model');
const DetalleVenta = require('./detalle-venta.model');
const Compra = require('./compra.model');
const DetalleCompra = require('./detalle-compra.model');
const ProductoProveedor = require('./producto-proveedor.model');
const AjusteInventario = require('./ajuste-inventario.model');
const Devolucion = require('./devolucion.model');
const DetalleDevolucion = require('./detalle-devolucion.model');
const Descuento = require('./descuento.model');

// Definir relaciones

// Relaciones de Producto
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });
Producto.belongsTo(Marca, { foreignKey: 'marcaId', as: 'marca' });
Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id', as: 'detallesVenta' });
Producto.hasMany(DetalleCompra, { foreignKey: 'producto_id', as: 'detallesCompra' });
Producto.belongsToMany(Proveedor, { through: ProductoProveedor, foreignKey: 'producto_id', as: 'proveedores' });

// Relaciones de Categoria
Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });

// Relaciones de Marca
Marca.hasMany(Producto, { foreignKey: 'marcaId', as: 'productos' });

// Relaciones de Proveedor
Proveedor.hasMany(Compra, { foreignKey: 'proveedor_id', as: 'compras' });
Proveedor.belongsToMany(Producto, { through: ProductoProveedor, foreignKey: 'proveedor_id', as: 'productos' });

// Relaciones de Cliente
Cliente.hasMany(Venta, { foreignKey: 'cliente_id', as: 'ventasCliente' });

// Relaciones de Usuario
Usuario.hasMany(Venta, { foreignKey: 'usuario_id', as: 'ventasUsuario' });
Usuario.hasMany(Compra, { foreignKey: 'usuario_id', as: 'compras' });

// Relaciones de Venta
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'clienteVenta' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuarioVenta' });
Venta.belongsTo(Descuento, { foreignKey: 'descuento_id', as: 'descuentoVenta' });
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });

// Relaciones de Descuento
Descuento.hasMany(Venta, { foreignKey: 'descuento_id', as: 'ventasConDescuento' });

// Relaciones de DetalleVenta
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Relaciones de Compra
Compra.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Compra.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Compra.hasMany(DetalleCompra, { foreignKey: 'compra_id', as: 'detalles', onDelete: 'CASCADE' });

// Relaciones de DetalleCompra
DetalleCompra.belongsTo(Compra, { foreignKey: 'compra_id', as: 'compra' });
DetalleCompra.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Relaciones de AjusteInventario
AjusteInventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
AjusteInventario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
AjusteInventario.belongsTo(Usuario, { foreignKey: 'autorizado_por', as: 'autorizador' });

// Relaciones de Devolucion
Devolucion.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });
Devolucion.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Devolucion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Devolucion.belongsTo(Usuario, { foreignKey: 'autorizado_por', as: 'autorizador' });
Devolucion.hasMany(DetalleDevolucion, { foreignKey: 'devolucion_id', as: 'detalles', onDelete: 'CASCADE' });

// Relaciones de DetalleDevolucion
DetalleDevolucion.belongsTo(Devolucion, { foreignKey: 'devolucion_id', as: 'devolucion' });
DetalleDevolucion.belongsTo(DetalleVenta, { foreignKey: 'detalle_venta_id', as: 'detalleVenta' });
DetalleDevolucion.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
DetalleDevolucion.belongsTo(Producto, { foreignKey: 'producto_cambio_id', as: 'productoCambio' });

// Exportar modelos y sequelize
module.exports = {
  sequelize,
  Usuario,
  Producto,
  Categoria,
  Marca,
  Proveedor,
  Cliente,
  Venta,
  DetalleVenta,
  Compra,
  DetalleCompra,
  ProductoProveedor,
  AjusteInventario,
  Devolucion,
  DetalleDevolucion
};
