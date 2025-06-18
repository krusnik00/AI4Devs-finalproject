-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('particular', 'empresa') NOT NULL DEFAULT 'particular',
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  empresa VARCHAR(150),
  rfc VARCHAR(13),
  correo VARCHAR(150),
  telefono VARCHAR(15),
  direccion VARCHAR(255),
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  codigo_postal VARCHAR(10),
  notas TEXT,
  limite_credito DECIMAL(10, 2) DEFAULT 0.00,
  dias_credito INT DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Índices para optimizar búsquedas
CREATE UNIQUE INDEX idx_clientes_rfc ON clientes (rfc) WHERE rfc IS NOT NULL;
CREATE UNIQUE INDEX idx_clientes_correo ON clientes (correo) WHERE correo IS NOT NULL;
CREATE INDEX idx_clientes_telefono ON clientes (telefono);
CREATE INDEX idx_clientes_nombre_apellido ON clientes (nombre, apellido);
CREATE INDEX idx_clientes_activo ON clientes (activo);

-- Asegurar que la tabla de ventas tiene la relación con clientes
ALTER TABLE ventas
ADD CONSTRAINT fk_ventas_cliente
FOREIGN KEY (cliente_id) REFERENCES clientes(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Crear algunos clientes de ejemplo
INSERT INTO clientes (tipo, nombre, apellido, rfc, correo, telefono, direccion, ciudad, estado)
VALUES 
  ('particular', 'Juan', 'Pérez', 'PEPJ801231ABC', 'juan.perez@example.com', '5551234567', 'Av. Principal 123', 'Ciudad de México', 'CDMX'),
  ('particular', 'María', 'González', 'GOGM750615XYZ', 'maria.gonzalez@example.com', '5559876543', 'Calle Norte 456', 'Guadalajara', 'Jalisco'),
  ('empresa', 'Automotriz del Valle', NULL, 'AVA120725RT8', 'contacto@automotrizdelvalle.com', '5553456789', 'Blvd. Industrial 789', 'Monterrey', 'Nuevo León');
