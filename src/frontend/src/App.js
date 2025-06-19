import React from 'react';
import {
  ChakraProvider,
  Box,
  theme,
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PuntoVenta from './components/PuntoVenta';
import Clientes from './components/Clientes';
import Devoluciones from './components/Devoluciones';

// Componente protegido
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh">
          <Routes>
            {/* Ruta pública de login */}
            <Route 
              path="/login" 
              element={
                isAuthenticated() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              }
            />

            {/* Rutas protegidas dentro del MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Redirigir / a /dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="punto-venta" element={<PuntoVenta />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="devoluciones" element={<Devoluciones />} />
            </Route>

            {/* Ruta por defecto - redirige a dashboard si está autenticado, o a login si no */}
            <Route
              path="*"
              element={
                isAuthenticated() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
