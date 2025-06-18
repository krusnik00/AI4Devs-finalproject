# Guía de Pull Requests
# Sistema de Gestión para Refaccionaria Automotriz

Este documento describe las mejores prácticas y ejemplos para la creación y revisión de Pull Requests (PR) en el proyecto de Sistema de Gestión para Refaccionaria Automotriz.

## Propósito

Los Pull Requests son fundamentales en nuestro flujo de trabajo ya que:
- Facilitan la revisión de código antes de integrarlo a la rama principal
- Promueven la colaboración y conocimiento compartido
- Mejoran la calidad del código mediante revisiones
- Documentan los cambios realizados

## Convenciones Generales

### Nombrado de Ramas

Las ramas deben seguir el siguiente formato:

- `feature/nombre-de-la-caracteristica` - Para nuevas características
- `bugfix/descripcion-del-problema` - Para correcciones de errores
- `hotfix/descripcion-del-problema` - Para correcciones urgentes en producción
- `refactor/descripcion` - Para refactorizaciones de código
- `docs/descripcion` - Para cambios en documentación

Ejemplo:
```
feature/registro-productos
bugfix/error-calculo-totales
hotfix/fallo-autenticacion
```

### Formato de Título de PR

El título debe ser conciso y describir claramente el cambio:

```
[TIPO] Breve descripción del cambio
```

Donde TIPO puede ser:
- FEAT: Nueva característica
- FIX: Corrección de error
- REFACTOR: Refactorización de código
- DOCS: Cambios en documentación
- TEST: Añadir o modificar pruebas
- CHORE: Cambios en el proceso de build o herramientas

Ejemplos:
```
[FEAT] Implementar búsqueda avanzada de productos
[FIX] Corregir cálculo de impuestos en ventas
[REFACTOR] Optimizar consulta de inventario
```

## Estructura de la Descripción del PR

La descripción debe incluir:

1. **Resumen de cambios** - Explicación del propósito y contexto
2. **Tickets relacionados** - Link a los tickets de trabajo relacionados
3. **Cambios realizados** - Lista detallada de los cambios principales
4. **Capturas de pantalla** - Para cambios visuales (si aplica)
5. **Instrucciones de prueba** - Cómo probar la funcionalidad
6. **Notas adicionales** - Cualquier información relevante

## Ejemplos de Pull Requests

### Ejemplo 1: Implementación de nueva característica

#### Título: 
[FEAT] Implementar formulario de registro de productos

#### Descripción:
**Resumen de cambios**  
Este PR implementa el formulario de registro y edición de productos según lo especificado en la historia de usuario HU-INV-01. Incluye validaciones del lado del cliente, carga de imágenes y cálculos automáticos de márgenes de ganancia.

**Tickets relacionados**  
- TICKET-INV-03: Desarrollar componente de formulario de registro de productos

**Cambios realizados**  
- Creación del componente `ProductForm.jsx` con validaciones
- Implementación de la lógica de carga de imágenes con vista previa
- Integración con el API backend para crear/editar productos
- Configuración de campos dinámicos para selección de categorías y marcas
- Cálculo automático de márgenes basado en precio de compra/venta

**Capturas de pantalla**  
![Formulario de producto](https://ejemplo.com/screenshots/product-form.png)
![Vista previa de imagen](https://ejemplo.com/screenshots/image-preview.png)

**Instrucciones de prueba**  
1. Navegar a "Inventario" > "Agregar Producto"
2. Completar los campos requeridos y opcionales
3. Verificar que las validaciones funcionan correctamente
4. Subir una imagen de prueba
5. Verificar el cálculo automático al cambiar precios
6. Guardar el producto y verificar que aparece en el listado

**Notas adicionales**  
- Se utilizó Formik para el manejo de formularios
- Todas las pruebas unitarias pasan con 95% de cobertura
- Se ha actualizado la documentación del componente

### Ejemplo 2: Corrección de error

#### Título: 
[FIX] Corregir error al calcular totales en venta con múltiples productos

#### Descripción:
**Resumen de cambios**  
Este PR corrige un bug donde los totales de venta se calculaban incorrectamente cuando se agregaban más de 10 productos diferentes a una venta. El problema estaba en la función de redondeo que no manejaba correctamente el acumulado.

**Tickets relacionados**  
- BUG-045: Error en cálculo de totales con múltiples productos

**Cambios realizados**  
- Corregida la función `calculateOrderTotal` en `ventaUtils.js`
- Actualizado el algoritmo de redondeo para evitar errores de precisión
- Agregados tests adicionales para verificar diferentes escenarios de cálculo

**Instrucciones de prueba**  
1. Crear una venta nueva
2. Agregar al menos 10 productos diferentes
3. Verificar que los subtotales, impuestos y total general son calculados correctamente

**Notas adicionales**  
- El problema se debía a errores de redondeo en operaciones con números decimales en JavaScript
- Se ha aplicado la solución recomendada de multiplicar por 100, hacer operaciones con enteros y luego dividir

### Ejemplo 3: Refactorización de código

#### Título: 
[REFACTOR] Optimizar consultas de búsqueda de productos

#### Descripción:
**Resumen de cambios**  
Esta refactorización optimiza las consultas de búsqueda de productos para mejorar el rendimiento, especialmente cuando se filtran por múltiples criterios. Se ha reducido el tiempo de respuesta en aproximadamente 70% para búsquedas complejas.

**Tickets relacionados**  
- TICKET-INV-05: Implementar endpoints de búsqueda en API

**Cambios realizados**  
- Refactorización del controlador `producto.controller.js`
- Implementación de una estrategia de construcción de consultas más eficiente
- Optimización de joins en las consultas Sequelize
- Agregados índices adicionales en la base de datos
- Implementación de caché para resultados de búsquedas frecuentes

**Pruebas de rendimiento**  
| Escenario | Tiempo Anterior | Tiempo Actual | Mejora |
|-----------|-----------------|---------------|--------|
| Búsqueda simple | 320ms | 150ms | 53% |
| Con filtros | 850ms | 210ms | 75% |
| Resultados grandes | 1250ms | 380ms | 70% |

**Instrucciones de prueba**  
1. Ejecutar pruebas de carga con el comando: `npm run load-test:search`
2. Verificar que las búsquedas con múltiples filtros respondan en menos de 300ms
3. Comprobar que los resultados son idénticos a la implementación anterior

**Notas adicionales**  
- Se ha actualizado la documentación de la API con las nuevas optimizaciones
- Esta mejora sienta las bases para implementar funcionalidades de autocompletado más rápidas

## Proceso de Revisión de Código

### Lista de verificación para revisores

#### Funcionalidad
- ¿El código cumple con los requisitos del ticket?
- ¿La solución es la más adecuada para el problema?
- ¿Se han considerado casos extremos y errores?

#### Calidad del código
- ¿El código sigue los estándares y convenciones del proyecto?
- ¿Hay pruebas adecuadas para los cambios?
- ¿La documentación ha sido actualizada?
- ¿Hay código duplicado o que pueda refactorizarse?
- ¿Las variables y funciones tienen nombres significativos?

#### Seguridad
- ¿Se validan correctamente los datos de entrada?
- ¿Se manejan adecuadamente las excepciones?
- ¿Se siguen las mejores prácticas de seguridad?

#### Rendimiento
- ¿El código es eficiente, especialmente en operaciones costosas?
- ¿Se han optimizado las consultas a la base de datos?
- ¿Hay potenciales problemas de memoria o renderizado?

## Comentarios Efectivos

### Ejemplos de comentarios constructivos

**Sugerir una mejora**
```
Sugiero usar un método más específico aquí para mejorar la legibilidad:

```js
// En lugar de
if (product && product.stock > 0 && product.price)

// Considera usar
if (isProductAvailableForPurchase(product))
```

**Señalar un problema potencial**
```
Esta consulta podría ser ineficiente con grandes volúmenes de datos. 
Considera añadir un índice en la tabla productos para el campo `codigo` 
o implementar paginación para limitar los resultados.
```

**Elogiar buenas prácticas**
```
Excelente implementación de la validación de entrada. Me gusta cómo has 
separado la lógica de validación en funciones reutilizables.
```

## Política de Merge

1. **Requisitos para merge**
   - Al menos 2 aprobaciones de revisores
   - Todos los tests automáticos pasando
   - No hay comentarios sin resolver
   - La rama está actualizada con la rama destino

2. **Estrategia de merge**
   - Preferimos "Squash and merge" para mantener un historial limpio
   - El mensaje de commit final debe seguir el formato del título del PR

3. **Después del merge**
   - La rama origen debe ser eliminada
   - El ticket relacionado debe ser actualizado
   - Los deploys automáticos se ejecutarán según el ambiente correspondiente
