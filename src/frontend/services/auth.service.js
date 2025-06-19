import axios from 'axios';
import { setAuthToken, removeAuthToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/usuarios/login`, {
      email,
      password
    });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
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
