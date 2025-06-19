import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const login = async (email, password) => {
  try {    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    if (response.data) {
      // Guardar el token en localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  } catch (error) {
    throw error;
  }
};

const authService = {
  login
};

export default authService;
