-- Migración para crear las tablas de devoluciones

-- Crear tabla de devoluciones
CREATE TABLE IF NOT EXISTS devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  cliente_id INT NULL,
  fecha_devolucion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo ENUM('defectuoso', 'equivocado', 'otro') NOT NULL,
  descripcion_motivo TEXT NULL,
  tipo ENUM('devolucion', 'cambio') NOT NULL DEFAULT 'devolucion',
  tipo_reembolso ENUM('efectivo', 'tarjeta', 'nota_credito', 'cambio_producto') NOT NULL,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  impuestos DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estado ENUM('pendiente', 'autorizado', 'completado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  autorizado_por INT NULL,
  fecha_autorizacion TIMESTAMP NULL,
  comentarios TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_devoluciones_ventas FOREIGN KEY (venta_id) REFERENCES ventas(id),
  CONSTRAINT fk_devoluciones_clientes FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  CONSTRAINT fk_devoluciones_autorizado FOREIGN KEY (autorizado_por) REFERENCES usuarios(id)
);

-- Crear tabla de detalles de devoluciones
CREATE TABLE IF NOT EXISTS detalles_devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  devolucion_id INT NOT NULL,
  detalle_venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  impuesto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  producto_defectuoso BOOLEAN NOT NULL DEFAULT false,
  motivo_detalle TEXT NULL,
  
  -- Campos para cambios de productos
  producto_cambio_id INT NULL,
  cantidad_cambio INT NULL,
  precio_cambio DECIMAL(10, 2) NULL,
  subtotal_cambio DECIMAL(10, 2) NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_detalles_devoluciones_devolucion FOREIGN KEY (devolucion_id) REFERENCES devoluciones(id),
  CONSTRAINT fk_detalles_devoluciones_detalle_venta FOREIGN KEY (detalle_venta_id) REFERENCES detalles_ventas(id),
  CONSTRAINT fk_detalles_devoluciones_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_detalles_devoluciones_producto_cambio FOREIGN KEY (producto_cambio_id) REFERENCES productos(id)
);

-- Añadir índices para mejorar rendimiento
CREATE INDEX idx_devoluciones_venta_id ON devoluciones(venta_id);
CREATE INDEX idx_devoluciones_cliente_id ON devoluciones(cliente_id);
CREATE INDEX idx_devoluciones_estado ON devoluciones(estado);
CREATE INDEX idx_devoluciones_fecha ON devoluciones(fecha_devolucion);

CREATE INDEX idx_detalles_devoluciones_devolucion_id ON detalles_devoluciones(devolucion_id);
CREATE INDEX idx_detalles_devoluciones_producto_id ON detalles_devoluciones(producto_id);
CREATE INDEX idx_detalles_devoluciones_producto_cambio_id ON detalles_devoluciones(producto_cambio_id);

-- Procedimiento almacenado para actualizar el inventario automáticamente cuando se autoriza una devolución
DELIMITER //
CREATE PROCEDURE sp_actualizar_inventario_devolucion(IN p_devolucion_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_producto_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_producto_cambio_id INT;
    DECLARE v_cantidad_cambio INT;
    
    -- Cursor para obtener los productos devueltos
    DECLARE cur_productos CURSOR FOR 
        SELECT producto_id, cantidad, producto_cambio_id, cantidad_cambio
        FROM detalles_devoluciones
        WHERE devolucion_id = p_devolucion_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Abrir cursor y procesar los productos
    OPEN cur_productos;
    
    read_loop: LOOP
        FETCH cur_productos INTO v_producto_id, v_cantidad, v_producto_cambio_id, v_cantidad_cambio;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Actualizar el stock del producto devuelto (incrementar)
        UPDATE productos 
        SET stock = stock + v_cantidad
        WHERE id = v_producto_id;
        
        -- Si hay un producto de cambio, disminuir su stock
        IF v_producto_cambio_id IS NOT NULL AND v_cantidad_cambio > 0 THEN
            UPDATE productos 
            SET stock = stock - v_cantidad_cambio
            WHERE id = v_producto_cambio_id;
        END IF;
        
    END LOOP;
    
    CLOSE cur_productos;
    
    -- Actualizar el estado de la devolución
    UPDATE devoluciones
    SET estado = 'completado'
    WHERE id = p_devolucion_id;
END //
DELIMITER ;

-- Trigger para llamar al procedimiento almacenado cuando se autoriza una devolución
DELIMITER //
CREATE TRIGGER tr_devolucion_autorizada
AFTER UPDATE ON devoluciones
FOR EACH ROW
BEGIN
    IF NEW.estado = 'autorizado' AND OLD.estado = 'pendiente' THEN
        CALL sp_actualizar_inventario_devolucion(NEW.id);
    END IF;
END //
DELIMITER ;
