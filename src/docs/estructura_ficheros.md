# Estructura de Ficheros del Sistema de Gestión para Refaccionaria

## Patrón de Arquitectura

El proyecto sigue una arquitectura de capas con separación clara de responsabilidades, implementando algunos conceptos del patrón MVC (Modelo-Vista-Controlador) y organizando el código en un monolito modular que facilitará su mantenimiento y posible evolución futura a microservicios si fuera necesario.

## Estructura General

```
refaccionaria-sistema/
│
├── src/                           # Código fuente del proyecto
│   ├── frontend/                  # Aplicación cliente React
│   │   ├── public/                # Archivos estáticos
│   │   ├── src/                   # Código fuente React
│   │   │   ├── components/        # Componentes reutilizables
│   │   │   ├── pages/             # Páginas principales
│   │   │   ├── services/          # Servicios de comunicación con API
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── context/           # Context API para estado global
│   │   │   ├── utils/             # Utilidades y helpers
│   │   │   ├── assets/            # Imágenes, iconos, etc.
│   │   │   ├── App.js             # Componente principal
│   │   │   └── index.js           # Punto de entrada
│   │   │
│   │   └── package.json           # Dependencias del frontend
│   │
│   ├── backend/                   # Servidor Express.js
│   │   ├── config/                # Configuración de la aplicación
│   │   │   ├── database.js        # Configuración de la base de datos
│   │   │   └── app.js             # Configuración de Express
│   │   │
│   │   ├── controllers/           # Controladores para manejar las peticiones
│   │   │   ├── producto.controller.js
│   │   │   ├── venta.controller.js
│   │   │   └── ...
│   │   │
│   │   ├── models/                # Modelos de datos (Sequelize)
│   │   │   ├── index.js           # Exportación y relaciones
│   │   │   ├── producto.model.js
│   │   │   └── ...
│   │   │
│   │   ├── routes/                # Rutas de la API
│   │   │   ├── index.js           # Router principal
│   │   │   ├── producto.routes.js
│   │   │   └── ...
│   │   │
│   │   ├── middleware/            # Middlewares de Express
│   │   │   ├── auth.middleware.js # Autenticación JWT
│   │   │   └── error.middleware.js  # Manejo de errores
│   │   │
│   │   ├── services/              # Servicios de negocio
│   │   │   ├── analisis.service.js  # Servicios de análisis y predicción
│   │   │   └── ...
│   │   │
│   │   ├── utils/                 # Utilidades
│   │   │   ├── logger.js          # Log de eventos
│   │   │   └── validators.js      # Validación de datos
│   │   │
│   │   └── server.js              # Punto de entrada del backend
│   │
│   └── database/                  # Scripts relacionados con la base de datos
│       ├── migrations/            # Migraciones de Sequelize
│       ├── seeders/               # Datos iniciales
│       └── schema.sql             # Esquema SQL para referencia
│
├── tests/                         # Tests unitarios e integración
│   ├── frontend/                  # Tests de React
│   └── backend/                   # Tests de API
│
├── docs/                          # Documentación del proyecto
│   ├── api/                       # Documentación de la API
│   ├── diagramas/                 # Diagramas UML, ER, etc.
│   └── manuales/                  # Manuales de usuario
│
├── scripts/                       # Scripts de utilidad
│   ├── backup.js                  # Script de respaldo de BD
│   └── setup.js                   # Script de configuración inicial
│
├── .env                           # Variables de entorno
├── .gitignore                     # Archivos ignorados por Git
├── package.json                   # Dependencias y scripts principales
└── README.md                      # Documentación general del proyecto
```

## Descripción de Directorios Clave

### src/frontend

Este directorio contiene toda la aplicación cliente desarrollada en React.js:

- **components/**: Componentes reutilizables de UI como formularios, tablas, modales, etc.
- **pages/**: Componentes de página para cada pantalla principal del sistema.
- **services/**: Lógica de comunicación con la API del backend.
- **context/**: Implementación de Context API para manejar estado global.
- **hooks/**: Custom hooks para lógica reutilizable.
- **utils/**: Funciones auxiliares, helpers, formateadores, etc.

### src/backend

Contiene la API y lógica de negocio implementada con Node.js y Express:

- **controllers/**: Implementan la lógica de las rutas HTTP.
- **models/**: Definiciones de modelos de Sequelize que representan las tablas de la BD.
- **routes/**: Definición de endpoints de la API REST.
- **middleware/**: Funciones de middleware para autenticación, logging, etc.
- **services/**: Lógica de negocio más compleja, incluidos los servicios de análisis predictivo.
- **utils/**: Utilidades del servidor.

### src/database

Scripts relacionados con la base de datos:

- **migrations/**: Scripts de migración para control de versiones de la BD.
- **seeders/**: Datos iniciales para testing y configuración básica.
- **schema.sql**: Definición del esquema en SQL puro para referencia.

## Patrones Implementados

1. **MVC**: Separación de responsabilidades entre Modelo (models), Vista (frontend) y Controlador (controllers).
2. **Repository Pattern**: En los servicios para abstraer el acceso a datos.
3. **Middleware Pattern**: En Express para funcionalidad transversal como autenticación.
4. **Service Layer**: Para encapsular la lógica de negocio compleja.
5. **Context API**: Para manejo de estado global en React.

## Consideraciones de Escalabilidad

Aunque el sistema comienza como un monolito con una base de datos única, la estructura de carpetas y la separación de responsabilidades permitirían una futura migración a microservicios si el negocio crece significativamente. Los servicios están diseñados con límites claros que facilitan esta transición.
