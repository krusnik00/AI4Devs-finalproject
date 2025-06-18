import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Flex, 
  Input, 
  Select, 
  IconButton,
  Badge,
  Text,
  useDisclosure,
  useToast,
  Spinner,
  HStack,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Tag
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  InfoIcon,
  DownloadIcon,
  RepeatIcon,
  HamburgerIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../services/cliente.service';
import ClienteForm from './ClienteForm';

const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [totalClientes, setTotalClientes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    nombre: '',
    tipo: '',
    activo: ''
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  // Cargar clientes
  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        pagina: currentPage,
        limite: pageSize,
        ordenarPor: 'nombre',
        orden: 'ASC'
      });
      
      // Añadir filtros si tienen valor
      if (filters.nombre) params.append('nombre', filters.nombre);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.activo !== '') params.append('activo', filters.activo);
      
      const response = await clienteService.getClientes(params);
      
      setClientes(response.clientes);
      setTotalClientes(response.total);
      setTotalPages(response.totalPaginas);
      setCurrentPage(response.pagina);
    } catch (err) {
      setError('Error al cargar la lista de clientes');
      console.error('Error cargando clientes:', err);
      
      toast({
        title: 'Error',
        description: 'No se pudo cargar la lista de clientes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar clientes al montar o cambiar filtros/paginación
  useEffect(() => {
    loadClientes();
  }, [currentPage, pageSize, filters.tipo, filters.activo]);

  // Buscar por nombre con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      loadClientes();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.nombre]);

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Manejar filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Resetear a la primera página al filtrar
  };

  // Manejar acciones de cliente
  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    onOpen();
  };

  const handleView = (clienteId) => {
    navigate(`/clientes/${clienteId}`);
  };

  const handleViewHistorial = (clienteId) => {
    navigate(`/clientes/${clienteId}/historial`);
  };

  const handleDelete = async (clienteId) => {
    if (window.confirm('¿Estás seguro que deseas desactivar este cliente?')) {
      try {
        await clienteService.deactivateCliente(clienteId);
        
        toast({
          title: 'Cliente desactivado',
          description: 'El cliente ha sido desactivado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        loadClientes(); // Recargar lista
      } catch (error) {
        console.error('Error al desactivar cliente:', error);
        
        toast({
          title: 'Error',
          description: 'No se pudo desactivar el cliente',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleFormSubmit = async (cliente) => {
    try {
      if (selectedCliente) {
        await clienteService.updateCliente(selectedCliente.id, cliente);
        toast({
          title: 'Cliente actualizado',
          description: 'El cliente ha sido actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await clienteService.createCliente(cliente);
        toast({
          title: 'Cliente creado',
          description: 'El cliente ha sido creado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
      setSelectedCliente(null);
      loadClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar el cliente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Gestión de Clientes</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue"
          onClick={() => {
            setSelectedCliente(null);
            onOpen();
          }}
        >
          Nuevo Cliente
        </Button>
      </Flex>

      <Box mb={6} bg="white" p={4} borderRadius="md" boxShadow="sm">
        <Heading size="sm" mb={3}>Filtros</Heading>
        <Flex gap={4} flexWrap="wrap">
          <FormControl maxW="300px">
            <FormLabel fontSize="sm">Buscar</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <SearchIcon color='gray.300' />
              </InputLeftElement>
              <Input
                name="nombre"
                value={filters.nombre}
                onChange={handleFilterChange}
                placeholder="Nombre, RFC, teléfono..."
                size="md"
              />
            </InputGroup>
          </FormControl>

          <FormControl maxW="200px">
            <FormLabel fontSize="sm">Tipo</FormLabel>
            <Select 
              name="tipo" 
              value={filters.tipo}
              onChange={handleFilterChange}
              size="md"
            >
              <option value="">Todos</option>
              <option value="particular">Particular</option>
              <option value="empresa">Empresa</option>
            </Select>
          </FormControl>

          <FormControl maxW="200px">
            <FormLabel fontSize="sm">Estado</FormLabel>
            <Select 
              name="activo" 
              value={filters.activo}
              onChange={handleFilterChange}
              size="md"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </Select>
          </FormControl>

          <FormControl alignSelf="end">
            <Button
              leftIcon={<RepeatIcon />}
              onClick={() => {
                setFilters({
                  nombre: '',
                  tipo: '',
                  activo: ''
                });
                setCurrentPage(1);
              }}
              size="md"
            >
              Limpiar
            </Button>
          </FormControl>
        </Flex>
      </Box>

      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Box textAlign="center" py={10}>
          <Text color="red.500">{error}</Text>
          <Button
            mt={4}
            leftIcon={<RepeatIcon />}
            onClick={loadClientes}
          >
            Reintentar
          </Button>
        </Box>
      ) : (
        <>
          <Box overflowX="auto">
            <Table variant="simple" bg="white">
              <Thead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Tipo</Th>
                  <Th>RFC</Th>
                  <Th>Contacto</Th>
                  <Th>Estado</Th>
                  <Th width="120px" textAlign="center">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {clientes.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={6}>
                      No se encontraron clientes con los filtros seleccionados
                    </Td>
                  </Tr>
                ) : (
                  clientes.map(cliente => (
                    <Tr key={cliente.id}>
                      <Td>
                        <Text fontWeight="medium">
                          {cliente.tipo === 'empresa' 
                            ? cliente.empresa 
                            : `${cliente.nombre} ${cliente.apellido || ''}`}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={cliente.tipo === 'empresa' ? 'purple' : 'blue'}>
                          {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                        </Badge>
                      </Td>
                      <Td>{cliente.rfc || '-'}</Td>
                      <Td>
                        <Text fontSize="sm">{cliente.correo || '-'}</Text>
                        <Text fontSize="sm">{cliente.telefono || '-'}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={cliente.activo ? 'green' : 'red'}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label='Opciones'
                            icon={<HamburgerIcon />}
                            variant='outline'
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem 
                              icon={<InfoIcon />} 
                              onClick={() => handleView(cliente.id)}
                            >
                              Ver detalles
                            </MenuItem>
                            <MenuItem 
                              icon={<EditIcon />} 
                              onClick={() => handleEdit(cliente)}
                            >
                              Editar
                            </MenuItem>
                            <MenuItem 
                              icon={<ExternalLinkIcon />} 
                              onClick={() => handleViewHistorial(cliente.id)}
                            >
                              Historial de compras
                            </MenuItem>
                            <Divider />
                            <MenuItem 
                              icon={<DeleteIcon />} 
                              color="red.500"
                              isDisabled={!cliente.activo}
                              onClick={() => handleDelete(cliente.id)}
                            >
                              Desactivar
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Paginación */}
          <Flex justify="space-between" align="center" mt={4}>
            <Text fontSize="sm">
              Mostrando {clientes.length} de {totalClientes} clientes
            </Text>
            <HStack>
              <Select 
                size="sm" 
                width="80px" 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
              
              <HStack>
                <IconButton
                  size="sm"
                  icon={<ChevronLeftIcon />}
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                  aria-label="Página anterior"
                />
                <Text fontSize="sm">
                  Página {currentPage} de {totalPages}
                </Text>
                <IconButton
                  size="sm"
                  icon={<ChevronRightIcon />}
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                  aria-label="Página siguiente"
                />
              </HStack>
            </HStack>
          </Flex>
        </>
      )}

      {/* Modal de Formulario */}
      <ClienteForm
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedCliente(null);
        }}
        onSubmit={handleFormSubmit}
        cliente={selectedCliente}
      />
    </Box>
  );
};

export default ClientesList;
