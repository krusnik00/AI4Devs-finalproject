import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class DescuentoService {
    async obtenerDescuentos() {
        const response = await axios.get(`${BASE_URL}/descuentos`);
        return response.data;
    }

    async obtenerDescuento(id) {
        const response = await axios.get(`${BASE_URL}/descuentos/${id}`);
        return response.data;
    }

    async crearDescuento(descuentoData) {
        const response = await axios.post(`${BASE_URL}/descuentos`, descuentoData);
        return response.data;
    }

    async actualizarDescuento(id, descuentoData) {
        const response = await axios.put(`${BASE_URL}/descuentos/${id}`, descuentoData);
        return response.data;
    }

    async eliminarDescuento(id) {
        const response = await axios.delete(`${BASE_URL}/descuentos/${id}`);
        return response.data;
    }

    async validarDescuento(id, ventaData) {
        const response = await axios.post(`${BASE_URL}/descuentos/${id}/validar`, { venta: ventaData });
        return response.data;
    }
}

export const descuentoService = new DescuentoService();
