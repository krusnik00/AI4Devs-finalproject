import React, { useState, useEffect } from 'react';
import { Layout, message, Modal } from 'antd';
import ProductoList from '../components/ProductoList';
import ProductoForm from '../components/ProductoForm';
import ProductoService from '../services/producto.service';

const { Content } = Layout;

const GestionProductos = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);

    useEffect(() => {
        loadCatalogos();
    }, []);

    const loadCatalogos = async () => {
        try {
            // Aquí deberías cargar las categorías y marcas desde sus respectivos servicios
            // Por ahora usamos datos de ejemplo
            setCategorias([
                { id: 1, nombre: 'Frenos' },
                { id: 2, nombre: 'Suspensión' },
                // ... más categorías
            ]);
            setMarcas([
                { id: 1, nombre: 'BREMBO' },
                { id: 2, nombre: 'MONROE' },
                // ... más marcas
            ]);
        } catch (error) {
            message.error('Error al cargar los catálogos: ' + error.message);
        }
    };

    const handleEdit = (producto) => {
        setSelectedProducto(producto);
        setModalVisible(true);
    };

    const handleSubmit = async (values) => {
        try {
            if (selectedProducto) {
                await ProductoService.update(selectedProducto.id, values);
            } else {
                await ProductoService.create(values);
            }
            setModalVisible(false);
            setSelectedProducto(null);
            message.success(`Producto ${selectedProducto ? 'actualizado' : 'creado'} exitosamente`);
        } catch (error) {
            message.error('Error al guardar el producto: ' + error.message);
            throw error; // Re-throw para que el formulario pueda manejarlo
        }
    };

    return (
        <Layout>
            <Content style={{ padding: '20px' }}>
                <ProductoList onEdit={handleEdit} />
                
                <Modal
                    title={selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
                    open={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedProducto(null);
                    }}
                    footer={null}
                    width={800}
                >
                    <ProductoForm
                        producto={selectedProducto}
                        onSubmit={handleSubmit}
                        categorias={categorias}
                        marcas={marcas}
                    />
                </Modal>
            </Content>
        </Layout>
    );
};

export default GestionProductos;
