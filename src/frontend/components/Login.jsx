import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import authService from '../services/auth.service';
import { setAuthToken, isAuthenticated } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      console.log('Respuesta del login:', response);
      
      const { token, usuario } = response;
      
      if (!token) {
        throw new Error('No se recibió el token de autenticación');
      }

      // Guardar el token
      setAuthToken(token);
      
      // Verificar que el token se guardó correctamente
      if (!isAuthenticated()) {
        throw new Error('Error al guardar el token de autenticación');
      }

      // Mostrar mensaje de éxito
      toast({
        title: '¡Bienvenido!',
        description: `Hola ${usuario?.nombre || ''}! Has iniciado sesión correctamente.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      // Redirigir
      const from = location.state?.from?.pathname || '/';
      console.log('Redirigiendo a:', from);
      navigate(from, { replace: true });

    } catch (err) {
      console.error('Error en el login:', err);
      const message = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      
      setError(message);
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autenticado, redirigir inmediatamente
  useEffect(() => {
    if (isAuthenticated()) {
      console.log('Usuario ya autenticado, redirigiendo...');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Iniciar Sesión</Heading>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={loading}
                loadingText="Iniciando sesión..."
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
