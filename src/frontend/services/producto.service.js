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

export const productoService = {
  // Obtener producto por ID
  getProductoPorId: async (id) => {
    const response = await axios.get(
      `${API_URL}/productos/${id}`,
      configureHeaders()
    );
    return response.data;
  },
  
  // Buscar productos (para POS)
  buscarProductos: async (query, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/productos/buscar`,
        {
          ...configureHeaders(),
          params: { q: query, limit }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error buscando productos:', error);
      return [];
    }
  },
  
  // Buscar producto por código de barras
  buscarPorCodigoBarras: async (codigo) => {
    try {
      const response = await axios.get(
        `${API_URL}/productos/codigo-barras/${codigo}`,
        configureHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error buscando por código de barras:', error);
      return null;
    }
  },
  
  // Listar productos con filtros
  listarProductos: async (params = {}) => {
    const response = await axios.get(
      `${API_URL}/productos`,
      {
        ...configureHeaders(),
        params
      }
    );
    return response.data;
  },
  
  // Crear nuevo producto
  crearProducto: async (productoData) => {
    const response = await axios.post(
      `${API_URL}/productos`,
      productoData,
      configureHeaders()
    );
    return response.data;
  },
  
  // Actualizar producto
  actualizarProducto: async (id, productoData) => {
    const response = await axios.put(
      `${API_URL}/productos/${id}`,
      productoData,
      configureHeaders()
    );
    return response.data;
  },
  
  // Obtener productos con bajo stock
  getProductosBajoStock: async (limit = 10) => {
    const response = await axios.get(
      `${API_URL}/alertas-stock/bajo-stock`,
      {
        ...configureHeaders(),
        params: { limit }
      }
    );
    return response.data;
  },
  
  // Obtener productos más vendidos
  getProductosMasVendidos: async (limit = 10, periodo = 'mes') => {
    const response = await axios.get(
      `${API_URL}/productos/mas-vendidos`,
      {
        ...configureHeaders(),
        params: { limit, periodo }
      }
    );
    return response.data;
  },
  
  // Obtener productos por categoría
  getProductosPorCategoria: async (categoriaId) => {
    const response = await axios.get(
      `${API_URL}/productos/por-categoria/${categoriaId}`,
      configureHeaders()
    );
    return response.data;
  },
  
  // Obtener productos por marca
  getProductosPorMarca: async (marcaId) => {
    const response = await axios.get(
      `${API_URL}/productos/por-marca/${marcaId}`,
      configureHeaders()
    );
    return response.data;
  }
};

export default productoService;
