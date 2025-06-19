import React from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  VStack,
  Grid,
  theme
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import Dashboard from './components/Dashboard';
import PuntoVenta from './components/PuntoVenta';
import Login from './components/Login'; // Ya está apuntando al Login correcto
import ClientesList from './components/ClientesList';
import ClienteDetalle from './components/ClienteDetalle';
import ClienteHistorial from './components/ClienteHistorial';
import DevolucionesList from './components/DevolucionesList';
import DevolucionForm from './components/DevolucionForm';
import DevolucionDetalle from './components/DevolucionDetalle';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh">
          <Routes>
            {/* Ruta de login pública */}
            <Route path="/login" element={
              isAuthenticated() ? <Navigate to="/" /> : <Login />
            } />
            
            {/* Rutas protegidas dentro del layout principal */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="punto-venta" element={<PuntoVenta />} />
              <Route path="clientes" element={<ClientesList />} />
              <Route path="clientes/:id" element={<ClienteDetalle />} />
              <Route path="clientes/:id/historial" element={<ClienteHistorial />} />
              <Route path="devoluciones" element={<DevolucionesList />} />
              <Route path="devoluciones/nueva" element={<DevolucionForm />} />
              <Route path="devoluciones/:id" element={<DevolucionDetalle />} />
              {/* Redirigir rutas no encontradas al dashboard */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
