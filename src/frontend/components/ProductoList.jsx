import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Input, message, Popconfirm, Tag, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ProductoService from '../services/producto.service';

const { Search } = Input;

const ProductoList = ({ onEdit }) => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const loadProductos = async () => {
        try {
            setLoading(true);
            const data = await ProductoService.getAll();
            setProductos(data);
        } catch (error) {
            message.error('Error al cargar los productos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProductos();
    }, []);

    const handleDelete = async (id) => {
        try {
            await ProductoService.delete(id);
            message.success('Producto eliminado exitosamente');
            loadProductos();
        } catch (error) {
            message.error('Error al eliminar el producto: ' + error.message);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const columns = [
        {
            title: 'Imagen',
            dataIndex: 'imagen_url',
            key: 'imagen_url',
            width: 100,
            render: (url) => (
                url ? (
                    <Image
                        src={url}
                        alt="Producto"
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                ) : 'Sin imagen'
            ),
        },
        {
            title: 'Código',
            dataIndex: 'codigo',
            key: 'codigo',
            width: 120,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 150,
        },
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => a.nombre.localeCompare(b.nombre),
        },
        {
            title: 'Stock',
            dataIndex: 'stock_actual',
            key: 'stock_actual',
            width: 100,
            render: (stock, record) => (
                <Tag color={stock <= record.stock_minimo ? 'red' : 'green'}>
                    {stock}
                </Tag>
            ),
        },
        {
            title: 'Precio Venta',
            dataIndex: 'precio_venta',
            key: 'precio_venta',
            width: 120,
            render: (precio) => `$${precio.toFixed(2)}`,
            sorter: (a, b) => a.precio_venta - b.precio_venta,
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={status === 'activo' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="¿Estás seguro de eliminar este producto?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredProductos = productos.filter(producto =>
        Object.values(producto)
            .join(' ')
            .toLowerCase()
            .includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Search
                    placeholder="Buscar productos..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => onEdit(null)}
                >
                    Nuevo Producto
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={filteredProductos}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1300 }}
            />
        </div>
    );
};

export default ProductoList;
