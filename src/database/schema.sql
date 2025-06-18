-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS refaccionaria_db;
USE refaccionaria_db;

-- Tabla Usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'vendedor', 'almacen') DEFAULT 'vendedor',
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Categorías
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Marcas
CREATE TABLE marcas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoriaId INT NOT NULL,
  marcaId INT NOT NULL,
  precio_compra DECIMAL(10, 2) NOT NULL,
  precio_venta DECIMAL(10, 2) NOT NULL,
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 5,
  ubicacion VARCHAR(50),
  imagen_url VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoriaId) REFERENCES categorias(id),
  FOREIGN KEY (marcaId) REFERENCES marcas(id)
);

-- Tabla Proveedores
CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Productos-Proveedores (relación y precios)
CREATE TABLE productos_proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  tiempo_entrega INT, -- días promedio
  activo BOOLEAN DEFAULT TRUE,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Tabla Clientes
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  rfc VARCHAR(20),
  tipo ENUM('normal', 'mayorista', 'taller') DEFAULT 'normal',
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Ventas
CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  usuario_id INT NOT NULL,
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10, 2) NOT NULL,
  impuestos DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'credito') NOT NULL,
  estado ENUM('completada', 'cancelada', 'pendiente') DEFAULT 'completada',
  comentarios TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla Detalle de Ventas
CREATE TABLE detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla Compras
CREATE TABLE compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_recepcion TIMESTAMP NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  impuestos DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  estado ENUM('pendiente', 'recibida', 'parcial', 'cancelada') DEFAULT 'pendiente',
  comentarios TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla Detalle de Compras
CREATE TABLE detalle_compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compra_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  cantidad_recibida INT DEFAULT 0,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla para el historial de movimientos de inventario
CREATE TABLE movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  tipo_movimiento ENUM('entrada', 'salida', 'ajuste') NOT NULL,
  cantidad INT NOT NULL,
  stock_anterior INT NOT NULL,
  stock_nuevo INT NOT NULL,
  referencia_id INT, -- ID de la venta o compra relacionada
  tipo_referencia ENUM('venta', 'compra', 'ajuste'),
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT NOT NULL,
  comentarios TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Trigger para actualizar inventario después de una venta
DELIMITER //
CREATE TRIGGER after_detalle_venta_insert
AFTER INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
  DECLARE stock_anterior INT;
  
  -- Obtener stock anterior
  SELECT stock_actual INTO stock_anterior FROM productos WHERE id = NEW.producto_id;
  
  -- Actualizar stock
  UPDATE productos 
  SET stock_actual = stock_actual - NEW.cantidad 
  WHERE id = NEW.producto_id;
  
  -- Registrar movimiento
  INSERT INTO movimientos_inventario (
    producto_id, 
    tipo_movimiento, 
    cantidad, 
    stock_anterior, 
    stock_nuevo, 
    referencia_id, 
    tipo_referencia,
    usuario_id,
    comentarios
  ) VALUES (
    NEW.producto_id,
    'salida',
    NEW.cantidad,
    stock_anterior,
    stock_anterior - NEW.cantidad,
    NEW.venta_id,
    'venta',
    (SELECT usuario_id FROM ventas WHERE id = NEW.venta_id),
    'Venta de producto'
  );
END //
DELIMITER ;

-- Trigger para actualizar inventario después de una compra recibida
DELIMITER //
CREATE TRIGGER after_detalle_compra_update
AFTER UPDATE ON detalle_compras
FOR EACH ROW
BEGIN
  DECLARE stock_anterior INT;
  DECLARE cantidad_nueva INT;
  
  -- Solo proceder si la cantidad recibida ha cambiado
  IF NEW.cantidad_recibida != OLD.cantidad_recibida THEN
    -- Calcular la cantidad nueva recibida
    SET cantidad_nueva = NEW.cantidad_recibida - OLD.cantidad_recibida;
    
    -- Obtener stock anterior
    SELECT stock_actual INTO stock_anterior FROM productos WHERE id = NEW.producto_id;
    
    -- Actualizar stock
    UPDATE productos 
    SET stock_actual = stock_actual + cantidad_nueva 
    WHERE id = NEW.producto_id;
    
    -- Registrar movimiento
    IF cantidad_nueva > 0 THEN
      INSERT INTO movimientos_inventario (
        producto_id, 
        tipo_movimiento, 
        cantidad, 
        stock_anterior, 
        stock_nuevo, 
        referencia_id, 
        tipo_referencia,
        usuario_id,
        comentarios
      ) VALUES (
        NEW.producto_id,
        'entrada',
        cantidad_nueva,
        stock_anterior,
        stock_anterior + cantidad_nueva,
        NEW.compra_id,
        'compra',
        (SELECT usuario_id FROM compras WHERE id = NEW.compra_id),
        'Recepción de producto'
      );
    END IF;
  END IF;
END //
DELIMITER ;

-- Insertar datos iniciales
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@refaccionaria.com', '$2a$10$X8EJF9XVVlvHw9dweqJOFOg4R5VvQf.HU8CuMmKjr0WMvZfZ9Ob9S', 'admin');  -- Password: admin123

INSERT INTO categorias (nombre, descripcion) VALUES 
('Frenos', 'Sistemas de frenado y componentes'),
('Suspensión', 'Partes del sistema de suspensión'),
('Motor', 'Partes y componentes del motor'),
('Eléctricos', 'Sistema eléctrico y electrónico'),
('Filtros', 'Filtros de aire, aceite y combustible');

INSERT INTO marcas (nombre) VALUES 
('Bosch'),
('Gates'),
('NGK'),
('ACDelco'),
('Monroe');

-- Crear índices para optimizar consultas
CREATE INDEX idx_producto_codigo ON productos(codigo);
CREATE INDEX idx_venta_fecha ON ventas(fecha_venta);
CREATE INDEX idx_producto_stock ON productos(stock_actual, stock_minimo);
CREATE INDEX idx_proveedores_producto ON productos_proveedores(producto_id, precio);
