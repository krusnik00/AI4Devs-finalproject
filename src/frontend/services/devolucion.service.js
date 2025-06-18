import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configurar axios para incluir el token de autenticación
const configureHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const devolucionService = {
  // Buscar una venta para devolución por número de ticket
  buscarVentaParaDevolucion: async (numeroTicket) => {
    const response = await axios.get(
      `${API_URL}/devoluciones/buscar-venta`,
      {
        ...configureHeaders(),
        params: { ticket: numeroTicket }
      }
    );
    return response.data;
  },
  
  // Crear una nueva devolución
  crearDevolucion: async (devolucionData) => {
    const response = await axios.post(
      `${API_URL}/devoluciones`,
      devolucionData,
      configureHeaders()
    );
    return response.data;
  },
  
  // Obtener una devolución por ID
  getDevolucionPorId: async (id) => {
    const response = await axios.get(
      `${API_URL}/devoluciones/${id}`,
      configureHeaders()
    );
    return response.data;
  },
  
  // Listar devoluciones con filtros
  listarDevoluciones: async (params = {}) => {
    const response = await axios.get(
      `${API_URL}/devoluciones`,
      {
        ...configureHeaders(),
        params
      }
    );
    return response.data;
  },
  
  // Autorizar una devolución pendiente
  autorizarDevolucion: async (id) => {
    const response = await axios.post(
      `${API_URL}/devoluciones/${id}/autorizar`,
      {},
      configureHeaders()
    );
    return response.data;
  },
  
  // Cancelar una devolución
  cancelarDevolucion: async (id, motivo) => {
    const response = await axios.post(
      `${API_URL}/devoluciones/${id}/cancelar`,
      { motivo },
      configureHeaders()
    );
    return response.data;
  },
  
  // Generar e imprimir comprobante
  generarComprobante: async (id) => {
    const token = getAuthToken();
    // Abrir en una nueva pestaña
    window.open(
      `${API_URL}/devoluciones/${id}/comprobante?token=${token}`,
      '_blank'
    );
    return true;
  },
  
  // Obtener el número de devoluciones pendientes de autorización
  getDevolucionesPendientesCount: async () => {
    const response = await axios.get(
      `${API_URL}/devoluciones/pendientes/count`,
      configureHeaders()
    );
    return response.data.count;
  }
};

export default devolucionService;
