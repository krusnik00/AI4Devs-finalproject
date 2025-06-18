import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, List, Button, Progress, Spin, Alert, Typography } from 'antd';
import { WarningOutlined, ArrowDownOutlined, FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const StockAlertWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertData, setAlertData] = useState({
    resumen: {
      total_productos_bajo_stock: 0,
      stock_critico: 0,
      stock_medio: 0,
      stock_bajo: 0,
      valoracion_faltante: 0
    },
    productos_urgentes: []
  });

  useEffect(() => {
    const fetchAlertData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/alertas-stock/resumen');
        setAlertData(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar alertas de stock');
        console.error('Error al cargar alertas de stock:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertData();
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchAlertData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('/api/alertas-stock/reporte', {
        params: { formato: 'excel' }
      });
      
      // Abrir el archivo en una nueva pestaña
      window.open(response.data.url, '_blank');
    } catch (err) {
      setError('Error al generar reporte');
      console.error('Error al generar reporte:', err);
    }
  };

  const getCriticalityColor = (nivel) => {
    switch(nivel) {
      case 'alto': return '#f5222d';
      case 'medio': return '#fa8c16';
      case 'bajo': return '#faad14';
      default: return '#52c41a';
    }
  };

  if (loading) return (
    <Card title="Alertas de Inventario" bordered={false}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" />
        <p>Cargando alertas de inventario...</p>
      </div>
    </Card>
  );

  if (error) return (
    <Card title="Alertas de Inventario" bordered={false}>
      <Alert message="Error" description={error} type="error" showIcon />
    </Card>
  );

  const { resumen, productos_urgentes } = alertData;

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ fontSize: '18px', color: '#faad14', marginRight: '8px' }} />
          <span>Alertas de Stock Bajo</span>
        </div>
      }
      extra={
        <Button 
          type="primary" 
          icon={<FileExcelOutlined />} 
          onClick={handleGenerateReport}
        >
          Generar Reporte
        </Button>
      }
      bordered={false}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Badge count={resumen.total_productos_bajo_stock} overflowCount={999} style={{ backgroundColor: '#faad14' }} />
            <div style={{ marginTop: '10px' }}>
              <Text strong>Total Productos</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#fff2f0' }}>
            <Badge count={resumen.stock_critico} overflowCount={999} style={{ backgroundColor: '#f5222d' }} />
            <div style={{ marginTop: '10px' }}>
              <Text type="danger" strong>Stock Crítico</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
            <Badge count={resumen.stock_medio} overflowCount={999} style={{ backgroundColor: '#fa8c16' }} />
            <div style={{ marginTop: '10px' }}>
              <Text type="warning" strong>Stock Medio</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#fffbe6' }}>
            <Badge count={resumen.stock_bajo} overflowCount={999} style={{ backgroundColor: '#faad14' }} />
            <div style={{ marginTop: '10px' }}>
              <Text strong>Stock Bajo</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '16px' }}>
        <Title level={5}>Productos Urgentes para Reabastecer</Title>
        <List
          size="small"
          dataSource={productos_urgentes}
          renderItem={item => (
            <List.Item
              actions={[
                <Text type="secondary">{`${item.stock_actual} / ${item.stock_minimo}`}</Text>
              ]}
            >
              <List.Item.Meta
                title={
                  <div>
                    <Badge color={getCriticalityColor(item.stock_actual === 0 ? 'alto' : 'medio')} />
                    {item.nombre}
                  </div>
                }
                description={`${item.marca?.nombre || ''} - ${item.categoria?.nombre || ''}`}
              />
              <Progress 
                percent={item.stock_actual / item.stock_minimo * 100} 
                showInfo={false}
                strokeColor={getCriticalityColor(item.stock_actual === 0 ? 'alto' : 'medio')}
                size="small" 
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Button type="link" href="#/inventario/stock-bajo">
          Ver todos los productos con stock bajo <ArrowDownOutlined />
        </Button>
      </div>
    </Card>
  );
};

export default StockAlertWidget;
