# Módulo de Devoluciones y Cambios

## Descripción General

El módulo de devoluciones y cambios permite gestionar el flujo completo del proceso de devolución de productos vendidos, así como el intercambio por otros artículos. Esta funcionalidad es fundamental para mantener un control preciso del inventario y proporcionar un buen servicio a los clientes.

## Componentes Principales

### 1. Modelos de Datos

- **Devolucion**: Almacena información general de la transacción de devolución.
  - Campos principales: ID de venta relacionada, cliente, fecha, motivo, estado, tipo de reembolso
  - Estados posibles: pendiente, completada, cancelada

- **DetalleDevolucion**: Registra los productos específicos que se devuelven y, en caso de cambios, los productos por los que se intercambian.
  - Campos principales: producto devuelto, cantidad, producto de cambio, cantidad de cambio, diferencia de precio

### 2. API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/devoluciones/buscar-venta` | Busca una venta por número de ticket para iniciar devolución |
| GET | `/devoluciones/pendientes/count` | Obtiene el conteo de devoluciones pendientes de autorización |
| POST | `/devoluciones` | Crea una nueva devolución |
| GET | `/devoluciones` | Lista todas las devoluciones con filtros opcionales |
| GET | `/devoluciones/:id` | Obtiene los detalles de una devolución específica |
| POST | `/devoluciones/:id/autorizar` | Autoriza una devolución pendiente |
| POST | `/devoluciones/:id/cancelar` | Cancela una devolución |
| GET | `/devoluciones/:id/comprobante` | Genera un comprobante de la devolución |

### 3. Componentes Frontend

- **DevolucionForm**: Permite crear nuevas devoluciones/cambios
  - Búsqueda de ventas por número de ticket
  - Selección de productos a devolver
  - Especificación de motivos y tipos de reembolso

- **DevolucionesList**: Muestra el listado de devoluciones con filtros
  - Filtrado por estado, fecha
  - Acciones rápidas para gestionar devoluciones

- **DevolucionDetalle**: Muestra información detallada de una devolución
  - Información general y productos devueltos/cambiados
  - Opciones para autorizar o cancelar devoluciones pendientes
  - Generación de comprobantes

### 4. Integración con otros Módulos

- **Inventario**: Actualización automática del inventario al autorizar devoluciones
- **Ventas**: Vinculación con ventas originales para mantener trazabilidad
- **Clientes**: Asociación con clientes para historial de devoluciones

## Flujo de Trabajo

1. **Inicio del proceso**:
   - Búsqueda de la venta original por número de ticket
   - Verificación de que la venta es válida para devolución

2. **Selección de productos**:
   - Selección de productos a devolver con sus cantidades
   - Especificación de motivo (defectuoso, equivocado, otro)

3. **Tipo de devolución**:
   - Devolución simple: reembolso del dinero
   - Cambio: selección de productos de reemplazo

4. **Proceso de autorización**:
   - Devoluciones menores a $1000 se autorizan automáticamente
   - Devoluciones mayores requieren aprobación de supervisor

5. **Finalización**:
   - Actualización automática de inventario
   - Generación de comprobante de devolución
   - Registro en el historial del cliente

## Consideraciones Técnicas

- La actualización de inventario se realiza mediante transacciones SQL para garantizar consistencia
- Se implementan validaciones para evitar devolver más productos de los comprados
- El sistema mantiene una trazabilidad completa entre ventas y devoluciones

## Notificación de Devoluciones Pendientes

El sistema muestra notificaciones visuales (badges) en el menú principal cuando hay devoluciones pendientes de autorización, lo que permite a los supervisores identificar rápidamente cuándo deben revisar y autorizar devoluciones.

## Reportes Disponibles

- Devoluciones por período
- Productos más devueltos (para análisis de calidad)
- Motivos de devolución más frecuentes
- Impacto financiero de las devoluciones
