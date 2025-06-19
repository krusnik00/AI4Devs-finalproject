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

export const clienteService = {
  // Crear nuevo cliente
  createCliente: async (clienteData) => {
    const response = await axios.post(
      `${API_URL}/clientes`, 
      clienteData,
      configureHeaders()
    );
    return response.data;
  },
  
  // Obtener un cliente por ID
  getClienteById: async (id) => {
    const response = await axios.get(
      `${API_URL}/clientes/${id}`,
      configureHeaders()
    );
    return response.data;
  },
  
  // Actualizar cliente
  updateCliente: async (id, clienteData) => {
    const response = await axios.put(
      `${API_URL}/clientes/${id}`, 
      clienteData,
      configureHeaders()
    );
    return response.data;
  },
  
  // Obtener lista de clientes con filtros
  getClientes: async (queryParams) => {
    const response = await axios.get(
      `${API_URL}/clientes`,
      { 
        ...configureHeaders(),
        params: queryParams
      }
    );
    return response.data;
  },
  
  // Desactivar cliente
  deactivateCliente: async (id) => {
    const response = await axios.delete(
      `${API_URL}/clientes/${id}`,
      configureHeaders()
    );
    return response.data;
  },
  
  // Buscar clientes (autocompletado)
  searchClientes: async (query, limit = 10) => {
    // Esta función no require autenticación ya que se usa en el punto de venta
    const response = await axios.get(`${API_URL}/clientes/buscar`, {
      params: { q: query, limit }
    });
    return response.data;
  },
  
  // Obtener historial de compras de un cliente
  getClienteHistorial: async (id, pagina = 1, limite = 10) => {
    const response = await axios.get(
      `${API_URL}/clientes/${id}/historial`,
      { 
        ...configureHeaders(),
        params: { pagina, limite }
      }
    );
    return response.data;
  }
};

export default clienteService;
