# Prompts para el Sistema de Gestión de Refaccionaria Automotriz

Este documento contiene los prompts principales utilizados durante la creación del proyecto del Sistema de Gestión para Refaccionaria Automotriz, mostrando cómo se utilizaron los asistentes de código en las diferentes fases del ciclo de desarrollo.

## 1. Descripción general del producto

**Prompt 1: Definición inicial del sistema**
```
Actúa como un arquitecto de software y product owner. Estoy desarrollando un sistema de gestión para una refaccionaria automotriz pequeña. Necesito que me ayudes a planificar la arquitectura y el diseño del sistema.

El sistema debe permitir:
1. Gestión de inventario de refacciones automotrices
2. Procesamiento de ventas
3. Administración de compras y proveedores
4. Análisis básico de datos para predicción de demanda y comparativa de proveedores
5. Un dashboard de KPIs principales

Quiero una solución pragmática y adecuada para un negocio pequeño, no necesito sistemas demasiado complejos pero sí robustos y eficientes.

¿Qué tecnologías recomiendas usar? ¿Cómo estructurarías la arquitectura? ¿Qué módulos incluirías? Dame una propuesta inicial.
```

**Prompt 2: Integración de IA**
```
Para el sistema de gestión de refaccionaria que estamos diseñando, me gustaría explorar posibilidades de integrar inteligencia artificial de manera simple y económica. No busco soluciones complejas de machine learning que requieran grandes recursos, sino funcionalidades prácticas que aporten valor inmediato.

¿Qué funcionalidades de IA básica podrían implementarse para:
1. Predecir demanda de productos basada en histórico de ventas
2. Comparar proveedores y optimizar decisiones de compra
3. Mejorar la experiencia del usuario en búsqueda y recomendación de productos

Necesito soluciones que puedan implementarse directamente en el stack MERN sin depender de servicios externos costosos.
```

**Prompt 3: Creación del PRD (Product Requirements Document)**
```
Crea un Product Requirements Document (PRD) detallado para el sistema de gestión de refaccionaria automotriz. Incluye:

1. Resumen ejecutivo
2. Objetivos del producto
3. Usuarios objetivo y sus necesidades
4. Funcionalidades del producto, divididas por módulos:
   - Inventario
   - Ventas
   - Compras
   - Análisis
   - Administración
5. Métricas de éxito
6. Restricciones y asunciones
7. Roadmap de alto nivel

Mantén el enfoque en un negocio pequeño con necesidades prácticas, evitando características excesivamente complejas.
```

## 2. Arquitectura del Sistema

**Prompt 1: Diseño del diagrama de arquitectura**
```
Por favor, crea un diagrama de arquitectura para el sistema de gestión de refaccionaria automotriz usando texto en formato markdown. El diagrama debe mostrar los componentes principales:

1. Frontend (con React)
2. Backend (con Node.js/Express)
3. Base de datos (MySQL)
4. Servicios de análisis predictivo
5. Integración con impresoras para tickets
6. Almacenamiento de imágenes de productos

Muestra las relaciones entre estos componentes y explica brevemente el flujo de datos.
```

**Prompt 2: Descripción de componentes principales**
```
Para el sistema de gestión de refaccionaria automotriz que estamos diseñando, necesito una descripción detallada de todos los componentes principales. Por favor, organízalo por Frontend, Backend y Base de Datos. Para cada módulo, describe sus funciones principales y cómo se integran entre sí. También necesito detalles sobre los componentes simplificados de IA que mencionamos: el predictor de demanda y el comparador de precios de proveedores.
```

**Prompt 3: Estructura del proyecto y configuración**
```
Ayúdame a establecer la estructura de archivos y configuración inicial para el proyecto de refaccionaria automotriz. Necesito:

1. Estructura de carpetas para un proyecto Node.js/Express con React
2. Archivo package.json con las dependencias principales
3. Configuración básica del servidor Express
4. Configuración de conexión a MySQL con Sequelize
5. Estructura inicial del frontend React
6. Archivo .env con variables de entorno necesarias (ejemplo)

Explica brevemente cada parte para que entienda la estructura general del proyecto.
```

## 3. Modelo de Datos

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
"Necesito crear un diagrama de arquitectura para un sistema de gestión de inventario para una refaccionaria automotriz pequeña. El sistema debe ser monolítico y simple, utilizando React para el frontend, Node.js con Express para el backend, y MySQL para la base de datos. También quiero incluir componentes básicos de IA para predicción de ventas y análisis de proveedores. ¿Puedes crear un diagrama de arquitectura que muestre claramente las capas y componentes principales?"

**Respuesta 1:**
El diagrama de arquitectura se ha creado como un diagrama de Mermaid mostrando la estructura de tres capas del sistema:

1. **Frontend (React.js)**:
   - Interfaz de Usuario
   - Sistema de Rutas
   - Context API / Redux para gestión de estado
   - Autenticación del lado del cliente
   - Componentes reutilizables

2. **Backend (Node.js/Express)**:
   - Rutas API
   - Middlewares (autenticación, validación)
   - Controladores
   - Servicios
   - Componentes IA Simplificados:
     * Predicción de Demanda
     * Análisis de Proveedores

3. **Base de Datos (MySQL)**:
   - Tablas principales: Productos, Ventas, Compras, Usuarios, Proveedores, Clientes

El diagrama muestra claramente el flujo de datos entre las capas y cómo los módulos de IA se integran con los servicios

[Ver diagrama completo en /src/docs/diagrama_arquitectura.md]

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
"Para el sistema de gestión de refaccionaria automotriz que estamos diseñando, necesito una descripción detallada de todos los componentes principales. Por favor, organízalo por Frontend, Backend y Base de Datos. Para cada módulo, describe sus funciones principales y cómo se integran entre sí. También necesito detalles sobre los componentes simplificados de IA que mencionamos: el predictor de demanda y el comparador de precios de proveedores."

**Respuesta 1:**
Se ha creado un documento detallado con todos los componentes principales del sistema, organizados en las siguientes secciones:

1. **Módulos Frontend**:
   - Componentes de interfaz (Dashboard, Inventario, Ventas, Compras, etc.)
   - Servicios Frontend (Auth, API, Notificaciones)

2. **Módulos Backend**:
   - API RESTful con endpoints CRUD y autenticación JWT
   - Controladores para cada entidad principal
   - Servicios de negocio que implementan la lógica principal
   - Componentes IA Simplificados:
     * PrediccionDemandaService: Usa algoritmos de series temporales simples
     * AnalisisProveedorService: Implementa comparación de precios

3. **Base de Datos**:
   - Modelos principales (Producto, Venta, Compra, etc.)
   - Relaciones entre entidades

4. **Integraciones Externas**:
   - Básicas incluidas en el MVP
   - Futuras integraciones

[Ver descripción completa en /src/docs/componentes_principales.md]

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
"Necesito diseñar una estructura de carpetas y archivos óptima para el sistema de gestión de refaccionaria automotriz. Este debe ser un sistema monolítico con frontend en React y backend en Node.js/Express, usando MySQL como base de datos. Me gustaría que la estructura permita un mantenimiento fácil y una posible evolución futura. ¿Podrías proporcionarme una estructura de ficheros detallada y explicar qué patrones arquitectónicos se están aplicando?"

**Respuesta 1:**
Se ha diseñado una estructura de ficheros completa que sigue principios de arquitectura limpia y organización modular:

1. **Estructura General**:
   - `/src`: Código fuente principal dividido en frontend, backend y database
   - `/tests`: Tests unitarios e integración
   - `/docs`: Documentación del proyecto
   - `/scripts`: Scripts de utilidad

2. **Frontend (React.js)**:
   - Components, pages, services, hooks, context, utils
   - Organización basada en características y responsabilidades

3. **Backend (Node.js/Express)**:
   - Controllers, models, routes, middleware, services
   - Separación clara de responsabilidades siguiendo MVC

4. **Patrones Implementados**:
   - MVC para separación de responsabilidades
   - Repository Pattern para acceso a datos
   - Service Layer para lógica de negocio
   - Middleware Pattern para funcionalidad transversal

La estructura está diseñada para ser un monolito modular que podría evolucionar a microservicios en el futuro si fuera necesario.

[Ver estructura completa en /src/docs/estructura_ficheros.md]

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
"Para el sistema de gestión de refaccionaria que estamos desarrollando, necesito una propuesta de infraestructura y despliegue que sea económica y adecuada para un negocio pequeño. La solución debe incluir un diagrama de la infraestructura, el proceso de despliegue recomendado, estrategia de respaldos, y consideraciones de seguridad. Recuerda que el presupuesto es limitado, así que prefiero soluciones rentables que puedan crecer con el negocio."

**Respuesta 1:**
Se ha diseñado una estrategia de infraestructura y despliegue económica y escalable para el sistema de refaccionaria:

1. **Infraestructura Propuesta**:
   - Un único servidor VPS económico (ej. DigitalOcean $20/mes)
   - NGINX como proxy inverso
   - Node.js para el backend con PM2 como gestor de procesos
   - Base de datos MySQL en el mismo servidor (inicialmente)
   - Almacenamiento S3 económico para imágenes y respaldos

2. **Entornos**:
   - Desarrollo: Entorno local con Docker para servicios
   - Pruebas/QA: Servidor compartido de bajo costo
   - Producción: VPS con recursos mínimos pero suficientes

3. **Despliegue**:
   - Proceso manual documentado paso a paso
   - Script de automatización básico incluido
   - Gestión de procesos con PM2 para garantizar disponibilidad

4. **Seguridad y Respaldos**:
   - HTTPS con certificados gratuitos Let's Encrypt
   - Firewall UFW configurado
   - Respaldos diarios automatizados con retención de 30 días

La solución está dimensionada para soportar una refaccionaria pequeña con hasta 50 usuarios concurrentes y 100,000 productos, con posibilidad de escalar gradualmente.

[Ver documentación completa en /src/docs/infraestructura.md]

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**
"Para nuestro sistema de gestión de refaccionaria automotriz necesito implementar medidas de seguridad adecuadas. Considerando que es un negocio pequeño con recursos limitados, ¿qué prácticas de seguridad deberíamos priorizar para proteger los datos de inventario, clientes y ventas? Necesito ejemplos concretos de código para autenticación, autorización, validación de datos, y otras medidas relevantes. También me gustaría saber cómo manejar los registros (logs) para auditoría."

**Respuesta 1:**
Se ha desarrollado un enfoque de seguridad en múltiples capas, priorizado para un negocio pequeño:

1. **Autenticación y Autorización**:
   - Implementación de JWT con tiempo de expiración configurado
   - Sistema RBAC con tres roles: Admin, Vendedor y Almacén
   - Gestión segura de sesiones con invalidación automática

2. **Protección de Datos**:
   - Cifrado de contraseñas con bcrypt (factor 10)
   - Almacenamiento seguro de credenciales en variables de entorno
   - Validación y sanitización de entradas con Joi/Yup

3. **Seguridad en API**:
   - Headers de seguridad configurados en NGINX
   - Rate limiting para prevenir abusos
   - Configuración adecuada de CORS

4. **Monitorización y Auditoría**:
   - Sistema de logs con Winston
   - Registro de acciones críticas
   - Rotación de logs

Se incluyen ejemplos concretos de código para cada aspecto de seguridad, permitiendo una implementación directa de las mejores prácticas.

[Ver documentación completa en /src/docs/seguridad.md]

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**
"Para nuestro sistema de gestión de refaccionaria automotriz, necesito implementar una estrategia de testing adecuada pero pragmática, considerando que es un proyecto para un negocio pequeño con recursos limitados. ¿Qué tipos de pruebas deberíamos priorizar? Necesito ver ejemplos concretos de código para tests unitarios, de integración y de UI, enfocados en las funcionalidades críticas como inventario, ventas y el algoritmo de predicción de demanda."

**Respuesta 1:**
Se ha desarrollado una estrategia de pruebas balanceada que prioriza la eficiencia y cobertura de áreas críticas:

1. **Pruebas Unitarias**:
   - Frontend: Jest + React Testing Library (70% cobertura de componentes críticos)
   - Backend: Jest para servicios y controladores (80% cobertura)
   - Ejemplos concretos para componentes de UI y servicios de análisis

2. **Pruebas de Integración**:
   - Enfoque en flujos completos de API usando Supertest
   - Verificación de interacciones entre componentes
   - Prueba completa del proceso de venta y actualización de inventario

3. **Pruebas de UI (E2E)**:
   - Cypress para flujos críticos de usuario
   - Escenarios completos como realizar una venta
   - Verificación de comportamiento de interfaz

4. **Pruebas de Rendimiento y Seguridad**:
   - JMeter para pruebas básicas de carga
   - OWASP ZAP para detección de vulnerabilidades comunes

La estrategia incluye configuración de CI/CD con GitHub Actions y reportes de cobertura, con ejemplos específicos para las funcionalidades más críticas del negocio.

[Ver documentación completa en /src/docs/tests.md]

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1: Diseño del modelo de datos**
```
Diseña el modelo de datos para el sistema de refaccionaria automotriz. Necesito:

1. Un diagrama entidad-relación (en formato texto markdown) que muestre las tablas principales y sus relaciones
2. Descripción detallada de cada entidad con sus atributos, tipos de datos y restricciones
3. Explicación de las relaciones entre entidades

Las entidades principales a considerar son:
- Productos (refacciones)
- Categorías
- Ventas
- Detalles de Venta
- Clientes
- Proveedores
- Compras
- Usuarios del sistema

Asegúrate que el modelo soporte todas las funcionalidades descritas en el PRD y las historias de usuario.
```

**Prompt 2: Implementación del modelo con Sequelize**
```
Implementa el modelo de datos para los productos (refacciones) en nuestro sistema, utilizando Sequelize como ORM. El modelo debe:

1. Incluir todos los campos necesarios según el diagrama ER
2. Implementar validaciones apropiadas
3. Establecer relaciones con otras entidades (categorías, etc.)
4. Incluir métodos útiles como cálculo de margen de ganancia
5. Implementar soft delete para evitar eliminaciones accidentales
6. Configurar hooks para actualizaciones automáticas

Además, crea el controlador REST para este modelo con los métodos CRUD y búsqueda avanzada.
```

**Prompt 3: Documentación del esquema de base de datos**
```
Genera una documentación completa del esquema de base de datos para nuestro sistema de refaccionaria automotriz. Necesito:

1. Una introducción al diseño de la base de datos
2. Un diagrama ASCII que represente las tablas y sus relaciones
3. Descripción detallada de cada tabla con todos sus campos, tipos y restricciones
4. Explicación de las relaciones y sus tipos (uno a muchos, muchos a muchos)
5. Índices implementados para optimización
6. Estrategias de validación y restricciones de integridad
7. Consideraciones de implementación como charset, collation, etc.

El formato debe ser markdown y debe ser claro incluso para personas con conocimiento básico de bases de datos.
```

## 4. Especificación de la API

**Prompt 1: Diseño de la API REST**
```
Crea una especificación detallada de la API REST para el sistema de refaccionaria automotriz. La API será consumida por el frontend React y posiblemente por aplicaciones externas en el futuro.

Incluye:
1. Convenciones de la API (formato, autenticación, manejo de errores)
2. Endpoints para cada módulo principal (inventario, ventas, compras, análisis)
3. Métodos, parámetros y respuestas para cada endpoint
4. Ejemplos de peticiones y respuestas en formato JSON
5. Códigos de estado HTTP utilizados y su significado

Usa un formato claro y estructurado, similar a una documentación OpenAPI/Swagger.
```

**Prompt 2: Implementación de controladores**
```
Implementa el controlador y las rutas para el módulo de productos en nuestro sistema. Necesito:

1. El controlador completo con todos los métodos CRUD
2. Implementación de búsqueda avanzada con filtros múltiples
3. Validación de datos entrantes
4. Manejo de errores apropiado
5. Documentación de los endpoints

Usa Express.js y Sequelize, siguiendo nuestros estándares de arquitectura y las mejores prácticas.
```

**Prompt 3: Implementación de seguridad en la API**
```
Ayúdame a implementar las medidas de seguridad básicas para la API REST de nuestro sistema. Necesito:

1. Implementar autenticación JWT
2. Middleware para verificación de token
3. Manejo de roles y permisos
4. Protección contra ataques comunes (XSS, CSRF, SQL Injection)
5. Rate limiting para prevenir abuso
6. Logging de acciones sensibles para auditoría

Proporciona código de ejemplo para cada punto y recomendaciones de mejores prácticas.
```

## 5. Historias de Usuario

**Prompt 1: Creación de épicas**
```
Basándote en el PRD que hemos desarrollado, crea épicas para el sistema de refaccionaria automotriz.

Para las épicas, incluye:
- Descripción general de alto nivel
- Objetivos de negocio que satisface
- Criterios de éxito
- Dependencias principales

Organiza las épicas por los módulos principales del sistema:
- Gestión de Inventario
- Procesamiento de Ventas
- Gestión de Compras y Proveedores
- Análisis Predictivo y Business Intelligence
- Administración del Sistema
```

**Prompt 2: Desarrollo de historias de usuario**
```
Basándote en las épicas que hemos definido, crea historias de usuario detalladas para el sistema de refaccionaria automotriz.

Para las historias de usuario, incluye:
- Narrativa en formato "Como [rol] quiero [acción] para [beneficio]"
- Criterios de aceptación claros y verificables
- Nivel de prioridad
- Definición de terminado

Organiza las historias por módulos (Inventario, Ventas, Compras, Análisis) y asegúrate que cubran las funcionalidades del MVP.
```

**Prompt 3: Priorización de historias para el MVP**
```
Necesitamos priorizar las historias de usuario para incluir en el MVP del sistema de refaccionaria. Para cada historia de usuario que hemos definido, evalúa:

1. Valor para el negocio (alto/medio/bajo)
2. Complejidad de implementación (alta/media/baja)
3. Dependencias con otras historias
4. Riesgo asociado

Con base en estos criterios, clasifica las historias en:
- Prioridad 1: Imprescindible para el MVP
- Prioridad 2: Alta prioridad, pero podría posponerse
- Prioridad 3: Para versiones posteriores al MVP

Explica brevemente tu razonamiento para las clasificaciones más importantes.
```

## 6. Tickets de Trabajo

**Prompt 1: Creación de tickets de trabajo**
```
Basándote en las historias de usuario que hemos definido para el módulo de inventario, crea tickets de trabajo detallados que puedan ser asignados directamente a desarrolladores.

Para cada ticket, incluye:
- ID y título descriptivo
- Historia de usuario relacionada
- Tipo (backend, frontend, full stack)
- Prioridad
- Estimación (en puntos de historia o días)
- Descripción detallada
- Tareas específicas paso a paso
- Criterios de aceptación
- Definición de terminado

Crea tickets para al menos las siguientes historias:
- Registro de Productos
- Búsqueda Avanzada de Productos
- Ajuste de Inventario
- Alertas de Stock Bajo
```

**Prompt 2: Estimación y planificación de sprints**
```
Con base en los tickets de trabajo que hemos creado para el sistema de refaccionaria, ayúdame a planificar los sprints iniciales.

Asumiendo:
- Equipo de 3 desarrolladores (2 full-stack, 1 frontend)
- Sprints de 2 semanas
- Capacidad de 20 puntos de historia por desarrollador por sprint

Proporciona:
1. División de tickets en los primeros 3 sprints
2. Dependencias entre tickets que afecten la planificación
3. Entregables esperados al final de cada sprint
4. Riesgos potenciales y planes de mitigación
```

**Prompt 3: Criterios de aceptación detallados**
```
Para el ticket "Implementar componente de búsqueda avanzada de productos", necesito definir criterios de aceptación detallados y técnicos que guíen al desarrollador y permitan verificar que la implementación es correcta.

Incluye criterios específicos sobre:
- Rendimiento (tiempo máximo de respuesta)
- Experiencia de usuario (autocompletado, filtros, etc.)
- Compatibilidad con dispositivos
- Gestión de estados de carga y error
- Validaciones
- Accesibilidad
- Pruebas requeridas

Sé específico y cuantitativo cuando sea posible para que los criterios sean objetivamente verificables.
```

## 7. Pull Requests

**Prompt 1: Creación de guía de Pull Requests**
```
Crea una guía completa para Pull Requests en nuestro proyecto de sistema de gestión para refaccionaria automotriz. La guía debe incluir:

1. Propósito y beneficios de los Pull Requests
2. Convenciones de nombrado para ramas
3. Formato estándar para títulos y descripciones de PR
4. Lista de verificación para revisores
5. Proceso de revisión de código
6. Ejemplos de comentarios efectivos
7. Política de merge (requisitos, estrategia)
8. Ejemplos concretos de buenos PRs para diferentes tipos de cambios

El documento debe ser claro y servir como referencia para todo el equipo.
```

**Prompt 2: Ejemplo de Pull Request para nueva funcionalidad**
```
Crea un ejemplo detallado de un Pull Request para implementar la funcionalidad de "Búsqueda Avanzada de Productos" en nuestro sistema de refaccionaria.

El ejemplo debe incluir:
1. Título siguiendo nuestras convenciones
2. Descripción completa con contexto, cambios realizados y justificaciones
3. Referencias a los tickets o historias de usuario relacionados
4. Capturas de pantalla o diagramas explicativos
5. Instrucciones de prueba detalladas
6. Comentarios de revisión de código simulados
7. Respuestas a esos comentarios

El ejemplo debe ser realista y servir como modelo para futuros PRs en el proyecto.
```

**Prompt 3: Ejemplo de Pull Request para corrección de errores**
```
Crea un ejemplo detallado de un Pull Request para corregir un error crítico en el módulo de ventas de nuestro sistema de refaccionaria.

El escenario es: "Error en el cálculo de totales cuando se aplican descuentos a productos con impuestos especiales".

Siguiendo nuestras convenciones, incluye:
1. Título apropiado para un bugfix
2. Descripción que explique claramente el problema, causa raíz y solución
3. Cambios de código antes/después
4. Pruebas realizadas para verificar la corrección
5. Impacto potencial en otras áreas del sistema
6. Plan de despliegue recomendado

Este ejemplo servirá como referencia para documentar adecuadamente las correcciones de errores.
```

## 8. Tests Unitarios

**Prompt 1: Pruebas para módulos de backend**
```
Ayúdame a desarrollar pruebas unitarias para el sistema de refaccionaria automotriz, enfocándome en los controladores del backend. Específicamente, necesito pruebas para los módulos de:

1. Productos (CRUD completo)
2. Devoluciones (proceso de crear, aprobar y rechazar devoluciones)
3. Autenticación (login, registro y validación de tokens)

Para cada módulo, quiero asegurarme de probar:
- Casos de éxito
- Manejo de errores y validaciones
- Interacción con otros componentes (usando mocks)

Utiliza Jest y asegúrate de que las pruebas sean lo suficientemente detalladas para ser útiles, pero sin ser innecesariamente complejas. Proporciona también ejemplos de cómo configurar los mocks para los modelos de Sequelize.
```

**Prompt 2: Pruebas para modelos**
```
Necesito implementar pruebas unitarias para los modelos Sequelize en nuestro sistema de refaccionaria automotriz, particularmente para:

1. Modelo de Producto: Validaciones, hooks, asociaciones y métodos virtuales
2. Modelo de Devolución: Estados, validaciones y cambios de estado
3. Modelo de Usuario: Encriptación de contraseña y validaciones

Quiero asegurarme que los tests:
- Verifiquen la correcta definición de campos
- Prueben todas las validaciones
- Confirmen que los hooks funcionan correctamente
- Verifiquen los métodos personalizados y campos virtuales

Proporciona ejemplos completos de código usando Jest y Sequelize-Mock o una alternativa apropiada. Incluye ejemplos de cómo manejar las asociaciones entre modelos en los tests.
```

**Prompt 3: Pruebas para el sistema de autorización**
```
Necesito desarrollar pruebas unitarias y de integración para el sistema de autorización de nuestro proyecto de refaccionaria automotriz. El sistema utiliza JWT para autenticación y un esquema de roles (admin, vendedor, almacén) para los permisos.

Específicamente quiero probar:
1. Middleware de autenticación (verificación de token)
2. Middleware de autorización basada en roles
3. Integración del sistema de permisos con los endpoints de devoluciones y productos

Las pruebas deben verificar:
- Acceso correcto para usuarios autenticados con roles adecuados
- Denegación de acceso para usuarios sin autenticación
- Denegación de acceso para usuarios con roles incorrectos
- Manejo de tokens inválidos o expirados
- Comportamiento de los endpoints protegidos

Utiliza Jest y Supertest para las pruebas de integración, proporcionando ejemplos concretos de configuración y mocks para JWT y el modelo de Usuario.
```

## 8. Tests Unitarios

**Prompt 1: Pruebas para controladores backend**
```
Necesito crear pruebas unitarias para los controladores de nuestro sistema de gestión de refaccionaria, especialmente para los módulos de productos y devoluciones. Quiero asegurarme que todas las operaciones CRUD y procesos de negocio funcionan correctamente. Proporciona ejemplos concretos de tests con Jest para:

1. Controlador de productos (crear, buscar, actualizar, eliminar)
2. Controlador de devoluciones (crear devolución, aprobar devolución)
3. Manejo adecuado de errores y casos extremos
4. Uso de mocks para servicios y modelos

Los tests deben ser exhaustivos y cubrir los aspectos más críticos de la lógica de negocio.
```

**Prompt 2: Pruebas para modelos con asociaciones**
```
Quiero implementar tests unitarios para los modelos de Sequelize en nuestro sistema, especialmente para el modelo de productos y devoluciones que tienen relaciones complejas con otras entidades. Necesito ejemplos de:

1. Pruebas para validadores y constraints del modelo
2. Pruebas para los métodos personalizados
3. Pruebas para asociaciones y eager loading
4. Verificación de hooks y triggers

Proporciona ejemplos completos de código usando Jest y Sequelize-Mock o una alternativa apropiada. Incluye ejemplos de cómo manejar las asociaciones entre modelos en los tests.
```

**Prompt 3: Pruebas para autorización por roles**
```
Necesito desarrollar pruebas unitarias y de integración para el sistema de autorización por roles en el módulo de devoluciones. El sistema permite que solo ciertos roles (administrador, supervisor) puedan aprobar devoluciones, mientras que vendedores solo pueden crearlas.

Quiero probar:
1. Middleware de verificación de roles
2. Funcionamiento del sistema de permisos en las rutas de devoluciones
3. Manejo correcto de intentos de acceso no autorizados

Proporciona ejemplos de tests con Jest que validen estos escenarios, incluyendo la configuración de los mocks necesarios para simular diferentes tipos de usuarios y roles.
```

## 9. Comandos de ejecución

**Prompt 1: Comandos para arrancar el sistema**
```
¿Cuál es el comando para arrancar el backend y cuál es para arrancar el frontend?
```

**Prompt 2: Error al arrancar el servidor**
```
PS C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend> npm start

> sistema-refaccionaria@1.0.0 start
> node src/backend/server.js       

C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\router\index.js:462
    throw new TypeError('Router.use() requires a middleware function')
```

**Prompt 3: Recordatorio sobre instrucciones**
```
recuerda que cada instruccion que te de, debes agregarla al archivo prompts
```

**Prompt 4: Clarificación sobre instrucciones**
```
solo las instrucciones que te doy, no las respuestas que me das
```

**Prompt 5: Error al ejecutar cliente.routes.js**
```
at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)      
    at Module.require (node:internal/modules/cjs/loader:1311:12)     
    at require (node:internal/modules/helpers:136:16)

Node.js v22.14.0
PS C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend>             npm run dev:full

> sistema-refaccionaria@1.0.0 dev:full
> concurrently "npm run dev" "npm run client"

(node:12348) [DEP0060] DeprecationWarning: The `util._extend` API is 
deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
[1] 
[1] > sistema-refaccionaria@1.0.0 client
[1] > cd src/frontend && npm start
[1]
[0]
[0] > sistema-refaccionaria@1.0.0 dev
[0] > nodemon src/backend/server.js
[0]
[0] [nodemon] 2.0.22
[0] [nodemon] to restart at any time, enter `rs`
[0] [nodemon] watching path(s): *.*
[0] [nodemon] watching extensions: js,mjs,json
[0] [nodemon] starting `node src/backend/server.js`
[1] 
[1] > sistema-refaccionaria@1.0.0 start
[1] > node src/backend/server.js
[1]
[0] C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\router\index.js:462
[0]     throw new TypeError('Router.use() requires a middleware function')
[0]     ^
[0]
[0] TypeError: Router.use() requires a middleware function
[0]     at Function.use (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\router\index.js:462:11)      
[0]     at Object.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\routes\cliente.routes.js:10:8)      
[0]     at Module._compile (node:internal/modules/cjs/loader:1554:14)[0]     at Object..js (node:internal/modules/cjs/loader:1706:10)     
[0]     at Module.load (node:internal/modules/cjs/loader:1289:32)    
[0]     at Function._load (node:internal/modules/cjs/loader:1108:12) 
[0]     at TracingChannel.traceSync (node:diagnostics_channel:322:14)[0]     at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)  
[0]     at Module.require (node:internal/modules/cjs/loader:1311:12) 
[0]     at require (node:internal/modules/helpers:136:16)
[0]
[0] Node.js v22.14.0
[1] C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\router\index.js:462
[1]     throw new TypeError('Router.use() requires a middleware function')
[1]     ^
[1]
[1] TypeError: Router.use() requires a middleware function
[1]     at Function.use (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\router\index.js:462:11)      
[1]     at Object.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\routes\cliente.routes.js:10:8)      
[1]     at Module._compile (node:internal/modules/cjs/loader:1554:14)[1]     at Object..js (node:internal/modules/cjs/loader:1706:10)     
[1]     at Module.load (node:internal/modules/cjs/loader:1289:32)    
[1]     at Function._load (node:internal/modules/cjs/loader:1108:12) 
[1]     at TracingChannel.traceSync (node:diagnostics_channel:322:14)[1]     at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)  
[1]     at Module.require (node:internal/modules/cjs/loader:1311:12) 
[1]     at require (node:internal/modules/helpers:136:16)
[1] Node.js v22.14.0
[1] npm run client exited with code 1
[0] �Desea terminar el trabajo por lotes (S/N)? PS C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend> npm run dev exited with code 1
                                                      ^C
PS C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend> npm start       

> sistema-refaccionaria@1.0.0 start
> node src/backend/server.js

C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\router\index.js:462
    throw new TypeError('Router.use() requires a middleware function')
    ^

TypeError: Router.use() requires a middleware function
    at Function.use (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\router\index.js:462:11)
    at Object.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\routes\cliente.routes.js:10:8)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)    
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)        
    at Function._load (node:internal/modules/cjs/loader:1108:12)     
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)    
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)      
    at Module.require (node:internal/modules/cjs/loader:1311:12)       at require (node:internal/modules/helpers:136:16) tengo este error
```

**Prompt 6: Error por módulo exceljs faltante**
```
sistema-refaccionaria@1.0.0 start
> node src/backend/server.js       

node:internal/modules/cjs/loader:1228
  throw err;
  ^

Error: Cannot find module 'exceljs'  
Require stack:
- C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\services\alerta-stock.service.js
- C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\controllers\alerta-stock.controller.js
- C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\routes\alerta-stock.routes.js
- C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\server.js
    at Function._resolveFilename (node:internal/modules/cjs/loader:1225:15)
    at Function._load (node:internal/modules/cjs/loader:1055:27)     
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)    
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)      
    at Module.require (node:internal/modules/cjs/loader:1311:12)     
    at require (node:internal/modules/helpers:136:16)
    at Object.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\services\alerta-stock.service.js:3:17)  
    at Module._compile (node:internal/modules/cjs/loader:1554:14)    
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32) {      
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    'C:\\Users\\carlos\\Documents\\lider_curso\\AI4Devs-finalproject\\src\\backend\\services\\alerta-stock.service.js',
    'C:\\Users\\carlos\\Documents\\lider_curso\\AI4Devs-finalproject\\src\\backend\\controllers\\alerta-stock.controller.js',
    'C:\\Users\\carlos\\Documents\\lider_curso\\AI4Devs-finalproject\\src\\backend\\routes\\alerta-stock.routes.js',
    'C:\\Users\\carlos\\Documents\\lider_curso\\AI4Devs-finalproject\\src\\backend\\server.js'
  ]
}
```

**Prompt 7: Verificación de dependencias**
```
comprueba que todas las dependencias esten instaladas para que el servidor inicie correctamente
```

**Prompt 8: Error de conexión a base de datos**
```
Servidor corriendo en puerto 3000
No se pudo conectar a la base de datos: ConnectionRefusedError [SequelizeConnectionRefusedError]
    at ConnectionManager.connect (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\mysql\connection-manager.js:92:17)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ConnectionManager._connect (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\abstract\connection-manager.js:222:24)
    at async C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\abstract\connection-manager.js:174:32
    at async ConnectionManager.getConnection (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\abstract\connection-manager.js:197:7)
    at async C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\sequelize.js:305:26
    at async Sequelize.authenticate (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\sequelize.js:457:5)
    at async Server.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\server.js:42:5) {
  parent: AggregateError [ECONNREFUSED]:
      at internalConnectMultiple (node:net:1139:18)
      at afterConnectMultiple (node:net:1712:7) {
    code: 'ECONNREFUSED',
    fatal: true,
    [errors]: [ [Error], [Error] ]
  },
  original: AggregateError [ECONNREFUSED]:
      at internalConnectMultiple (node:net:1139:18)
      at afterConnectMultiple (node:net:1712:7) {
    code: 'ECONNREFUSED',
    fatal: true,
    [errors]: [ [Error], [Error] ]
  }
}
```

**Prompt 9: Cambio a SQLite**
```
sqlite
```

**Prompt 10: Conflicto de puertos**
```
PS C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend> npm run dev:full                                               kend>

> sistema-refaccionaria@1.0.0 dev:full
> concurrently "npm run dev" "npm run client"

(node:12464) [DEP0060] DeprecationWarning: The `util._extend` API is 
deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
[0] 
[0] > sistema-refaccionaria@1.0.0 dev
[0] > nodemon src/backend/server.js
[0]
[1]
[1] > sistema-refaccionaria@1.0.0 client
[1] > cd src/frontend && npm start
[1]
[0] [nodemon] 2.0.22
[0] [nodemon] to restart at any time, enter `rs`
[0] [nodemon] watching path(s): *.*
[0] [nodemon] watching extensions: js,mjs,json
[0] [nodemon] starting `node src/backend/server.js`
[1] 
[1] > sistema-refaccionaria@1.0.0 start
[1] > node src/backend/server.js
[1]
[0] Servidor corriendo en puerto 3000
[0] Executing (default): SELECT 1+1 AS result
[0] Conexión a la base de datos establecida correctamente.
[1] node:events:496
[1]       throw er; // Unhandled 'error' event
[1]       ^
[1]
[1] Error: listen EADDRINUSE: address already in use :::3000
[1]     at Server.setupListenHandle [as _listen2] (node:net:1937:16) 
[1]     at listenInCluster (node:net:1994:12)
[1]     at Server.listen (node:net:2099:7)
[1]     at Function.listen (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\express\lib\application.js:635:24)    
[1]     at Object.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\server.js:38:5)
[1]     at Module._compile (node:internal/modules/cjs/loader:1554:14)[1]     at Object..js (node:internal/modules/cjs/loader:1706:10)     
[1]     at Module.load (node:internal/modules/cjs/loader:1289:32)    
[1]     at Function._load (node:internal/modules/cjs/loader:1108:12) 
[1]     at TracingChannel.traceSync (node:diagnostics_channel:322:14)[1]     at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)  
[1]     at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
[1]     at node:internal/main/run_main_module:36:49
[1] Emitted 'error' event on Server instance at:
[1]     at emitErrorNT (node:net:1973:8)
[1]     at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
[1]   code: 'EADDRINUSE',
[1]   errno: -4091,
[1]   syscall: 'listen',
[1]   address: '::',
[1]   port: 3000
[1] }
[1]
[1] Node.js v22.14.0
[1] npm run client exited with code 1
```

**Prompt 11: Sincronización del esquema de base de datos
```
Necesito que la aplicación sincronice automáticamente el esquema de base de datos SQLite con los modelos de Sequelize al iniciar, para garantizar que todas las tablas y relaciones estén actualizadas.
```

**Prompt 12: Error de sincronización de tablas SQLite**
```
Executing (default): DROP TABLE `devoluciones`;
No se pudo conectar a la base de datos: Error
    at Database.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\sqlite\query.js:185:27)     
    at C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\sqlite\query.js:183:50
    at new Promise (<anonymous>)
    at Query.run (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\sqlite\query.js:183:12)
    at C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\sequelize.js:315:28
    at async SQLiteQueryInterface.changeColumn (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\dialects\sqlite\query-interface.js:43:7)
    at async Devolucion.sync (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\model.js:984:11)
    at async Sequelize.sync (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\node_modules\sequelize\lib\sequelize.js:377:9)
    at async Server.<anonymous> (C:\Users\carlos\Documents\lider_curso\AI4Devs-finalproject\src\backend\server.js:46:5) {
  name: 'SequelizeDatabaseError',
  parent: [Error: SQLITE_ERROR: no such table: main.DetalleVentas] {        
    errno: 1,
    code: 'SQLITE_ERROR',
    sql: 'DROP TABLE `devoluciones`;'
  },
  original: [Error: SQLITE_ERROR: no such table: main.DetalleVentas] {      
    errno: 1,
    code: 'SQLITE_ERROR',
    sql: 'DROP TABLE `devoluciones`;'
  },
  sql: 'DROP TABLE `devoluciones`;',
  parameters: {}
}
```

**Respuesta 12: Cambio a modo alter para sincronización de esquema**
```
El error ocurre porque estamos usando { force: true } en sequelize.sync(), lo que intenta eliminar tablas que no existen. Cambiamos a { alter: true } para que Sequelize actualice las tablas existentes en lugar de intentar recrearlas:

```javascript
// Código anterior
await sequelize.sync({ force: true });

// Código actualizado
await sequelize.sync({ alter: true });
```

Este enfoque es más seguro porque:
1. No elimina datos existentes
2. Solo modifica el esquema según sea necesario
3. Es más adecuado para entornos de desarrollo y producción

Para un entorno de producción, se debe considerar usar migraciones de Sequelize como enfoque definitivo.
```
