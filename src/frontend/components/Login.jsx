import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Image,
  Text,
  FormErrorMessage,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { setAuthToken } from '../utils/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setLoginError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      // Guardar el token de autenticación
      setAuthToken(response.data.token);
      
      // Mostrar mensaje de éxito
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirigir al dashboard
      navigate('/');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      // Mostrar mensaje de error
      setLoginError(
        error.response?.data?.message || 
        'Error al iniciar sesión. Compruebe sus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
      <Flex flex={1}>
        <Image
          alt={'Login Image'}
          objectFit={'cover'}
          src={'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1974&auto=format&fit=crop'}
        />
      </Flex>
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={6} w={'full'} maxW={'md'}>
          <Heading fontSize={'2xl'}>Sistema de Gestión para Refaccionaria</Heading>
          
          {loginError && (
            <Alert status="error">
              <AlertIcon />
              {loginError}
            </Alert>
          )}
          
          <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Correo electrónico</FormLabel>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <Stack spacing={6}>
                <Button
                  type="submit"
                  colorScheme={'blue'}
                  variant={'solid'}
                  isLoading={loading}
                  loadingText="Iniciando sesión"
                >
                  Iniciar sesión
                </Button>
                
                <Text align={'center'} fontSize="sm" color="gray.500">
                  Para propósitos de demostración, use:<br />
                  admin@example.com / admin123
                </Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default Login;
