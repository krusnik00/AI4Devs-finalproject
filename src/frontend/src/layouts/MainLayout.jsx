import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Container,
  Stack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { removeAuthToken } from '../utils/auth';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onToggle } = useDisclosure();
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/punto-venta', label: 'Punto de Venta' },
    { path: '/clientes', label: 'Clientes' },
    { path: '/devoluciones', label: 'Devoluciones' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };
  
  const handleLogout = () => {
    removeAuthToken();
    navigate('/login', { replace: true });
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Navbar */}
      <Box bg={useColorModeValue('white', 'gray.800')} px={4} boxShadow="sm">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            color="blue.500"
            cursor="pointer"
            onClick={() => navigate('/dashboard')}
          >
            Sistema de Gestión
          </Text>

          <Flex alignItems="center">
            <Stack direction="row" spacing={7}>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="ghost"
                >
                  Menú
                </MenuButton>
                <MenuList>
                  {menuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      bg={location.pathname === item.path ? 'blue.50' : 'transparent'}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout} color="red.500">
                    Cerrar Sesión
                  </MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>

      {/* Contenido principal */}
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default MainLayout;
