## Pruebas del Módulo de Devoluciones

Este documento detalla las pruebas a realizar para verificar el correcto funcionamiento del módulo de devoluciones y cambios.

### 1. Pruebas Unitarias Backend

- [x] Modelo `Devolucion` tiene validaciones correctas
- [x] Modelo `DetalleDevolucion` tiene validaciones correctas
- [x] Controlador `devolucion.controller` maneja errores adecuadamente
- [x] Método `crearDevolucion` actualiza inventario correctamente
- [x] Método `autorizarDevolucion` actualiza el estado y el inventario
- [x] Método `contarDevolucionesPendientes` devuelve conteo correcto

### 2. Pruebas de Integración Backend

- [x] POST `/api/devoluciones` crea una nueva devolución
- [x] POST `/api/devoluciones` rechaza devoluciones inválidas
- [x] GET `/api/devoluciones` lista todas las devoluciones
- [x] GET `/api/devoluciones/:id` devuelve una devolución específica
- [x] GET `/api/devoluciones/pendientes/count` devuelve el conteo correcto
- [x] POST `/api/devoluciones/:id/autorizar` autoriza una devolución pendiente
- [x] POST `/api/devoluciones/:id/cancelar` cancela una devolución
- [x] Transacción de devolución mantiene integridad en caso de error

### 3. Pruebas de Componentes Frontend

- [x] `DevolucionForm` renderiza correctamente
- [x] `DevolucionForm` permite buscar venta por número de ticket
- [x] `DevolucionForm` muestra error cuando no encuentra venta
- [x] `DevolucionesList` muestra devoluciones paginadas
- [x] `DevolucionesList` filtra devoluciones correctamente
- [x] `DevolucionDetalle` muestra información correcta de la devolución
- [x] `DevolucionDetalle` permite autorizar/cancelar según el estado

### 4. Pruebas End-to-End

- [ ] Proceso completo de devolución de un producto
  - Buscar venta por número de ticket
  - Seleccionar productos a devolver
  - Completar formulario con motivo y tipo de reembolso
  - Verificar actualización del inventario
  - Verificar generación de comprobante

- [ ] Proceso completo de cambio de producto
  - Buscar venta original
  - Seleccionar producto a devolver
  - Seleccionar producto por el que se cambia
  - Verificar cálculo de diferencia de precios
  - Verificar actualización del inventario para ambos productos

- [ ] Proceso de autorización para devoluciones de alto valor
  - Crear devolución por un monto mayor al límite
  - Verificar que queda en estado pendiente
  - Acceder como supervisor y autorizar
  - Verificar actualización del inventario

- [ ] Notificaciones de devoluciones pendientes
  - Verificar que el contador se actualiza cuando hay nuevas devoluciones pendientes
  - Verificar que el badge aparece en el menú de navegación
  - Verificar que desaparece cuando no hay devoluciones pendientes

### 5. Casos de Prueba Especiales

- [ ] Intentar devolver más cantidad de un producto que la vendida originalmente
- [ ] Intentar devolver un producto de una venta ya cancelada
- [ ] Intentar autorizar una devolución ya procesada
- [ ] Verificar stock insuficiente para un cambio de producto
- [ ] Verificar cálculo correcto de impuestos en devoluciones parciales

### 6. Pruebas de Rendimiento

- [ ] Tiempo de respuesta al buscar ventas con muchos detalles
- [ ] Tiempo de respuesta al listar devoluciones con filtros
- [ ] Rendimiento con múltiples devoluciones ejecutándose simultáneamente

### 7. Pruebas de Seguridad

- [ ] Verificar que solo usuarios autorizados pueden crear devoluciones
- [ ] Verificar que solo supervisores pueden autorizar devoluciones
- [ ] Verificar que no se pueden manipular IDs para acceder a devoluciones de otros usuarios

### Plan de Ejecución

1. Ejecutar pruebas unitarias y de integración con el comando:
   ```
   npm test -- devolucion
   ```

2. Validar pruebas de componentes frontend:
   ```
   npm run test:frontend
   ```

3. Realizar pruebas end-to-end manualmente siguiendo los escenarios descritos
   
4. Documentar cualquier problema encontrado en el sistema de tickets

### Resultados de Pruebas

| Categoría | Pasadas | Fallidas | Pendientes |
|-----------|---------|----------|------------|
| Backend Unitarias | 6/6 | 0 | 0 |
| Backend Integración | 8/8 | 0 | 0 |
| Frontend Componentes | 7/7 | 0 | 0 |
| End-to-End | 0/4 | 0 | 4 |
| Casos Especiales | 0/5 | 0 | 5 |

**Nota:** Las pruebas end-to-end y casos especiales se ejecutarán manualmente durante la fase de QA.
