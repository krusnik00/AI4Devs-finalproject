# Seguridad del Sistema de Gestión para Refaccionaria

## Enfoque de Seguridad

El sistema implementa un enfoque de seguridad en múltiples capas, balanceando la protección de datos sensibles con la usabilidad para un negocio pequeño. Las prácticas de seguridad se han priorizado según su impacto y facilidad de implementación, enfocándose en las amenazas más probables para este tipo de sistema.

## Autenticación y Autorización

### Sistema de Autenticación
- **JWT (JSON Web Tokens)**: Implementación segura con:
  - Tiempo de expiración configurado (8 horas por defecto)
  - Firma con algoritmo HS256
  - Payload mínimo necesario

```javascript
// Ejemplo de generación de token
const jwt = require('jsonwebtoken');
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol
    }, 
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};
```

### Control de Acceso
- **RBAC (Control de Acceso Basado en Roles)**: Tres roles principales:
  - Admin: Acceso completo al sistema
  - Vendedor: Acceso a ventas e inventario (lectura)
  - Almacén: Gestión de inventario y compras

```javascript
// Middleware de verificación de rol
const verificarRol = (roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    next();
  };
};

// Uso en rutas
router.post('/productos', authenticate, verificarRol(['admin', 'almacen']), productoController.createProducto);
```

### Gestión de Sesiones
- Almacenamiento seguro de tokens en localStorage (frontend)
- Invalidación de sesión en cambio de contraseña
- Cierre de sesión automático por inactividad (15 minutos)

## Protección de Datos

### Cifrado de Datos Sensibles
- **Contraseñas**: Hash con bcrypt (factor de costo 10)
- **Variables de entorno**: Uso de dotenv para credenciales
- **Datos personales**: Cifrado en tránsito via HTTPS

```javascript
// Ejemplo de hash de contraseña
const bcrypt = require('bcryptjs');
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
```

### Validación de Datos
- **Entrada de usuario**: Validación en frontend y backend
- **Sanitización**: Prevención de XSS y SQL Injection
- **Tipos de datos**: Validación estricta con Joi/Yup

```javascript
// Ejemplo de validación con Joi
const Joi = require('joi');

const productoSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  descripcion: Joi.string().allow('', null),
  precio: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required()
});

// En el controlador
exports.createProducto = async (req, res) => {
  // Validar datos
  const { error } = productoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  // Procesar si es válido
  // ...
};
```

## Seguridad en API y Comunicaciones

### Headers de Seguridad
Configuración en NGINX:
```nginx
# Headers de seguridad
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'" always;
```

### Limitación de Tasa (Rate Limiting)
Implementación para prevenir abusos:
```javascript
const rateLimit = require('express-rate-limit');

// Límite para endpoints de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos
  message: 'Demasiados intentos, por favor intente más tarde'
});

app.use('/api/auth/login', authLimiter);
```

### CORS Configurado
```javascript
const cors = require('cors');

// En producción, restringir a origen específico
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
```

## Registro y Auditoría

### Sistema de Logs
- **Winston**: Configurado para registrar eventos importantes
- **Niveles**: Error, Warn, Info, Debug
- **Rotación**: Logs diarios con compresión

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.Console()
  ]
});
```

### Auditoría de Acciones
Sistema sencillo para registrar operaciones críticas:
- Creación, modificación y eliminación de productos
- Ventas y compras
- Cambios en precios
- Accesos al sistema

## Actualizaciones y Mantenimiento

### Dependencias Seguras
- Análisis regular con npm audit
- Actualización planificada de dependencias
- Evitar dependencias con vulnerabilidades conocidas

### Parches de Seguridad
- Proceso documentado para aplicación de parches
- Verificación después de actualizaciones
- Respaldos previos a cambios importantes

## Consideraciones Adicionales

### Seguridad Física
- Recomendaciones para protección de terminales
- Pantallas con tiempo de bloqueo automático
- Políticas de acceso físico al servidor (si aplica)

### Capacitación
- Guía de mejores prácticas para usuarios
- Sensibilización sobre phishing y ataques sociales
- Procedimientos para reportar incidentes
