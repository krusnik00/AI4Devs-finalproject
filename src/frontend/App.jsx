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
import Login from './components/Login';
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
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes with MainLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="ventas/pos" element={<PuntoVenta />} />
              {/* Customer Management Routes */}
            <Route path="clientes">
              <Route index element={<ClientesList />} />
              <Route path=":id" element={<ClienteDetalle />} />
              <Route path=":id/historial" element={<ClienteHistorial />} />
            </Route>
            
            {/* Returns and Exchanges Routes */}
            <Route path="devoluciones">
              <Route index element={<DevolucionesList />} />
              <Route path="nueva" element={<DevolucionForm />} />
              <Route path=":id" element={<DevolucionDetalle />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
