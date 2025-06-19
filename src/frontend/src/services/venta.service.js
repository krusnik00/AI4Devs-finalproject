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

export const ventaService = {
  // Crear una nueva venta
  crearVenta: async (ventaData) => {
    const response = await axios.post(
      `${API_URL}/ventas`, 
      ventaData,
      configureHeaders()
    );
    return response.data;
  },
  
  // Obtener una venta por ID
  getVentaPorId: async (id) => {
    const response = await axios.get(
      `${API_URL}/ventas/${id}`,
      configureHeaders()
    );
    return response.data;
  },
  
  // Listar ventas con filtros
  listarVentas: async (params) => {
    const response = await axios.get(
      `${API_URL}/ventas`,
      { 
        ...configureHeaders(),
        params
      }
    );
    return response.data;
  },
  
  // Cancelar una venta
  cancelarVenta: async (id, motivo) => {
    const response = await axios.post(
      `${API_URL}/ventas/${id}/cancelar`,
      { motivo },
      configureHeaders()
    );
    return response.data;
  },
  
  // Descargar comprobante
  descargarComprobante: async (ventaId, tipo = 'ticket') => {
    const token = getAuthToken();
    // Abrir en una nueva pestaña
    window.open(
      `${API_URL}/ventas/${ventaId}/comprobante?tipo=${tipo}&token=${token}`,
      '_blank'
    );
    return true;
  },
  
  // Obtener estadísticas de ventas
  obtenerEstadisticas: async (params = {}) => {
    const response = await axios.get(
      `${API_URL}/ventas/estadisticas`,
      { 
        ...configureHeaders(),
        params
      }
    );
    return response.data;
  },
  
  // Obtener ventas por fechas (para dashboards)
  getVentasPorFecha: async (fechaInicio, fechaFin) => {
    const response = await axios.get(
      `${API_URL}/ventas/por-fecha`,
      { 
        ...configureHeaders(),
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }
      }
    );
    return response.data;
  }
};

export default ventaService;
