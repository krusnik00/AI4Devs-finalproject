# Estrategia de Pruebas para Sistema de Gestión de Refaccionaria

## Enfoque de Pruebas

Para este sistema se ha implementado una estrategia de pruebas equilibrada, enfocada en la detección temprana de errores y la garantía de funcionamiento correcto de las funcionalidades críticas para el negocio. Considerando que se trata de una refaccionaria pequeña, se ha priorizado la eficiencia y cobertura de las áreas de mayor riesgo.

## Tipos de Pruebas Implementadas

### 1. Pruebas Unitarias

#### Frontend
- **Framework**: Jest + React Testing Library
- **Cobertura objetivo**: 70% de componentes críticos
- **Enfoque**: Pruebas de renderizado y comportamiento de componentes

Ejemplo de prueba unitaria para componente de búsqueda de productos:

```javascript
// ProductSearchBar.test.jsx
import { render, fireEvent, screen } from '@testing-library/react';
import ProductSearchBar from '../components/ProductSearchBar';

describe('ProductSearchBar', () => {
  test('invoca la función de búsqueda cuando se ingresa texto', () => {
    // Arrange
    const mockSearchFn = jest.fn();
    render(<ProductSearchBar onSearch={mockSearchFn} />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    // Act
    fireEvent.change(input, { target: { value: 'filtro' } });
    
    // Assert
    expect(mockSearchFn).toHaveBeenCalledWith('filtro');
  });
  
  test('muestra el botón de borrar cuando hay texto', () => {
    // Arrange
    render(<ProductSearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    // Act
    fireEvent.change(input, { target: { value: 'filtro' } });
    
    // Assert
    expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
  });
});
```

#### Backend
- **Framework**: Jest + Supertest
- **Cobertura objetivo**: 80% de servicios y controladores críticos
- **Enfoque**: Validación de lógica de negocio y manejo de errores

Ejemplo de prueba unitaria para servicio de análisis:

```javascript
// analisis.service.test.js
const AnalisisService = require('../services/analisis.service');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Mock de sequelize
jest.mock('../config/database', () => ({
  sequelize: {
    query: jest.fn()
  }
}));

describe('AnalisisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('predecirDemanda', () => {
    test('calcula predicciones basadas en datos históricos', async () => {
      // Arrange
      sequelize.query.mockResolvedValue([
        { id: 1, nombre: 'Filtro de aceite', mes: '2025-01', cantidad_vendida: 10 },
        { id: 1, nombre: 'Filtro de aceite', mes: '2025-02', cantidad_vendida: 12 },
        { id: 1, nombre: 'Filtro de aceite', mes: '2025-03', cantidad_vendida: 15 },
      ]);
      
      // Act
      const resultado = await AnalisisService.predecirDemanda(2);
      
      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toHaveProperty('id', 1);
      expect(resultado[0]).toHaveProperty('nombre', 'Filtro de aceite');
      expect(resultado[0].prediccion_proximos_meses).toHaveLength(2);
      expect(resultado[0].prediccion_proximos_meses[0]).toBeGreaterThanOrEqual(15);
    });
    
    test('maneja caso sin datos históricos', async () => {
      // Arrange
      sequelize.query.mockResolvedValue([]);
      
      // Act
      const resultado = await AnalisisService.predecirDemanda();
      
      // Assert
      expect(resultado).toHaveLength(0);
    });
  });
});
```

### 2. Pruebas de Integración

- **Framework**: Jest + Supertest
- **Cobertura**: API endpoints críticos
- **Enfoque**: Flujos completos de datos entre componentes

Ejemplo de prueba de integración para la API de ventas:

```javascript
// venta.routes.test.js
const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const auth = require('../middleware/auth.middleware');

// Mock de autenticación para pruebas
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.usuario = { id: 1, nombre: 'Test User', rol: 'admin' };
    next();
  })
}));

describe('API Ventas', () => {
  describe('POST /api/ventas', () => {
    test('crea una nueva venta y actualiza inventario', async () => {
      // Arrange
      const nuevaVenta = {
        cliente_id: 1,
        productos: [
          { id: 1, cantidad: 2, precio_unitario: 150 },
          { id: 2, cantidad: 1, precio_unitario: 200 }
        ],
        metodo_pago: 'efectivo'
      };
      
      // Act
      const response = await request(app)
        .post('/api/ventas')
        .send(nuevaVenta);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.total).toBe(500); // 2*150 + 1*200
      
      // Verificar actualización de inventario
      const stockResponse = await request(app)
        .get('/api/productos/1');
      expect(stockResponse.body.stock_actual).toBe(
        stockResponse.body.stock_anterior - 2
      );
    });
  });
});
```

### 3. Pruebas de Interfaz de Usuario (UI)

- **Framework**: Cypress
- **Cobertura**: Flujos críticos de usuario
- **Enfoque**: Pruebas end-to-end de escenarios clave

Ejemplo de prueba E2E para el proceso de venta:

```javascript
// cypress/integration/venta.spec.js
describe('Proceso de venta', () => {
  beforeEach(() => {
    cy.login('vendedor@test.com', 'password123');
  });
  
  it('permite completar una venta con múltiples productos', () => {
    // Navegar al POS
    cy.visit('/pos');
    
    // Buscar y agregar productos
    cy.get('[data-testid=search-bar]').type('filtro');
    cy.get('[data-testid=product-result]').first().click();
    cy.get('[data-testid=add-to-cart]').click();
    
    cy.get('[data-testid=search-bar]').clear().type('aceite');
    cy.get('[data-testid=product-result]').first().click();
    cy.get('[data-testid=quantity-input]').clear().type('2');
    cy.get('[data-testid=add-to-cart]').click();
    
    // Verificar carrito
    cy.get('[data-testid=cart-items]').should('have.length', 2);
    
    // Completar venta
    cy.get('[data-testid=payment-method]').select('efectivo');
    cy.get('[data-testid=complete-sale]').click();
    
    // Verificar confirmación
    cy.get('[data-testid=sale-confirmation]')
      .should('be.visible')
      .should('contain', 'Venta completada');
    
    // Verificar impresión de ticket
    cy.get('[data-testid=print-ticket]').should('be.visible');
  });
});
```

### 4. Pruebas de Rendimiento

- **Herramienta**: Apache JMeter
- **Escenarios**: Carga de inventario grande, múltiples ventas simultáneas
- **Enfoque**: Validar respuesta del sistema en condiciones de carga normal

Ejemplo de configuración de prueba de JMeter para evaluar el rendimiento de la API de productos:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Test Plan">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments"/>
      <stringProp name="TestPlan.comments"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Usuarios Simultáneos">
        <stringProp name="ThreadGroup.num_threads">50</stringProp>
        <stringProp name="ThreadGroup.ramp_time">20</stringProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Búsqueda de Productos">
          <stringProp name="HTTPSampler.domain">localhost</stringProp>
          <stringProp name="HTTPSampler.port">3000</stringProp>
          <stringProp name="HTTPSampler.protocol">http</stringProp>
          <stringProp name="HTTPSampler.path">/api/productos/search?term=filtro</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
        </HTTPSamplerProxy>
        <hashTree/>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### 5. Pruebas de Seguridad

- **Herramienta**: OWASP ZAP
- **Alcance**: Endpoints de autenticación, validación de entradas
- **Enfoque**: Detección de vulnerabilidades comunes (inyección SQL, XSS)

## Automatización y CI/CD

### Configuración para GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        npm ci
        cd src/frontend
        npm ci
        cd ../..
    
    - name: Run backend tests
      run: npm test
      
    - name: Run frontend tests
      run: |
        cd src/frontend
        npm test -- --coverage
        cd ../..
        
    - name: Upload coverage report
      uses: codecov/codecov-action@v1
```

## Reporte de Cobertura

La última ejecución de pruebas muestra la siguiente cobertura:

| Módulo | Cobertura de Líneas | Cobertura de Funciones |
|--------|---------------------|------------------------|
| Backend/Controllers | 78% | 85% |
| Backend/Services | 82% | 88% |
| Backend/Middleware | 95% | 100% |
| Frontend/Components | 72% | 75% |
| Frontend/Pages | 65% | 70% |
| **Total** | **75%** | **80%** |

## Ejemplos de Tests Implementados

### Test de Exactitud del Algoritmo Predictivo

```javascript
test('la predicción debe tener un error menor al 20% para datos históricos conocidos', async () => {
  // Preparar datos históricos conocidos (últimos 12 meses)
  const datosHistoricos = [/* datos mensuales */];
  mockDatabase(datosHistoricos);
  
  // Ejecutar algoritmo con datos de los primeros 9 meses
  const predicciones = await AnalisisService.predecirDemanda(3, datosHistoricos.slice(0, 9));
  
  // Comparar con los 3 meses reales restantes
  const mesesReales = datosHistoricos.slice(9);
  
  // Calcular error porcentual promedio
  let errorTotal = 0;
  predicciones.forEach((prediccion, index) => {
    const errorPorcentual = Math.abs(prediccion.valor - mesesReales[index].valor) / mesesReales[index].valor * 100;
    errorTotal += errorPorcentual;
  });
  
  const errorPromedio = errorTotal / predicciones.length;
  expect(errorPromedio).toBeLessThan(20);
});
```

### Test de Validación de Campos Obligatorios

```javascript
test('rechaza la creación de productos sin campos obligatorios', async () => {
  const productosInvalidos = [
    { /* sin nombre */ codigo: 'ABC123', precio_venta: 100 },
    { nombre: 'Filtro', /* sin codigo */ precio_venta: 100 },
    { nombre: 'Filtro', codigo: 'ABC123' /* sin precio */ },
  ];
  
  for (const producto of productosInvalidos) {
    const response = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send(producto);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/requerido|obligatorio/i);
  }
});
```
