import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
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
  AlertIcon,
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

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(formData.email, formData.password);
      console.log('Resultado del login:', result);

      if (!result || !result.token) {
        throw new Error('No se recibió el token de autenticación');
      }

      // Guardar el token
      setAuthToken(result.token);
      
      // Redirigir inmediatamente
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('Redirigiendo a:', from);
      navigate(from, { replace: true });
      
      // Mostrar mensaje de éxito
      toast({
        title: '¡Bienvenido!',
        description: result.usuario ? `Hola ${result.usuario.nombre}!` : 'Has iniciado sesión correctamente',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.response?.data?.message || err.message || 'Error al iniciar sesión');
      
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Heading size="xl">Iniciar Sesión</Heading>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg="white"
          boxShadow="lg"
          borderRadius="xl"
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  autoComplete="email"
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      onClick={() => setShowPassword((show) => !show)}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
                fontSize="md"
                isLoading={loading}
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
