/**
 * @jest-environment jsdom
 */

import { devolucionService } from '../services/devolucion.service';
import axios from 'axios';

// Mock de axios
jest.mock('axios');

describe('Devolucion Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe obtener el conteo de devoluciones pendientes', async () => {
    // Configurar el mock de axios para simular la respuesta
    axios.get.mockResolvedValueOnce({
      data: { count: 5 }
    });

    // Llamar al método del servicio
    const count = await devolucionService.getDevolucionesPendientesCount();

    // Verificar que se llamó a axios.get con la URL correcta
    expect(axios.get).toHaveBeenCalledWith('/api/devoluciones/pendientes/count');
    
    // Verificar que se devolvió el conteo correcto
    expect(count).toBe(5);
  });

  test('debe manejar errores al obtener el conteo de devoluciones pendientes', async () => {
    // Configurar el mock de axios para simular un error
    axios.get.mockRejectedValueOnce(new Error('Error de red'));

    // Verificar que se lanza un error
    await expect(devolucionService.getDevolucionesPendientesCount()).rejects.toThrow();
  });

  test('debe buscar una venta para devolución', async () => {
    // Datos de ejemplo para la respuesta
    const ventaMock = {
      id: 1,
      fecha: '2023-06-15',
      total: 150,
      cliente: { nombre: 'Cliente Prueba' },
      detalles: [
        {
          id: 1,
          producto_id: 1,
          producto: { nombre: 'Producto Prueba' },
          cantidad: 2,
          precio_unitario: 75,
          subtotal: 150,
          cantidadDevolvible: 2
        }
      ]
    };

    // Configurar el mock de axios
    axios.get.mockResolvedValueOnce({
      data: { venta: ventaMock }
    });

    // Llamar al método del servicio
    const resultado = await devolucionService.buscarVentaParaDevolucion('12345');

    // Verificar que se llamó a axios.get con la URL y parámetros correctos
    expect(axios.get).toHaveBeenCalledWith('/api/devoluciones/buscar-venta', { 
      params: { numeroTicket: '12345' } 
    });
    
    // Verificar el resultado
    expect(resultado).toHaveProperty('venta');
    expect(resultado.venta).toEqual(ventaMock);
  });

  test('debe crear una devolución', async () => {
    // Datos de ejemplo para la solicitud
    const datosDevolucion = {
      venta_id: 1,
      motivo: 'defectuoso',
      descripcion_motivo: 'Producto dañado',
      tipo_reembolso: 'efectivo',
      detalles: [
        {
          detalle_venta_id: 1,
          cantidad: 1
        }
      ]
    };

    // Respuesta simulada
    const respuestaSimulada = {
      message: 'Devolución registrada correctamente',
      devolucion: {
        id: 1,
        venta_id: 1,
        estado: 'pendiente'
      }
    };

    // Configurar el mock de axios
    axios.post.mockResolvedValueOnce({
      data: respuestaSimulada
    });

    // Llamar al método del servicio
    const resultado = await devolucionService.crearDevolucion(datosDevolucion);

    // Verificar que se llamó a axios.post con la URL y datos correctos
    expect(axios.post).toHaveBeenCalledWith('/api/devoluciones', datosDevolucion);
    
    // Verificar el resultado
    expect(resultado).toEqual(respuestaSimulada);
  });

  test('debe obtener la lista de devoluciones', async () => {
    // Respuesta simulada
    const devolucionesMock = [
      {
        id: 1,
        venta_id: 1,
        estado: 'pendiente',
        fecha: '2023-06-15'
      },
      {
        id: 2,
        venta_id: 2,
        estado: 'autorizada',
        fecha: '2023-06-16'
      }
    ];

    // Configurar el mock de axios
    axios.get.mockResolvedValueOnce({
      data: { devoluciones: devolucionesMock }
    });

    // Llamar al método del servicio
    const resultado = await devolucionService.listarDevoluciones({ estado: 'todos' });

    // Verificar que se llamó a axios.get con la URL y parámetros correctos
    expect(axios.get).toHaveBeenCalledWith('/api/devoluciones', { 
      params: { estado: 'todos' } 
    });
    
    // Verificar el resultado
    expect(resultado).toHaveProperty('devoluciones');
    expect(resultado.devoluciones).toEqual(devolucionesMock);
  });

  test('debe obtener detalles de una devolución por ID', async () => {
    // Respuesta simulada
    const devolucionMock = {
      id: 1,
      venta_id: 1,
      estado: 'pendiente',
      fecha: '2023-06-15',
      detalles: [
        {
          id: 1,
          producto_id: 1,
          producto: { nombre: 'Producto Prueba' },
          cantidad: 1
        }
      ]
    };

    // Configurar el mock de axios
    axios.get.mockResolvedValueOnce({
      data: { devolucion: devolucionMock }
    });

    // Llamar al método del servicio
    const resultado = await devolucionService.obtenerDevolucionPorId(1);

    // Verificar que se llamó a axios.get con la URL correcta
    expect(axios.get).toHaveBeenCalledWith('/api/devoluciones/1');
    
    // Verificar el resultado
    expect(resultado).toHaveProperty('devolucion');
    expect(resultado.devolucion).toEqual(devolucionMock);
  });
});
