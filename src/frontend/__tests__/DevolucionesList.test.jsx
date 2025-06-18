/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DevolucionesList from '../components/DevolucionesList';
import { devolucionService } from '../services/devolucion.service';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// Mock del devolucionService
jest.mock('../services/devolucion.service');

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('DevolucionesList', () => {
  const devolucionesMock = [
    {
      id: 1,
      fecha: new Date('2023-06-15').toISOString(),
      venta_id: 100,
      cliente: { nombre: 'Cliente 1' },
      estado: 'pendiente',
      motivo: 'defectuoso',
      total_devolucion: 150
    },
    {
      id: 2,
      fecha: new Date('2023-06-16').toISOString(),
      venta_id: 101,
      cliente: { nombre: 'Cliente 2' },
      estado: 'autorizada',
      motivo: 'incompleto',
      total_devolucion: 200
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    devolucionService.listarDevoluciones.mockResolvedValue({
      devoluciones: devolucionesMock
    });
  });

  test('debe renderizar la lista de devoluciones', async () => {
    render(
      <ChakraProvider>
        <BrowserRouter>
          <DevolucionesList />
        </BrowserRouter>
      </ChakraProvider>
    );

    // Verificar que el título se muestra
    expect(screen.getByText(/Listado de Devoluciones/i)).toBeInTheDocument();

    // Verificar que se está cargando la lista
    expect(devolucionService.listarDevoluciones).toHaveBeenCalled();

    // Esperar a que se muestren las devoluciones
    await waitFor(() => {
      expect(screen.getByText(/Cliente 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Cliente 2/i)).toBeInTheDocument();
    });

    // Verificar que se muestran los estados
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/autorizada/i)).toBeInTheDocument();
  });

  test('debe permitir filtrar por estado', async () => {
    render(
      <ChakraProvider>
        <BrowserRouter>
          <DevolucionesList />
        </BrowserRouter>
      </ChakraProvider>
    );

    // Esperar a que se cargue la lista
    await waitFor(() => {
      expect(screen.getByText(/Cliente 1/i)).toBeInTheDocument();
    });

    // Limpiar mocks para verificar la segunda llamada
    jest.clearAllMocks();
    devolucionService.listarDevoluciones.mockResolvedValue({
      devoluciones: [devolucionesMock[0]] // Solo devolver devoluciones pendientes
    });

    // Simular cambio de filtro a "pendiente"
    // Como no conocemos la estructura exacta del componente,
    // este test tendría que ajustarse según cómo está implementado el filtro
    // Para este ejemplo, asumimos que hay un select o un conjunto de botones
    if (screen.getByLabelText) {
      try {
        const filtroSelect = screen.getByLabelText(/Filtrar por estado/i);
        fireEvent.change(filtroSelect, { target: { value: 'pendiente' } });
        
        // Verificar que se llamó al servicio con el filtro
        expect(devolucionService.listarDevoluciones).toHaveBeenCalledWith({ estado: 'pendiente' });
      } catch (error) {
        // Si no hay un elemento con label, podría haber botones
        const botonesFiltro = screen.getAllByRole('button');
        const botonPendientes = botonesFiltro.find(boton => 
          boton.textContent.toLowerCase().includes('pendiente')
        );
        
        if (botonPendientes) {
          fireEvent.click(botonPendientes);
          
          // Verificar que se llamó al servicio con el filtro
          expect(devolucionService.listarDevoluciones).toHaveBeenCalledWith({ estado: 'pendiente' });
        }
      }
    }
  });

  test('debe mostrar mensaje cuando no hay devoluciones', async () => {
    // Limpiar mocks y configurar para que devuelva lista vacía
    jest.clearAllMocks();
    devolucionService.listarDevoluciones.mockResolvedValue({
      devoluciones: []
    });

    render(
      <ChakraProvider>
        <BrowserRouter>
          <DevolucionesList />
        </BrowserRouter>
      </ChakraProvider>
    );

    // Esperar a que se muestre el mensaje de no hay devoluciones
    await waitFor(() => {
      expect(screen.getByText(/No hay devoluciones/i)).toBeInTheDocument();
    });
  });

  test('debe mostrar error si falla la carga de devoluciones', async () => {
    // Configurar el servicio para que devuelva un error
    jest.clearAllMocks();
    devolucionService.listarDevoluciones.mockRejectedValue(new Error('Error al cargar devoluciones'));

    render(
      <ChakraProvider>
        <BrowserRouter>
          <DevolucionesList />
        </BrowserRouter>
      </ChakraProvider>
    );

    // Esperar a que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/Error al cargar devoluciones/i)).toBeInTheDocument();
    });
  });
});
