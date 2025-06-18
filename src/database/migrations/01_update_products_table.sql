-- Migración para añadir nuevos campos a la tabla productos

-- Añadir campo SKU
ALTER TABLE productos ADD COLUMN sku VARCHAR(50) NULL UNIQUE;

-- Añadir campo descripción corta
ALTER TABLE productos ADD COLUMN descripcion_corta VARCHAR(255) NULL;

-- Añadir campo modelo compatible
ALTER TABLE productos ADD COLUMN modelo_compatible VARCHAR(100) NULL;

-- Añadir campo año compatible
ALTER TABLE productos ADD COLUMN anio_compatible VARCHAR(50) NULL;

-- Añadir campo código de barras
ALTER TABLE productos ADD COLUMN codigo_barras VARCHAR(50) NULL UNIQUE;

-- Añadir campo usuario creador
ALTER TABLE productos ADD COLUMN creado_por INT NULL;
ALTER TABLE productos ADD CONSTRAINT fk_productos_creador FOREIGN KEY (creado_por) REFERENCES usuarios(id);

-- Crear tabla para ajustes de inventario
CREATE TABLE ajustes_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  cantidad_anterior INT NOT NULL,
  cantidad_nueva INT NOT NULL,
  diferencia INT NOT NULL,
  tipo_ajuste ENUM('incremento', 'decremento') NOT NULL,
  motivo ENUM('conteo_fisico', 'merma', 'daño', 'error_registro', 'otro') NOT NULL,
  motivo_descripcion TEXT NULL,
  usuario_id INT NOT NULL,
  requiere_autorizacion BOOLEAN NOT NULL DEFAULT FALSE,
  autorizado_por INT NULL,
  estado ENUM('pendiente', 'autorizado', 'rechazado', 'procesado') NOT NULL DEFAULT 'pendiente',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (autorizado_por) REFERENCES usuarios(id)
);

-- Crear directorio para reportes si no existe
-- (Nota: esto generalmente se haría en código, no en SQL)
