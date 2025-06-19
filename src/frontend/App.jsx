import React from 'react';
import {
  ChakraProvider,
  Box,
  theme
} from '@chakra-ui/react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate,
  createRoutesFromElements
} from 'react-router-dom';
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

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Box minH="100vh">
          <Routes>
            {/* Ruta pública de login */}
            <Route 
              path="/login" 
              element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
            />

            {/* Rutas protegidas */}
            <Route
              path="/"
              element={!isAuthenticated() ? <Navigate to="/login" replace /> : <MainLayout />}
            >
              {/* Dashboard como ruta principal */}
              <Route index element={<Dashboard />} />

              {/* Rutas de punto de venta */}
              <Route path="punto-venta" element={<PuntoVenta />} />

              {/* Rutas de clientes */}
              <Route path="clientes">
                <Route index element={<ClientesList />} />
                <Route path=":id">
                  <Route index element={<ClienteDetalle />} />
                  <Route path="historial" element={<ClienteHistorial />} />
                </Route>
              </Route>

              {/* Rutas de devoluciones */}
              <Route path="devoluciones">
                <Route index element={<DevolucionesList />} />
                <Route path="nueva" element={<DevolucionForm />} />
                <Route path=":id" element={<DevolucionDetalle />} />
              </Route>

              {/* Redireccionar rutas no encontradas al dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Box>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;
