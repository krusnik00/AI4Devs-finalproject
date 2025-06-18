import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Chip
} from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    ventasMensuales: [],
    productosPopulares: [],
    predicciones: [],
    stockBajo: [],
    comparativaProveedores: []
  });
  const [stockAlerts, setStockAlerts] = useState({
    resumen: {
      total_productos_bajo_stock: 0,
      stock_critico: 0,
      stock_medio: 0,
      stock_bajo: 0,
      valoracion_faltante: 0
    },
    productos_urgentes: []
  });
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [alertError, setAlertError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard');
        setLoading(false);
      }
    };
    
    const fetchStockAlerts = async () => {
      try {
        setLoadingAlerts(true);
        
        const response = await axios.get('/api/alertas-stock/resumen', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setStockAlerts(response.data);
        setAlertError(null);
      } catch (err) {
        console.error('Error al cargar alertas de stock:', err);
        setAlertError('No se pudieron cargar las alertas de stock');
      } finally {
        setLoadingAlerts(false);
      }
    };
    
    fetchDashboardData();
    fetchStockAlerts();
  }, []);

  const handleGenerateStockReport = async () => {
    try {
      const response = await axios.get('/api/alertas-stock/reporte', {
        params: { formato: 'excel' },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Abrir el archivo en una nueva pestaña
      window.open(response.data.url, '_blank');
    } catch (err) {
      console.error('Error al generar reporte:', err);
      // Mostrar mensaje de error
    }
  };

  // Preparar datos para gráfico de ventas mensuales
  const ventasChartData = {
    labels: dashboardData.ventasMensuales.map(venta => venta.mes),
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: dashboardData.ventasMensuales.map(venta => venta.total),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }
    ]
  };
  
  // Preparar datos para gráfico de productos populares
  const productosPopularesChartData = {
    labels: dashboardData.productosPopulares.map(producto => producto.nombre),
    datasets: [
      {
        label: 'Productos Más Vendidos',
        data: dashboardData.productosPopulares.map(producto => producto.cantidad),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Preparar datos para gráfico de predicciones
  const prediccionesChartData = {
    labels: ['Próximo Mes', 'En 2 Meses', 'En 3 Meses'],
    datasets: dashboardData.predicciones.slice(0, 5).map((producto, index) => ({
      label: producto.nombre,
      data: producto.prediccion_proximos_meses,
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ][index % 5],
      backgroundColor: 'transparent',
      tension: 0.1
    }))
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Gráfico de Ventas Mensuales */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ventas Mensuales
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={ventasChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Productos Populares */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productos Más Vendidos
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie 
                  data={productosPopularesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Predicción de Ventas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Predicción de Ventas (Próximos 3 meses)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={prediccionesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
          {/* Productos con Stock Bajo - Versión Mejorada */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Productos con Stock Bajo
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleGenerateStockReport}
                  disabled={loadingAlerts}
                >
                  Descargar Reporte
                </Button>
              </Box>
              
              {loadingAlerts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : alertError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {alertError}
                </Alert>
              ) : (
                <>
                  {/* Resumen de alertas */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      label={`Total: ${stockAlerts.resumen.total_productos_bajo_stock}`} 
                      color="default" 
                      size="small" 
                    />
                    <Chip 
                      label={`Crítico: ${stockAlerts.resumen.stock_critico}`} 
                      color="error" 
                      size="small" 
                    />
                    <Chip 
                      label={`Medio: ${stockAlerts.resumen.stock_medio}`} 
                      color="warning" 
                      size="small" 
                    />
                    <Chip 
                      label={`Bajo: ${stockAlerts.resumen.stock_bajo}`} 
                      color="info" 
                      size="small" 
                    />
                  </Box>
                  
                  {/* Lista de productos urgentes */}
                  <List>
                    {stockAlerts.productos_urgentes.length > 0 ? (
                      stockAlerts.productos_urgentes.map((producto) => (
                        <React.Fragment key={producto.id}>
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {producto.stock_actual === 0 ? (
                                    <Chip 
                                      label="CRÍTICO" 
                                      color="error" 
                                      size="small" 
                                      sx={{ mr: 1, fontSize: '0.7rem' }} 
                                    />
                                  ) : (
                                    <Chip 
                                      label="BAJO" 
                                      color="warning" 
                                      size="small" 
                                      sx={{ mr: 1, fontSize: '0.7rem' }} 
                                    />
                                  )}
                                  {producto.nombre}
                                </Box>
                              }
                              secondary={
                                <>
                                  {`Stock: ${producto.stock_actual} de ${producto.stock_minimo} (${producto.marca?.nombre || 'Sin marca'})`}
                                  <Box 
                                    sx={{
                                      width: '100%',
                                      height: '4px',
                                      backgroundColor: '#f5f5f5',
                                      mt: 0.5
                                    }}
                                  >
                                    <Box 
                                      sx={{
                                        width: `${producto.stock_actual / producto.stock_minimo * 100}%`,
                                        maxWidth: '100%',
                                        height: '100%',
                                        backgroundColor: producto.stock_actual === 0 ? 'error.main' : 'warning.main'
                                      }}
                                    />
                                  </Box>
                                </>
                              } 
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No hay productos con stock bajo" />
                      </ListItem>
                    )}
                  </List>
                  
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button size="small" href="#/inventario/stock-bajo">
                      Ver todos los productos con stock bajo
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Comparativa de Proveedores */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mejores Ofertas de Proveedores
              </Typography>
              <List>
                {dashboardData.comparativaProveedores.length > 0 ? (
                  dashboardData.comparativaProveedores.map((producto) => (
                    <React.Fragment key={producto.id}>
                      <ListItem>
                        <ListItemText 
                          primary={producto.nombre} 
                          secondary={`Mejor precio: $${producto.proveedor_recomendado.precio} (${producto.proveedor_recomendado.nombre})`} 
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay datos de comparativa de proveedores" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas de Stock Bajo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alertas de Stock Bajo
              </Typography>
              
              {loadingAlerts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : alertError ? (
                <Alert severity="error" sx={{ my: 2 }}>
                  {alertError}
                </Alert>
              ) : (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Resumen de Alertas:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary={`Total productos con stock bajo: ${stockAlerts.resumen.total_productos_bajo_stock}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Crítico: ${stockAlerts.resumen.stock_critico}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Medio: ${stockAlerts.resumen.stock_medio}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Bajo: ${stockAlerts.resumen.stock_bajo}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Valoración faltante: ${stockAlerts.resumen.valoracion_faltante}`} />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" gutterBottom>
                    Productos Urgentes:
                  </Typography>
                  {stockAlerts.productos_urgentes.length > 0 ? (
                    <List>
                      {stockAlerts.productos_urgentes.map(producto => (
                        <ListItem key={producto.id}>
                          <ListItemText 
                            primary={producto.nombre} 
                            secondary={`Stock actual: ${producto.stock_actual}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay productos urgentes por reabastecer.
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      onClick={handleGenerateStockReport}
                    >
                      Generar Reporte de Stock
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
