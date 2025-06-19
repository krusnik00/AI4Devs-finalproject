import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ProductoService {
    async getAll() {
        const response = await axios.get(`${API_URL}/productos`);
        return response.data;
    }

    async getById(id) {
        const response = await axios.get(`${API_URL}/productos/${id}`);
        return response.data;
    }

    async create(productoData) {
        // Crear un FormData para manejar la imagen
        const formData = new FormData();
        
        // Agregar todos los campos del producto
        Object.keys(productoData).forEach(key => {
            if (key === 'imagen') {
                if (productoData[key] && productoData[key].length > 0) {
                    formData.append('imagen', productoData[key][0]);
                }
            } else {
                formData.append(key, productoData[key]);
            }
        });

        const response = await axios.post(`${API_URL}/productos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    }

    async update(id, productoData) {
        const formData = new FormData();
        
        Object.keys(productoData).forEach(key => {
            if (key === 'imagen') {
                if (productoData[key] && productoData[key].length > 0) {
                    formData.append('imagen', productoData[key][0]);
                }
            } else {
                formData.append(key, productoData[key]);
            }
        });

        const response = await axios.put(`${API_URL}/productos/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    }

    async delete(id) {
        const response = await axios.delete(`${API_URL}/productos/${id}`);
        return response.data;
    }

    // Método para buscar productos
    async search(query) {
        const response = await axios.get(`${API_URL}/productos/search`, { params: query });
        return response.data;
    }
}

export default new ProductoService();
