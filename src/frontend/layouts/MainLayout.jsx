import React, { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Image,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  Heading,
  Tooltip
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  BellIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { FaHome, FaShoppingCart, FaCar, FaBoxes, FaUsers, FaChartBar, FaFileInvoiceDollar, FaTools } from 'react-icons/fa';
import { removeAuthToken } from '../utils/auth';
import { devolucionService } from '../services/devolucion.service';

const MainLayout = () => {
  const { isOpen, onToggle } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const [devolucionesPendientes, setDevolucionesPendientes] = useState(0);
  
  // Cargar conteo de devoluciones pendientes
  useEffect(() => {
    const cargarDevolucionesPendientes = async () => {
      try {
        const count = await devolucionService.getDevolucionesPendientesCount();
        setDevolucionesPendientes(count);
      } catch (error) {
        console.error('Error al cargar devoluciones pendientes:', error);
      }
    };
    
    cargarDevolucionesPendientes();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarDevolucionesPendientes, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        position="fixed"
        width="100%"
        zIndex="1000"
      >
        <Flex
          color={useColorModeValue('gray.600', 'white')}
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          align={'center'}
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <Text
              textAlign={{ base: 'center', md: 'left' }}
              fontFamily={'heading'}
              fontWeight="bold"
              color={useColorModeValue('gray.800', 'white')}
              fontSize="lg"
              as={RouterLink}
              to="/"
            >
              Auto-Parts System
            </Text>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav devolucionesPendientes={devolucionesPendientes} />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={2}
            align="center"
          >
            <Tooltip label={`${devolucionesPendientes} devoluciones pendientes`} isDisabled={devolucionesPendientes === 0}>
              <Box position="relative" display="inline-block">
                <IconButton
                  aria-label='Notifications'
                  icon={<BellIcon />}
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/devoluciones')}
                />
                {devolucionesPendientes > 0 && (
                  <Badge 
                    colorScheme="red" 
                    position="absolute" 
                    top="-6px" 
                    right="-6px" 
                    borderRadius="full"
                  >
                    {devolucionesPendientes}
                  </Badge>
                )}
              </Box>
            </Tooltip>

            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar size="sm" name="Admin User" bg="blue.500" />
              </MenuButton>
              <MenuList zIndex="10000">
                <MenuItem icon={<SettingsIcon />}>Configuración</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav devolucionesPendientes={devolucionesPendientes} />
        </Collapse>
      </Box>

      <Box pt={'60px'}>
        <Outlet />
      </Box>
    </Box>
  );
};

const DesktopNav = ({ devolucionesPendientes }) => {
  const location = useLocation();
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                p={2}
                as={RouterLink}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={location.pathname === navItem.href ? 'blue.500' : linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
                display="flex"
                alignItems="center"
              >
                {navItem.icon && <Icon as={navItem.icon} mr={1} />}
                {navItem.label}
                {navItem.showDevolucionesBadge && devolucionesPendientes > 0 && (
                  <Badge colorScheme="red" ml={1} borderRadius="full">
                    {devolucionesPendientes}
                  </Badge>
                )}
                {navItem.children && (
                  <Icon as={ChevronDownIcon} ml={1} w={4} h={4} />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel, icon }) => {
  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <HStack>
            {icon && <Icon as={icon} />}
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'blue.500' }}
              fontWeight={500}
            >
              {label}
            </Text>
          </HStack>
          <Text fontSize={'sm'} color="gray.500">{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'blue.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ devolucionesPendientes }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem 
          key={navItem.label} 
          {...navItem} 
          devolucionesPendientes={navItem.showDevolucionesBadge ? devolucionesPendientes : 0} 
        />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, icon, devolucionesPendientes }) => {
  const { isOpen, onToggle } = useDisclosure();
  const location = useLocation();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
        color={location.pathname === href ? 'blue.500' : 'inherit'}
      >
        <HStack>
          {icon && <Icon as={icon} />}
          <Text fontWeight={600}>
            {label}
          </Text>
          {devolucionesPendientes > 0 && (
            <Badge colorScheme="red" borderRadius="full">
              {devolucionesPendientes}
            </Badge>
          )}
        </HStack>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                py={2}
                as={RouterLink}
                to={child.href}
                color={location.pathname === child.href ? 'blue.500' : 'inherit'}
              >
                <HStack>
                  {child.icon && <Icon as={child.icon} />}
                  <Text>{child.label}</Text>
                </HStack>
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: FaHome,
  },
  {
    label: 'Ventas',
    icon: FaShoppingCart,
    showDevolucionesBadge: true,
    children: [
      {
        label: 'Punto de Venta',
        subLabel: 'Procesamiento de ventas',
        href: '/ventas/pos',
        icon: FaFileInvoiceDollar,
      },
      {
        label: 'Historial Ventas',
        subLabel: 'Consultar ventas realizadas',
        href: '/ventas',
        icon: FaFileInvoiceDollar,
      },
      {
        label: 'Devoluciones',
        subLabel: 'Gestión de devoluciones y cambios',
        href: '/devoluciones',
        icon: FaFileInvoiceDollar,
        showDevolucionesBadge: true,
      },
    ],
  },
  {
    label: 'Inventario',
    icon: FaBoxes,
    children: [
      {
        label: 'Productos',
        subLabel: 'Gestión de productos',
        href: '/productos',
        icon: FaCar,
      },
      {
        label: 'Ajustes Inventario',
        subLabel: 'Entradas y salidas manuales',
        href: '/inventario/ajustes',
        icon: FaTools,
      },
      {
        label: 'Alertas Stock',
        subLabel: 'Productos con bajo stock',
        href: '/inventario/alertas',
        icon: FaTools,
      },
    ],
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: FaUsers,
  },
  {
    label: 'Analítica',
    href: '/analisis',
    icon: FaChartBar,
  },
];

export default MainLayout;
