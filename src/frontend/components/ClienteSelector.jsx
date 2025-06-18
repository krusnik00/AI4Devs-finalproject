import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  Text,
  Flex,
  Badge,
  IconButton,
  Spinner,
  Button,
  Collapse,
  useOutsideClick,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Divider
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  CloseIcon, 
  AddIcon, 
  ChevronDownIcon, 
  ChevronUpIcon
} from '@chakra-ui/icons';
import { clienteService } from '../services/cliente.service';
import ClienteForm from './ClienteForm';

const ClienteSelector = ({ onClienteSelect, clienteSeleccionado, disabled = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const searchBoxRef = useRef(null);
  
  // Modal para crear nuevo cliente
  const { 
    isOpen: isFormOpen, 
    onOpen: onFormOpen, 
    onClose: onFormClose 
  } = useDisclosure();
  
  // Modal para ver detalles del cliente seleccionado
  const { 
    isOpen: isDetailsOpen, 
    onOpen: onDetailsOpen, 
    onClose: onDetailsClose 
  } = useDisclosure();
  
  useOutsideClick({
    ref: searchBoxRef,
    handler: () => setIsSearchOpen(false),
  });
  
  // Buscar clientes
  const searchClientes = async (query) => {
    if (!query || query.length < 2) {
      setClientes([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await clienteService.searchClientes(query);
      setClientes(results);
    } catch (error) {
      console.error("Error buscando clientes:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Efecto para busqueda con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (isSearchOpen && searchQuery.length >= 2) {
        searchClientes(searchQuery);
      }
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, isSearchOpen]);
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  };
  
  const handleClienteSelect = (cliente) => {
    onClienteSelect(cliente);
    setSearchQuery('');
    setIsSearchOpen(false);
  };
  
  const handleClearSelection = () => {
    onClienteSelect(null);
  };
  
  const handleCreateCliente = async (clienteData) => {
    try {
      const response = await clienteService.createCliente(clienteData);
      onClienteSelect(response.cliente);
      onFormClose();
    } catch (error) {
      console.error("Error creando cliente:", error);
      // Aquí se manejaría el error, tal vez con un toast
    }
  };
  
  return (
    <>
      <Box position="relative" ref={searchBoxRef}>
        {clienteSeleccionado ? (
          // Mostrar cliente seleccionado
          <Flex
            p={2}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
          >
            <VStack spacing={0} align="start">
              <Flex alignItems="center">
                <Text fontWeight="medium">{clienteSeleccionado.nombre}</Text>
                <Badge ml={2} colorScheme={clienteSeleccionado.tipo === 'empresa' ? 'purple' : 'blue'} size="sm">
                  {clienteSeleccionado.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                </Badge>
              </Flex>
              {clienteSeleccionado.rfc && (
                <Text fontSize="sm" color="gray.600">RFC: {clienteSeleccionado.rfc}</Text>
              )}
            </VStack>
            
            <Flex>
              <Button size="sm" variant="ghost" onClick={onDetailsOpen} mr={1}>
                Detalles
              </Button>
              {!disabled && (
                <IconButton
                  size="sm"
                  aria-label="Limpiar selección"
                  icon={<CloseIcon />}
                  onClick={handleClearSelection}
                  variant="ghost"
                />
              )}
            </Flex>
          </Flex>
        ) : (
          // Input de búsqueda
          <InputGroup>
            <Input
              placeholder="Buscar cliente por nombre, RFC o teléfono..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => {
                if (searchQuery.length >= 2) {
                  setIsSearchOpen(true);
                }
              }}
              disabled={disabled}
            />
            <InputRightElement>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <SearchIcon color="gray.500" />
              )}
            </InputRightElement>
          </InputGroup>
        )}
        
        {/* Lista de resultados */}
        <Collapse in={isSearchOpen} animateOpacity>
          <List
            position="absolute"
            width="100%"
            bg="white"
            boxShadow="md"
            borderRadius="md"
            mt={1}
            maxHeight="300px"
            overflowY="auto"
            zIndex={10}
            borderWidth="1px"
          >
            {clientes.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text mb={2}>No se encontraron resultados</Text>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  colorScheme="blue"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onFormOpen();
                  }}
                >
                  Crear Nuevo Cliente
                </Button>
              </Box>
            ) : (
              <>
                {clientes.map((cliente) => (
                  <ListItem 
                    key={cliente.id}
                    p={2}
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => handleClienteSelect(cliente)}
                    borderBottomWidth="1px"
                  >
                    <Flex justifyContent="space-between">
                      <Box>
                        <Text fontWeight="medium">{cliente.nombre}</Text>
                        {cliente.rfc && <Text fontSize="sm">RFC: {cliente.rfc}</Text>}
                        {cliente.contacto && <Text fontSize="sm">{cliente.contacto}</Text>}
                      </Box>
                      <Badge alignSelf="center" colorScheme={cliente.tipo === 'empresa' ? 'purple' : 'blue'}>
                        {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                      </Badge>
                    </Flex>
                  </ListItem>
                ))}
                <Box p={2} textAlign="center" bg="gray.50">
                  <Button
                    leftIcon={<AddIcon />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => {
                      setIsSearchOpen(false);
                      onFormOpen();
                    }}
                  >
                    Crear Nuevo Cliente
                  </Button>
                </Box>
              </>
            )}
          </List>
        </Collapse>
      </Box>
      
      {/* Modal para crear nuevo cliente */}
      <ClienteForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        onSubmit={handleCreateCliente}
      />
      
      {/* Modal para ver detalles del cliente */}
      {clienteSeleccionado && (
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Detalle del Cliente
              <Badge ml={2} colorScheme={clienteSeleccionado.tipo === 'empresa' ? 'purple' : 'blue'}>
                {clienteSeleccionado.tipo === 'empresa' ? 'Empresa' : 'Particular'}
              </Badge>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{clienteSeleccionado.nombre}</Text>
                </Box>
                
                <Divider />
                
                {clienteSeleccionado.rfc && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.500">RFC</Text>
                    <Text>{clienteSeleccionado.rfc}</Text>
                  </Box>
                )}
                
                {clienteSeleccionado.correo && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.500">Correo Electrónico</Text>
                    <Text>{clienteSeleccionado.correo}</Text>
                  </Box>
                )}
                
                {clienteSeleccionado.telefono && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.500">Teléfono</Text>
                    <Text>{clienteSeleccionado.telefono}</Text>
                  </Box>
                )}
                
                {clienteSeleccionado.direccion && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.500">Dirección</Text>
                    <Text>{clienteSeleccionado.direccion}</Text>
                    {(clienteSeleccionado.ciudad || clienteSeleccionado.estado) && (
                      <Text>
                        {clienteSeleccionado.ciudad}{clienteSeleccionado.ciudad && clienteSeleccionado.estado ? ', ' : ''}
                        {clienteSeleccionado.estado}
                        {clienteSeleccionado.codigo_postal ? ` C.P. ${clienteSeleccionado.codigo_postal}` : ''}
                      </Text>
                    )}
                  </Box>
                )}
                
                {(clienteSeleccionado.limite_credito > 0) && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.500">Información de Crédito</Text>
                    <Text>Límite: ${clienteSeleccionado.limite_credito.toFixed(2)}</Text>
                    <Text>Días de crédito: {clienteSeleccionado.dias_credito}</Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ClienteSelector;
