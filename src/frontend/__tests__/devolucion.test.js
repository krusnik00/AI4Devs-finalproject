import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import DevolucionForm from '../components/DevolucionForm';
import DevolucionesList from '../components/DevolucionesList';
import DevolucionDetalle from '../components/DevolucionDetalle';
import { devolucionService } from '../services/devolucion.service';

// Mock del servicio de devoluciones
jest.mock('../services/devolucion.service');

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' })
}));

describe('Componentes de Devoluciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DevolucionForm', () => {
    beforeEach(() => {
      // Configurar mocks para el formulario
      devolucionService.buscarVentaParaDevolucion.mockResolvedValue({
        venta: {
          id: 1,
          fecha: '2023-06-10',
          cliente: { id: 1, nombre: 'Cliente Test' },
          total: 150,
          detalles: [
            {
              id: 1,
              producto_id: 1,
              producto: { id: 1, nombre: 'Producto Test', codigo: 'TEST-001' },
              precio_unitario: 50,
              cantidad: 3,
              cantidadDevolvible: 3
            }
          ]
        }
      });
      
      devolucionService.crearDevolucion.mockResolvedValue({
        message: 'Devolución procesada correctamente',
        devolucion: { id: 1 }
      });
    });

    test('debe buscar una venta por número de ticket', async () => {
      render(
        <ChakraProvider>
          <BrowserRouter>
            <DevolucionForm />
          </BrowserRouter>
        </ChakraProvider>
      );

      // Ingresar número de ticket y buscar
      fireEvent.change(screen.getByPlaceholderText(/Número de ticket/i), {
        target: { value: '12345' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
      
      await waitFor(() => {
        expect(devolucionService.buscarVentaParaDevolucion).toHaveBeenCalledWith('12345');
      });
    });

    test('debe mostrar un error cuando no se encuentra la venta', async () => {
      devolucionService.buscarVentaParaDevolucion.mockRejectedValue({
        response: { data: { message: 'Venta no encontrada' } }
      });

      render(
        <ChakraProvider>
          <BrowserRouter>
            <DevolucionForm />
          </BrowserRouter>
        </ChakraProvider>
      );

      fireEvent.change(screen.getByPlaceholderText(/Número de ticket/i), {
        target: { value: '99999' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Venta no encontrada/i)).toBeInTheDocument();
      });
    });
  });

  describe('DevolucionesList', () => {
    beforeEach(() => {
      // Configurar mocks para la lista
      devolucionService.listarDevoluciones.mockResolvedValue({
        devoluciones: [
          {
            id: 1,
            fecha_devolucion: '2023-06-15',
            venta_id: 1,
            motivo: 'defectuoso',
            tipo: 'devolucion',
            estado: 'completada',
            total: 50,
            cliente: { nombre: 'Cliente Test' }
          },
          {
            id: 2,
            fecha_devolucion: '2023-06-16',
            venta_id: 2,
            motivo: 'equivocado',
            tipo: 'cambio',
            estado: 'pendiente',
            total: 150,
            cliente: null
          }
        ],
        pagina: 1,
        totalPaginas: 1
      });
    });

    test('debe cargar y mostrar la lista de devoluciones', async () => {
      render(
        <ChakraProvider>
          <BrowserRouter>
            <DevolucionesList />
          </BrowserRouter>
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(devolucionService.listarDevoluciones).toHaveBeenCalled();
      });

      expect(screen.getByText(/Cliente Test/i)).toBeInTheDocument();
      expect(screen.getByText(/Público General/i)).toBeInTheDocument();
    });

    test('debe filtrar devoluciones por estado', async () => {
      render(
        <ChakraProvider>
          <BrowserRouter>
            <DevolucionesList />
          </BrowserRouter>
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(devolucionService.listarDevoluciones).toHaveBeenCalled();
      });

      // Seleccionar filtro "Pendiente"
      fireEvent.change(screen.getByLabelText(/Estado/i), {
        target: { value: 'pendiente' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /Filtrar/i }));
      
      await waitFor(() => {
        expect(devolucionService.listarDevoluciones).toHaveBeenCalledWith(
          expect.objectContaining({ estado: 'pendiente' })
        );
      });
    });
  });

  describe('DevolucionDetalle', () => {
    beforeEach(() => {
      // Configurar mocks para el detalle
      devolucionService.getDevolucionPorId.mockResolvedValue({
        id: 1,
        fecha_devolucion: '2023-06-15',
        venta_id: 1,
        motivo: 'defectuoso',
        descripcion_motivo: 'Producto con defectos de fábrica',
        tipo: 'devolucion',
        estado: 'pendiente',
        total: 100,
        cliente: { nombre: 'Cliente Test' },
        detalles: [
          {
            id: 1,
            producto: { nombre: 'Producto Test', codigo: 'TEST-001' },
            cantidad: 2,
            precio_unitario: 50,
            subtotal: 100
          }
        ]
      });
      
      devolucionService.autorizarDevolucion.mockResolvedValue({
        message: 'Devolución autorizada correctamente'
      });
      
      devolucionService.cancelarDevolucion.mockResolvedValue({
        message: 'Devolución cancelada correctamente'
      });
    });

    test('debe cargar y mostrar los detalles de una devolución', async () => {
      render(
        <ChakraProvider>
          <BrowserRouter>
            <DevolucionDetalle />
          </BrowserRouter>
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(devolucionService.getDevolucionPorId).toHaveBeenCalledWith('1');
      });

      expect(screen.getByText(/Producto con defectos de fábrica/i)).toBeInTheDocument();
      expect(screen.getByText(/Producto Test/i)).toBeInTheDocument();
      expect(screen.getByText(/100/i)).toBeInTheDocument();
    });

    test('debe permitir autorizar una devolución pendiente', async () => {
      render(
        <ChakraProvider>
          <BrowserRouter>
            <DevolucionDetalle />
          </BrowserRouter>
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(devolucionService.getDevolucionPorId).toHaveBeenCalled();
      });

      // Buscar y hacer clic en el botón de autorizar
      const autorizarButton = screen.getByRole('button', { name: /Autorizar/i });
      fireEvent.click(autorizarButton);
      
      // Confirmar la autorización
      const confirmarButton = screen.getByRole('button', { name: /Confirmar/i });
      fireEvent.click(confirmarButton);
      
      await waitFor(() => {
        expect(devolucionService.autorizarDevolucion).toHaveBeenCalledWith('1');
      });
    });
  });
});
