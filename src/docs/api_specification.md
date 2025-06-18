# API Specification
# Sistema de Gestión para Refaccionaria Automotriz

## Introducción

Esta documentación detalla la API RESTful del Sistema de Gestión para Refaccionaria Automotriz. La API permite la gestión completa del sistema, incluyendo inventario, ventas, compras y análisis de datos.

## Base URL

```
https://api.refaccionaria.com/v1
```

Para ambiente de desarrollo:
```
http://localhost:3000/api/v1
```

## Autenticación

La API utiliza autenticación basada en tokens JWT (JSON Web Token).

### Obtener Token

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Usuario Ejemplo",
    "email": "usuario@ejemplo.com",
    "rol": "admin"
  }
}
```

### Uso del Token

Incluir el token en todas las peticiones que requieran autenticación:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Convenciones de la API

- Todas las peticiones y respuestas utilizan formato JSON
- Las fechas se representan en formato ISO-8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Los errores siguen un formato consistente
- La paginación se implementa con parámetros `page` y `limit`

## Respuestas de Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": {}
  }
}
```

Códigos de error comunes:

- 400 Bad Request - Petición mal formada
- 401 Unauthorized - No autenticado o token inválido
- 403 Forbidden - No autorizado para el recurso
- 404 Not Found - Recurso no encontrado
- 500 Internal Server Error - Error del servidor

## Endpoints

### Gestión de Productos

#### Listar Productos

**Endpoint:** `GET /productos`

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20)
- `search`: Término de búsqueda
- `categoria`: ID de categoría para filtrar
- `marca`: Filtro por marca
- `sort`: Campo para ordenar (default: 'nombre')
- `order`: Dirección de ordenamiento ('asc' o 'desc', default: 'asc')

**Response:**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": 1,
        "codigo": "AC-1234",
        "nombre": "Filtro de aceite",
        "descripcion": "Filtro de aceite para motor",
        "categoria": {
          "id": 3,
          "nombre": "Filtros"
        },
        "marca": "FiltroPro",
        "modelo": "Toyota Corolla 2015-2020",
        "precioCompra": 45.50,
        "precioVenta": 89.90,
        "stock": 23,
        "stockMinimo": 5,
        "ubicacion": "A-12-3",
        "imagen": "https://storage.refaccionaria.com/productos/AC-1234.jpg"
      },
      // ... más productos
    ],
    "pagination": {
      "total": 145,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

#### Obtener un Producto

**Endpoint:** `GET /productos/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "AC-1234",
    "nombre": "Filtro de aceite",
    "descripcion": "Filtro de aceite para motor",
    "categoriaId": 3,
    "categoria": {
      "id": 3,
      "nombre": "Filtros"
    },
    "marca": "FiltroPro",
    "modelo": "Toyota Corolla 2015-2020",
    "precioCompra": 45.50,
    "precioVenta": 89.90,
    "stock": 23,
    "stockMinimo": 5,
    "ubicacion": "A-12-3",
    "imagen": "https://storage.refaccionaria.com/productos/AC-1234.jpg",
    "codBarras": "7501234567890",
    "createdAt": "2025-01-15T14:30:00.000Z",
    "updatedAt": "2025-02-10T09:15:00.000Z"
  }
}
```

#### Crear un Producto

**Endpoint:** `POST /productos`

**Request:**
```json
{
  "codigo": "AC-1234",
  "nombre": "Filtro de aceite",
  "descripcion": "Filtro de aceite para motor",
  "categoriaId": 3,
  "marca": "FiltroPro",
  "modelo": "Toyota Corolla 2015-2020",
  "precioCompra": 45.50,
  "precioVenta": 89.90,
  "stock": 23,
  "stockMinimo": 5,
  "ubicacion": "A-12-3",
  "codBarras": "7501234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Producto creado correctamente",
  "data": {
    "id": 1,
    "codigo": "AC-1234",
    "nombre": "Filtro de aceite",
    "// resto de campos": "..."
  }
}
```

#### Actualizar un Producto

**Endpoint:** `PUT /productos/:id`

**Request:** (solo campos a actualizar)
```json
{
  "precioVenta": 94.50,
  "stock": 25,
  "ubicacion": "B-10-2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Producto actualizado correctamente",
  "data": {
    "id": 1,
    "codigo": "AC-1234",
    "// campos actualizados": "y resto"
  }
}
```

#### Eliminar un Producto

**Endpoint:** `DELETE /productos/:id`

**Response:**
```json
{
  "success": true,
  "message": "Producto eliminado correctamente"
}
```

#### Búsqueda Avanzada de Productos

**Endpoint:** `GET /productos/buscar`

**Query Parameters:**
- `q`: Término de búsqueda (nombre, código, descripción)
- `categoria`: ID o nombre de categoría
- `marca`: Marca del producto
- `modelo`: Modelo compatible
- `minPrecio`: Precio mínimo
- `maxPrecio`: Precio máximo
- `disponible`: true/false para filtrar solo productos con stock

**Response:** (similar a GET /productos)

#### Productos con Stock Bajo

**Endpoint:** `GET /productos/stock-bajo`

**Response:**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": 5,
        "codigo": "FR-5678",
        "nombre": "Pastillas de freno",
        "stock": 2,
        "stockMinimo": 5,
        "diferencia": -3,
        "precioCompra": 250.00,
        "ultimaVenta": "2025-03-10T15:20:00.000Z",
        "rotacion": "alta"
      },
      // ... más productos
    ]
  }
}
```

### Gestión de Ventas

#### Listar Ventas

**Endpoint:** `GET /ventas`

**Query Parameters:**
- `page`: Número de página
- `limit`: Elementos por página
- `fechaInicio`: Filtro por fecha inicial
- `fechaFin`: Filtro por fecha final
- `clienteId`: Filtro por cliente

**Response:**
```json
{
  "success": true,
  "data": {
    "ventas": [
      {
        "id": 1,
        "fecha": "2025-03-15T10:30:00.000Z",
        "cliente": {
          "id": 12,
          "nombre": "Juan Pérez"
        },
        "total": 560.80,
        "estado": "completada",
        "tipoPago": "efectivo",
        "usuario": {
          "id": 3,
          "nombre": "María Vendedora"
        }
      },
      // ... más ventas
    ],
    "pagination": {
      "total": 230,
      "page": 1,
      "limit": 20,
      "pages": 12
    }
  }
}
```

#### Obtener Detalles de una Venta

**Endpoint:** `GET /ventas/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fecha": "2025-03-15T10:30:00.000Z",
    "cliente": {
      "id": 12,
      "nombre": "Juan Pérez",
      "telefono": "5551234567"
    },
    "total": 560.80,
    "subtotal": 483.45,
    "impuestos": 77.35,
    "estado": "completada",
    "tipoPago": "efectivo",
    "usuario": {
      "id": 3,
      "nombre": "María Vendedora"
    },
    "detalles": [
      {
        "id": 1,
        "productoId": 25,
        "producto": {
          "codigo": "BJ-2345",
          "nombre": "Bujía de platino"
        },
        "cantidad": 4,
        "precioUnitario": 85.75,
        "subtotal": 343.00
      },
      {
        "id": 2,
        "productoId": 40,
        "producto": {
          "codigo": "AC-1234",
          "nombre": "Filtro de aceite"
        },
        "cantidad": 1,
        "precioUnitario": 89.90,
        "subtotal": 89.90
      },
      // ... más detalles
    ]
  }
}
```

#### Registrar Nueva Venta

**Endpoint:** `POST /ventas`

**Request:**
```json
{
  "clienteId": 12,
  "tipoPago": "efectivo",
  "productos": [
    {
      "productoId": 25,
      "cantidad": 4
    },
    {
      "productoId": 40,
      "cantidad": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Venta registrada correctamente",
  "data": {
    "id": 231,
    "fecha": "2025-03-15T14:25:30.000Z",
    "total": 560.80,
    "subtotal": 483.45,
    "impuestos": 77.35
  }
}
```

#### Cancelar Venta

**Endpoint:** `PUT /ventas/:id/cancelar`

**Response:**
```json
{
  "success": true,
  "message": "Venta cancelada correctamente"
}
```

### Gestión de Clientes

#### Listar Clientes

**Endpoint:** `GET /clientes`

**Query Parameters:**
- `page`: Número de página
- `limit`: Elementos por página
- `search`: Búsqueda por nombre o RFC

**Response:**
```json
{
  "success": true,
  "data": {
    "clientes": [
      {
        "id": 12,
        "nombre": "Juan Pérez",
        "rfc": "PEJN850101ABC",
        "telefono": "5551234567",
        "email": "juan@example.com",
        "tipo": "regular"
      },
      // ... más clientes
    ],
    "pagination": {
      "total": 85,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

#### Crear, Actualizar y Eliminar Cliente

Similar a los endpoints de productos, siguiendo el patrón REST.

### Gestión de Proveedores

#### Listar Proveedores

**Endpoint:** `GET /proveedores`

**Response:**
```json
{
  "success": true,
  "data": {
    "proveedores": [
      {
        "id": 3,
        "nombre": "AutoPartes Nacionales S.A.",
        "contacto": "Roberto González",
        "telefono": "5551234567",
        "email": "ventas@autopartes.com",
        "categoria": {
          "id": 2,
          "nombre": "Eléctrico"
        }
      },
      // ... más proveedores
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  }
}
```

#### Productos por Proveedor

**Endpoint:** `GET /proveedores/:id/productos`

**Response:**
```json
{
  "success": true,
  "data": {
    "proveedor": {
      "id": 3,
      "nombre": "AutoPartes Nacionales S.A."
    },
    "productos": [
      {
        "id": 25,
        "codigo": "BJ-2345",
        "nombre": "Bujía de platino",
        "precioProveedor": 42.50,
        "precioActual": 45.50,
        "codigoProveedor": "BUJ-PL-01",
        "tiempoEntrega": 2
      },
      // ... más productos
    ]
  }
}
```

#### Comparar Precios de Proveedores

**Endpoint:** `GET /productos/:id/proveedores`

**Response:**
```json
{
  "success": true,
  "data": {
    "producto": {
      "id": 25,
      "codigo": "BJ-2345",
      "nombre": "Bujía de platino"
    },
    "proveedores": [
      {
        "id": 3,
        "nombre": "AutoPartes Nacionales S.A.",
        "precio": 42.50,
        "tiempoEntrega": 2,
        "ultimaActualizacion": "2025-02-15T10:30:00.000Z"
      },
      {
        "id": 5,
        "nombre": "Refacciones Express",
        "precio": 44.75,
        "tiempoEntrega": 1,
        "ultimaActualizacion": "2025-03-01T14:15:00.000Z"
      }
    ]
  }
}
```

### Análisis y Reportes

#### Dashboard Datos

**Endpoint:** `GET /analisis/dashboard`

**Query Parameters:**
- `periodo`: 'dia', 'semana', 'mes', 'anio' (default: 'dia')

**Response:**
```json
{
  "success": true,
  "data": {
    "ventas": {
      "hoy": 12580.50,
      "ayer": 9850.75,
      "variacion": 27.71,
      "grafico": [
        {"hora": "08:00", "valor": 1250.50},
        {"hora": "09:00", "valor": 1890.25},
        // ... más puntos
      ]
    },
    "productos": {
      "totalActivos": 1250,
      "stockBajo": 23,
      "sinStock": 5,
      "masVendidos": [
        {"id": 25, "nombre": "Bujía de platino", "cantidad": 145},
        {"id": 40, "nombre": "Filtro de aceite", "cantidad": 98},
        // ... más productos
      ]
    }
  }
}
```

#### Predicción de Demanda

**Endpoint:** `GET /analisis/prediccion-demanda`

**Query Parameters:**
- `categoriaId`: opcional, filtra por categoría
- `dias`: días a predecir (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "predicciones": [
      {
        "id": 25,
        "codigo": "BJ-2345",
        "nombre": "Bujía de platino",
        "stockActual": 45,
        "demandaEstimada": 68,
        "recomendacionCompra": 30,
        "confianza": 0.85
      },
      // ... más productos
    ]
  }
}
```

#### Reporte de Ventas

**Endpoint:** `GET /reportes/ventas`

**Query Parameters:**
- `fechaInicio`: fecha inicial (requerido)
- `fechaFin`: fecha final (requerido)
- `agruparPor`: 'dia', 'semana', 'mes' (default: 'dia')
- `formato`: 'json', 'csv', 'pdf' (default: 'json')

**Response (formato JSON):**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "inicio": "2025-03-01T00:00:00.000Z",
      "fin": "2025-03-15T23:59:59.999Z"
    },
    "totales": {
      "ventas": 145,
      "ingresos": 125890.75,
      "promedioDiario": 8392.72
    },
    "desglose": [
      {
        "fecha": "2025-03-01",
        "ventas": 12,
        "ingresos": 9850.50
      },
      // ... más días
    ],
    "topProductos": [
      {
        "id": 25,
        "nombre": "Bujía de platino",
        "cantidad": 145,
        "ingresos": 12437.50
      },
      // ... más productos
    ]
  }
}
```

## Notas Importantes

1. **Versionado**: La API sigue el formato `/v1` para permitir cambios futuros sin romper compatibilidad.
2. **Rate Limiting**: Se aplican límites de 100 peticiones por minuto por token.
3. **CORS**: La API permite peticiones cross-origin desde dominios autorizados.
4. **Caché**: Las respuestas incluyen encabezados de caché apropiados.
5. **Compresión**: La API soporta compresión gzip para reducir el tamaño de las respuestas.

## Seguridad

1. **Autenticación**: JWT con expiración de 12 horas
2. **Autorización**: Basada en roles (admin, vendedor, almacén, etc.)
3. **Validación**: Todos los inputs son validados para prevenir inyecciones
4. **Encriptación**: HTTPS obligatorio en producción
5. **Auditoría**: Se registran accesos y cambios sensibles
