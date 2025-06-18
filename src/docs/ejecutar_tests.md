# Guía para ejecutar las pruebas unitarias

## Requisitos previos

Asegúrate de tener todas las dependencias instaladas:

```bash
npm install
```

## Estructura de pruebas

Las pruebas están organizadas siguiendo la siguiente estructura:

```
src/
├── backend/
│   └── __tests__/
│       ├── auth.controller.test.js     # Pruebas del controlador de autenticación
│       ├── auth.middleware.test.js     # Pruebas del middleware de autenticación
│       ├── devolucion.controller.test.js # Pruebas del controlador de devoluciones
│       ├── devolucion.model.test.js    # Pruebas del modelo de devoluciones
│       ├── producto.controller.test.js # Pruebas del controlador de productos
│       ├── producto.model.test.js      # Pruebas del modelo de productos
│       ├── setup.js                    # Configuración general para las pruebas
│       └── very-basic.test.js          # Pruebas básicas para verificar Jest
│
└── frontend/
    └── __tests__/
        ├── DevolucionForm.test.jsx     # Pruebas del formulario de devoluciones
        ├── DevolucionesList.test.jsx   # Pruebas de la lista de devoluciones
        └── devolucion.service.test.js  # Pruebas del servicio de devoluciones
```

## Ejecución de pruebas

### Pruebas básicas

Para verificar que Jest está configurado correctamente:

```bash
npx jest src/backend/__tests__/very-basic.test.js
```

### Pruebas de backend

Para ejecutar todas las pruebas del backend:

```bash
npm run test:backend
```

Para ejecutar pruebas específicas de los diferentes módulos:

```bash
# Pruebas del módulo de devoluciones
npm run test:devoluciones

# Pruebas del módulo de productos
npm run test:productos

# Pruebas del sistema de autenticación
npm run test:auth
```

Para ejecutar una prueba específica:

```bash
npx jest src/backend/__tests__/producto.model.test.js
```

### Pruebas de frontend

Para ejecutar todas las pruebas del frontend:

```bash
npm run test:frontend
```

Para ejecutar una prueba específica:

```bash
npx jest src/frontend/__tests__/DevolucionForm.test.jsx
```

## Generación de informes de cobertura

Para generar un informe detallado de la cobertura de código:

```bash
npm run test:coverage
```

Esto generará un informe en la carpeta `coverage/` donde podrás ver qué partes del código están cubiertas por las pruebas.

## Solución de problemas comunes

### Error: "Jest encountered an unexpected token"

Este error ocurre generalmente cuando se intenta ejecutar pruebas con componentes React que utilizan JSX. Asegúrate de que:

1. Babel está configurado correctamente con `@babel/preset-react`
2. El archivo babel.config.js contiene:

```javascript
module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
};
```

### Error: "Your test suite must contain at least one test"

Asegúrate de que tus archivos de prueba tengan al menos un bloque `test()` o `it()` dentro de un bloque `describe()`. Ejemplo:

```javascript
describe('Mi suite', () => {
  test('mi prueba', () => {
    expect(true).toBe(true);
  });
});
```

### Error: "Cannot find module"

Este error puede ocurrir cuando:

1. La ruta del módulo es incorrecta
2. El módulo no está instalado

Asegúrate de que:
- Las rutas de importación están correctas
- Todas las dependencias están instaladas

### Configuración para SQLite en memoria

Para pruebas con base de datos, es recomendable usar SQLite en memoria:

```javascript
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});
```

Para ejecutar una prueba específica:

```bash
npx jest src/frontend/__tests__/DevolucionForm.test.jsx
```

## Solución de problemas comunes

### Error: "Jest encountered an unexpected token"

Este error ocurre generalmente cuando se intenta ejecutar pruebas con componentes React que utilizan JSX. Asegúrate de que:

1. Babel está configurado correctamente con `@babel/preset-react`
2. El archivo babel.config.js contiene:

```javascript
module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
};
```

### Error: "Your test suite must contain at least one test"

Asegúrate de que tus archivos de prueba tengan al menos un bloque `test()` o `it()` dentro de un bloque `describe()`. Ejemplo:

```javascript
describe('Mi suite', () => {
  test('mi prueba', () => {
    expect(true).toBe(true);
  });
});
```

### Error: "Cannot find module"

Este error puede ocurrir cuando:

1. La ruta del módulo es incorrecta
2. El módulo no está instalado

Asegúrate de que:
- Las rutas de importación están correctas
- Todas las dependencias están instaladas

### Configuración para SQLite en memoria

Para pruebas con base de datos, es recomendable usar SQLite en memoria:

```javascript
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});
```

## Cobertura de pruebas

Para generar un informe de cobertura de pruebas:

```bash
npm test -- --coverage
```

Esto generará un informe detallado en la carpeta `coverage`.
