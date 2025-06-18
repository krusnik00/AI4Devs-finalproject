import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Button,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  useToast,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  EditIcon,
  ArrowBackIcon,
  CheckCircleIcon,
  WarningIcon,
  DeleteIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import { clienteService } from '../services/cliente.service';
import ClienteForm from './ClienteForm';
import { formatCurrency, formatDate } from '../utils/formatters';

const ClienteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  
  // Cargar datos del cliente
  const cargarCliente = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener datos básicos del cliente
      const clienteData = await clienteService.getClienteById(id);
      setCliente(clienteData);
      
      // Obtener estadísticas e historial
      const historialData = await clienteService.getClienteHistorial(id);
      setEstadisticas(historialData.estadisticas);
      
    } catch (err) {
      console.error('Error al cargar cliente:', err);
      setError('No se pudo cargar la información del cliente');
      
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del cliente',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar datos al montar el componente
  useEffect(() => {
    cargarCliente();
  }, [id]);
  
  // Desactivar cliente
  const handleDesactivarCliente = async () => {
    if (window.confirm('¿Estás seguro que deseas desactivar este cliente? No podrá realizar compras mientras esté desactivado.')) {
      try {
        await clienteService.deactivateCliente(id);
        
        toast({
          title: 'Cliente desactivado',
          description: 'El cliente ha sido desactivado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Recargar datos
        cargarCliente();
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
  
  // Actualizar cliente
  const handleFormSubmit = async (formData) => {
    try {
      await clienteService.updateCliente(id, formData);
      
      toast({
        title: 'Cliente actualizado',
        description: 'La información del cliente se ha actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onFormClose();
      cargarCliente();
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el cliente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Mostrar pantalla de carga
  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  // Mostrar error
  if (error) {
    return (
      <Box p={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="outline"
          mb={6}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
        
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }
  
  // Si no hay cliente
  if (!cliente) {
    return (
      <Box p={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="outline"
          mb={6}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
        
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Cliente no encontrado</AlertTitle>
          <AlertDescription>El cliente solicitado no existe o ha sido eliminado</AlertDescription>
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="outline"
        width="fit-content"
        mb={6}
        onClick={() => navigate('/clientes')}
      >
        Volver a Clientes
      </Button>
      
      {/* Cabecera con información básica */}
      <Flex 
        direction={{ base: "column", md: "row" }}
        justify="space-between" 
        align={{ base: "start", md: "center" }}
        bg="white" 
        p={6} 
        borderRadius="md"
        boxShadow="sm"
        mb={4}
      >
        <Box mb={{ base: 4, md: 0 }}>
          <Flex align="center" mb={1}>
            <Heading size="lg">
              {cliente.tipo === 'particular' 
                ? `${cliente.nombre} ${cliente.apellido || ''}` 
                : cliente.empresa}
            </Heading>
            <Badge ml={2} colorScheme={cliente.activo ? 'green' : 'red'}>
              {cliente.activo ? 'Activo' : 'Inactivo'}
            </Badge>
            <Badge ml={2} colorScheme={cliente.tipo === 'empresa' ? 'purple' : 'blue'}>
              {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
            </Badge>
          </Flex>
          {cliente.rfc && (
            <Text color="gray.600">RFC: {cliente.rfc}</Text>
          )}
        </Box>
        
        <HStack>
          <Button
            leftIcon={<EditIcon />}
            colorScheme="blue"
            onClick={onFormOpen}
          >
            Editar
          </Button>
          {cliente.activo && (
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              variant="outline"
              onClick={handleDesactivarCliente}
            >
              Desactivar
            </Button>
          )}
        </HStack>
      </Flex>
      
      {/* Pestañas de información */}
      <Tabs variant="enclosed" bg="white" borderRadius="md" boxShadow="sm">
        <TabList>
          <Tab>Información Personal</Tab>
          <Tab>Historial de Compras</Tab>
          <Tab>Crédito y Pagos</Tab>
        </TabList>
        
        <TabPanels>
          {/* Información Personal */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="sm" mb={2}>Información de Contacto</Heading>
                  <Divider mb={3} />
                  
                  {cliente.correo && (
                    <Flex mb={2}>
                      <Text width="120px" fontWeight="medium">Correo:</Text>
                      <Text>{cliente.correo}</Text>
                    </Flex>
                  )}
                  
                  {cliente.telefono && (
                    <Flex mb={2}>
                      <Text width="120px" fontWeight="medium">Teléfono:</Text>
                      <Text>{cliente.telefono}</Text>
                    </Flex>
                  )}
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Dirección</Heading>
                  <Divider mb={3} />
                  
                  {cliente.direccion ? (
                    <>
                      <Text>{cliente.direccion}</Text>
                      <Text>
                        {cliente.ciudad}{cliente.ciudad && cliente.estado ? ', ' : ''}
                        {cliente.estado}
                      </Text>
                      {cliente.codigo_postal && <Text>C.P. {cliente.codigo_postal}</Text>}
                    </>
                  ) : (
                    <Text color="gray.500">No se ha registrado una dirección</Text>
                  )}
                </Box>
              </VStack>
              
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="sm" mb={2}>Información Adicional</Heading>
                  <Divider mb={3} />
                  
                  <Flex mb={2}>
                    <Text width="120px" fontWeight="medium">Creado:</Text>
                    <Text>{formatDate(cliente.created_at)}</Text>
                  </Flex>
                  
                  <Flex mb={2}>
                    <Text width="120px" fontWeight="medium">Última Act.:</Text>
                    <Text>{formatDate(cliente.updated_at)}</Text>
                  </Flex>
                </Box>
                
                {cliente.notas && (
                  <Box>
                    <Heading size="sm" mb={2}>Notas</Heading>
                    <Divider mb={3} />
                    <Text>{cliente.notas}</Text>
                  </Box>
                )}
              </VStack>
            </SimpleGrid>
          </TabPanel>
          
          {/* Historial de Compras */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total de Compras</StatLabel>
                    <StatNumber>{estadisticas?.total_compras || 0}</StatNumber>
                    <StatHelpText>Transacciones</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Gasto Total</StatLabel>
                    <StatNumber>{formatCurrency(estadisticas?.gasto_total || 0)}</StatNumber>
                    <StatHelpText>Acumulado</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Promedio por Compra</StatLabel>
                    <StatNumber>{formatCurrency(estadisticas?.promedio_compra || 0)}</StatNumber>
                    <StatHelpText>Ticket promedio</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Última Compra</StatLabel>
                    <StatNumber fontSize="xl">
                      {estadisticas?.ultima_compra ? 
                        formatDate(estadisticas.ultima_compra, true) : 
                        'Sin compras'
                      }
                    </StatNumber>
                    <StatHelpText>Fecha</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            <Button
              leftIcon={<ExternalLinkIcon />}
              colorScheme="blue"
              onClick={() => navigate(`/clientes/${id}/historial`)}
            >
              Ver historial completo
            </Button>
          </TabPanel>
          
          {/* Crédito y Pagos */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box>
                <Heading size="sm" mb={2}>Configuración de Crédito</Heading>
                <Divider mb={3} />
                
                <Card variant="outline" p={4}>
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="medium">Límite de Crédito:</Text>
                      <Text fontSize="xl" fontWeight="bold" color="blue.600">
                        {formatCurrency(cliente.limite_credito || 0)}
                      </Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="medium">Días de Crédito:</Text>
                      <Text fontSize="lg">{cliente.dias_credito || 0} días</Text>
                    </Flex>
                    
                    <Badge alignSelf="start" colorScheme={cliente.limite_credito > 0 ? "green" : "yellow"}>
                      {cliente.limite_credito > 0 ? "Crédito Habilitado" : "Sin Línea de Crédito"}
                    </Badge>
                  </VStack>
                </Card>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2}>Compras a Crédito Activas</Heading>
                <Divider mb={3} />
                
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    Funcionalidad de seguimiento de crédito disponible próximamente
                  </AlertDescription>
                </Alert>
              </Box>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Modal de edición */}
      <ClienteForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        onSubmit={handleFormSubmit}
        cliente={cliente}
      />
    </Box>
  );
};

export default ClienteDetalle;
