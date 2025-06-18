# Documentación del Esquema de Base de Datos
# Sistema de Gestión para Refaccionaria Automotriz

## Introducción

Esta documentación describe el esquema de la base de datos utilizado en el Sistema de Gestión para Refaccionaria Automotriz. El sistema utiliza MySQL como sistema gestor de base de datos relacional y Sequelize como ORM para interactuar con la base de datos desde el backend Node.js.

## Diagrama Entidad-Relación

```
+---------------+       +----------------+       +---------------+
|   Producto    |       |  DetalleVenta  |       |     Venta     |
+---------------+       +----------------+       +---------------+
| PK id         |<------| FK productoId  |       | PK id         |
|    codigo     |       | FK ventaId     |-------| FK clienteId  |
|    nombre     |       |    cantidad    |       |    fecha      |
|    descripcion|       |    precioUnitario     |    total      |
|    categoria  |       |    subtotal    |       |    subtotal   |
|    marca      |       +----------------+       |    impuestos  |
|    modelo     |                                |    estado     |
|    precioCompra                               |    tipoPago   |
|    precioVenta|       +----------------+       |    usuario    |
|    stock      |<------| FK productoId  |       +---------------+
|    stockMinimo|       |    cantidad    |              ^
|    ubicacion  |       |    precioUnitario            |
|    imagen     |       |    subtotal    |       +---------------+
|    codBarras  |       +----------------+       |    Cliente    |
+---------------+                                +---------------+
        ^                                        | PK id         |
        |                                        |    nombre     |
+---------------+       +----------------+       |    rfc        |
|   Categoria   |       |   Proveedor    |       |    direccion  |
+---------------+       +----------------+       |    telefono   |
| PK id         |       | PK id         |       |    email      |
|    nombre     |       |    nombre     |       |    tipo       |
|    descripcion|<------| FK categoriaId|       +---------------+
+---------------+       |    contacto   |
                        |    telefono   |       +---------------+
                        |    email      |       |    Usuario    |
                        |    direccion  |       +---------------+
                        +----------------+       | PK id         |
                                ^                |    nombre     |
                                |                |    email      |
                        +----------------+       |    password   |
                        | ProveedorProducto     |    rol        |
                        +----------------+       |    estado     |
                        | FK proveedorId |       +---------------+
                        | FK productoId  |
                        |    precio     |
                        |    codigo     |
                        |    tiempoEntrega
                        +----------------+
```

## Tablas Principales

### Producto

Almacena la información de todos los productos disponibles en la refaccionaria.

| Columna       | Tipo          | Descripción                                  | Restricciones         |
|---------------|---------------|----------------------------------------------|------------------------|
| id            | INT           | Identificador único del producto             | PK, AUTO_INCREMENT    |
| codigo        | VARCHAR(50)   | Código único del producto                    | UNIQUE                |
| nombre        | VARCHAR(150)  | Nombre del producto                          | NOT NULL              |
| descripcion   | TEXT          | Descripción detallada del producto           |                       |
| categoriaId   | INT           | ID de la categoría del producto              | FK -> Categoria(id)   |
| marca         | VARCHAR(100)  | Marca del producto                           |                       |
| modelo        | VARCHAR(100)  | Modelo de vehículo compatible                |                       |
| precioCompra  | DECIMAL(10,2) | Precio de adquisición del producto           | NOT NULL              |
| precioVenta   | DECIMAL(10,2) | Precio de venta al público                   | NOT NULL              |
| stock         | INT           | Cantidad actual disponible                   | DEFAULT 0             |
| stockMinimo   | INT           | Nivel mínimo de inventario                   | DEFAULT 5             |
| ubicacion     | VARCHAR(50)   | Ubicación física en el almacén               |                       |
| imagen        | VARCHAR(255)  | URL de la imagen del producto                |                       |
| codBarras     | VARCHAR(50)   | Código de barras                             |                       |
| createdAt     | DATETIME      | Fecha de creación del registro               | DEFAULT CURRENT_TIMESTAMP |
| updatedAt     | DATETIME      | Fecha de última actualización                | DEFAULT CURRENT_TIMESTAMP |
| deletedAt     | DATETIME      | Fecha de eliminación (para soft delete)      | NULL                  |

### Venta

Registra las transacciones de venta realizadas.

| Columna       | Tipo          | Descripción                                  | Restricciones         |
|---------------|---------------|----------------------------------------------|------------------------|
| id            | INT           | Identificador único de la venta              | PK, AUTO_INCREMENT    |
| clienteId     | INT           | ID del cliente (NULL para público general)   | FK -> Cliente(id)     |
| fecha         | DATETIME      | Fecha y hora de la venta                     | DEFAULT CURRENT_TIMESTAMP |
| total         | DECIMAL(10,2) | Monto total de la venta                      | NOT NULL              |
| subtotal      | DECIMAL(10,2) | Subtotal antes de impuestos                  | NOT NULL              |
| impuestos     | DECIMAL(10,2) | Monto de impuestos                           | NOT NULL              |
| estado        | ENUM          | Estado de la venta (completada, cancelada)   | DEFAULT 'completada'  |
| tipoPago      | ENUM          | Método de pago utilizado                     | NOT NULL              |
| usuarioId     | INT           | ID del usuario que registró la venta         | FK -> Usuario(id)     |
| createdAt     | DATETIME      | Fecha de creación del registro               | DEFAULT CURRENT_TIMESTAMP |
| updatedAt     | DATETIME      | Fecha de última actualización                | DEFAULT CURRENT_TIMESTAMP |

### DetalleVenta

Almacena los productos incluidos en cada venta.

| Columna        | Tipo          | Descripción                                 | Restricciones         |
|----------------|---------------|---------------------------------------------|------------------------|
| id             | INT           | Identificador único del detalle             | PK, AUTO_INCREMENT    |
| ventaId        | INT           | ID de la venta a la que pertenece           | FK -> Venta(id)       |
| productoId     | INT           | ID del producto vendido                     | FK -> Producto(id)    |
| cantidad       | INT           | Cantidad vendida                            | NOT NULL              |
| precioUnitario | DECIMAL(10,2) | Precio unitario al momento de la venta      | NOT NULL              |
| subtotal       | DECIMAL(10,2) | Subtotal de la línea (cantidad * precio)    | NOT NULL              |
| createdAt      | DATETIME      | Fecha de creación del registro              | DEFAULT CURRENT_TIMESTAMP |
| updatedAt      | DATETIME      | Fecha de última actualización               | DEFAULT CURRENT_TIMESTAMP |

### Cliente

Almacena la información de los clientes registrados.

| Columna       | Tipo          | Descripción                                  | Restricciones         |
|---------------|---------------|----------------------------------------------|------------------------|
| id            | INT           | Identificador único del cliente              | PK, AUTO_INCREMENT    |
| nombre        | VARCHAR(150)  | Nombre completo del cliente                  | NOT NULL              |
| rfc           | VARCHAR(15)   | RFC para facturación                         |                       |
| direccion     | TEXT          | Dirección completa                           |                       |
| telefono      | VARCHAR(15)   | Número de teléfono                           |                       |
| email         | VARCHAR(150)  | Correo electrónico                           |                       |
| tipo          | ENUM          | Tipo de cliente (regular, mayorista)         | DEFAULT 'regular'     |
| createdAt     | DATETIME      | Fecha de creación del registro               | DEFAULT CURRENT_TIMESTAMP |
| updatedAt     | DATETIME      | Fecha de última actualización                | DEFAULT CURRENT_TIMESTAMP |
| deletedAt     | DATETIME      | Fecha de eliminación (para soft delete)      | NULL                  |

### Usuario

Almacena la información de los usuarios del sistema.

| Columna       | Tipo          | Descripción                                  | Restricciones         |
|---------------|---------------|----------------------------------------------|------------------------|
| id            | INT           | Identificador único del usuario              | PK, AUTO_INCREMENT    |
| nombre        | VARCHAR(100)  | Nombre completo del usuario                  | NOT NULL              |
| email         | VARCHAR(150)  | Correo electrónico (usado para login)        | UNIQUE, NOT NULL      |
| password      | VARCHAR(255)  | Contraseña encriptada                        | NOT NULL              |
| rol           | ENUM          | Rol del usuario (admin, vendedor, etc.)      | NOT NULL              |
| estado        | ENUM          | Estado (activo, inactivo)                    | DEFAULT 'activo'      |
| createdAt     | DATETIME      | Fecha de creación del registro               | DEFAULT CURRENT_TIMESTAMP |
| updatedAt     | DATETIME      | Fecha de última actualización                | DEFAULT CURRENT_TIMESTAMP |
| deletedAt     | DATETIME      | Fecha de eliminación (para soft delete)      | NULL                  |

### Categoria

Categorías para clasificar los productos.

| Columna       | Tipo          | Descripción                                  | Restricciones         |
|---------------|---------------|----------------------------------------------|------------------------|
| id            | INT           | Identificador único de la categoría          | PK, AUTO_INCREMENT    |
| nombre        | VARCHAR(100)  | Nombre de la categoría                       | NOT NULL, UNIQUE      |
| descripcion   | TEXT          | Descripción de la categoría                  |                       |
| createdAt     | DATETIME      | Fecha de creación del registro               | DEFAULT CURRENT_TIMESTAMP |
| updatedAt     | DATETIME      | Fecha de última actualización                | DEFAULT CURRENT_TIMESTAMP |

### Proveedor

Almacena información de los proveedores.

| Columna       | Tipo          | Descripción                                  | Restricciones         |
|---------------|---------------|----------------------------------------------|------------------------|
| id            | INT           | Identificador único del proveedor            | PK, AUTO_INCREMENT    |
| nombre        | VARCHAR(150)  | Nombre o razón social del proveedor          | NOT NULL              |
| categoriaId   | INT           | ID de la categoría principal del proveedor   | FK -> Categoria(id)   |
| contacto      | VARCHAR(100)  | Nombre de la persona de contacto             |                       |
| telefono      | VARCHAR(15)   | Número de teléfono                           |                       |
| email         | VARCHAR(150)  | Correo electrónico                           |                       |
| direccion     | TEXT          | Dirección completa                           |                       |
| createdAt     | DATETIME      | Fecha de creación del registro               | DEFAULT CURRENT_TIMESTAMP |
| updatedAt     | DATETIME      | Fecha de última actualización                | DEFAULT CURRENT_TIMESTAMP |
| deletedAt     | DATETIME      | Fecha de eliminación (para soft delete)      | NULL                  |

### ProveedorProducto

Tabla pivote para la relación muchos a muchos entre Proveedor y Producto.

| Columna       | Tipo          | Descripción                                  | Restricciones         |
|---------------|---------------|----------------------------------------------|------------------------|
| id            | INT           | Identificador único del registro             | PK, AUTO_INCREMENT    |
| proveedorId   | INT           | ID del proveedor                             | FK -> Proveedor(id)   |
| productoId    | INT           | ID del producto                              | FK -> Producto(id)    |
| precio        | DECIMAL(10,2) | Precio de compra ofrecido por este proveedor | NOT NULL              |
| codigo        | VARCHAR(50)   | Código del producto según el proveedor       |                       |
| tiempoEntrega | INT           | Tiempo estimado de entrega en días           | DEFAULT 1             |
| createdAt     | DATETIME      | Fecha de creación del registro               | DEFAULT CURRENT_TIMESTAMP |
| updatedAt     | DATETIME      | Fecha de última actualización                | DEFAULT CURRENT_TIMESTAMP |

## Relaciones

1. **Producto - Categoria**: Un producto pertenece a una categoría. Una categoría puede tener muchos productos.
2. **Producto - DetalleVenta**: Un producto puede aparecer en muchos detalles de venta. Un detalle de venta se refiere a un único producto.
3. **Venta - DetalleVenta**: Una venta tiene muchos detalles de venta. Un detalle de venta pertenece a una venta.
4. **Venta - Cliente**: Una venta puede estar asociada a un cliente (o ser venta a público general). Un cliente puede tener muchas ventas.
5. **Venta - Usuario**: Una venta es registrada por un usuario. Un usuario puede registrar muchas ventas.
6. **Producto - Proveedor**: Un producto puede ser ofrecido por muchos proveedores. Un proveedor puede ofrecer muchos productos. Relación muchos a muchos a través de la tabla ProveedorProducto.
7. **Proveedor - Categoria**: Un proveedor puede tener una categoría principal. Una categoría puede ser la principal de muchos proveedores.

## Índices

Para optimizar el rendimiento de las consultas más frecuentes, se han definido los siguientes índices:

1. **Producto.codigo**: Búsquedas por código de producto.
2. **Producto.nombre**: Búsquedas por nombre de producto.
3. **Producto.categoriaId**: Filtrado de productos por categoría.
4. **Venta.fecha**: Consultas de ventas por fechas.
5. **Venta.clienteId**: Consultas de ventas por cliente.
6. **DetalleVenta.ventaId**: Obtención de productos por venta.
7. **DetalleVenta.productoId**: Obtención de ventas por producto.
8. **Proveedor.nombre**: Búsquedas por nombre de proveedor.

## Restricciones y Validaciones

1. **Integridad referencial**: Todas las relaciones entre tablas están protegidas por restricciones de clave foránea.
2. **Soft Delete**: Las tablas críticas (Producto, Cliente, Proveedor, Usuario) implementan soft delete para evitar la pérdida accidental de datos.
3. **Not Null**: Los campos esenciales están protegidos con restricciones NOT NULL.
4. **Valores por defecto**: Campos como stock, estado, fechas tienen valores predeterminados adecuados.

## Notas de Implementación

- La base de datos utiliza codificación UTF-8 para soportar caracteres especiales en nombres y descripciones.
- Las fechas se almacenan en formato UTC para evitar problemas con zonas horarias.
- Los precios y montos monetarios se almacenan como DECIMAL(10,2) para garantizar precisión en los cálculos.
- Las contraseñas de usuarios se almacenan encriptadas mediante bcrypt.
