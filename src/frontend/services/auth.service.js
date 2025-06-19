import api from './api';
import { setAuthToken, removeAuthToken } from '../utils/auth';

const login = async (email, password) => {
  try {
    console.log('Intentando login con:', { email, password: '***' });
    const response = await api.post('/usuarios/login', {
      email,
      password
    });
    
    console.log('Respuesta del servidor:', response.data);
    
    if (response.data.token) {
      setAuthToken(response.data.token);
      console.log('Token guardado correctamente');
    } else {
      console.warn('No se recibió token en la respuesta');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    removeAuthToken();
    throw error;
  }
};

const logout = () => {
  removeAuthToken();
};

const authService = {
  login,
  logout
};

export default authService;
