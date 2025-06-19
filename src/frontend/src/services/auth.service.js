import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const login = async (email, password) => {
  try {
    console.log('Enviando petición de login a:', `${API_URL}/usuarios/login`);
    const response = await axios.post(`${API_URL}/usuarios/login`, {
      email,
      password
    });

    console.log('Respuesta del servidor:', response.data);
    return response.data; // Devolvemos directamente los datos, no toda la respuesta
  } catch (error) {
    console.error('Error en auth.service.login:', error);
    throw error;
  }
};

const authService = {
  login
};

export default authService;
