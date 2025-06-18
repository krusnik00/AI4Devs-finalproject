import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Text, 
  Spinner, 
  HStack, 
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Link,
  SimpleGrid
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowBackIcon,
  ExternalLinkIcon,
  DownloadIcon,
  InfoOutlineIcon
} from '@chakra-ui/icons';
import { clienteService } from '../services/cliente.service';
import { ventaService } from '../services/venta.service';
import { formatCurrency, formatDate } from '../utils/formatters';

const ClienteHistorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [cliente, setCliente] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Cargar datos del cliente y su historial
  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clienteService.getClienteHistorial(id, currentPage, 10);
      
      setCliente(response.cliente);
      setEstadisticas(response.estadisticas);
      setVentas(response.historial.ventas);
      setTotalVentas(response.historial.total);
      setTotalPages(response.historial.totalPaginas);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial del cliente');
      
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial del cliente',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    cargarHistorial();
  }, [id, currentPage]);
  
  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // Descargar comprobante
  const handleDescargarComprobante = async (ventaId) => {
    try {
      await ventaService.descargarComprobante(ventaId);
      
      // No es necesario toast aquí ya que la descarga debería iniciar automáticamente
    } catch (err) {
      console.error('Error al descargar comprobante:', err);
      
      toast({
        title: 'Error',
        description: 'No se pudo descargar el comprobante',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Ver detalle de venta
  const handleVerDetalle = (ventaId) => {
    navigate(`/ventas/${ventaId}`);
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">{error}</Text>
        <Button
          mt={4}
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Flex direction="column">
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="outline"
          width="fit-content"
          mb={6}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
        
        <Heading size="lg" mb={6}>
          Historial de Compras
          <Text as="span" fontSize="md" fontWeight="normal" ml={2}>
            | {cliente.nombre}
          </Text>
        </Heading>
        
        {/* Tarjetas de estadísticas */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total de Compras</StatLabel>
                <StatNumber>{estadisticas.total_compras || 0}</StatNumber>
                <StatHelpText>Transacciones</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Gasto Total</StatLabel>
                <StatNumber>{formatCurrency(estadisticas.gasto_total || 0)}</StatNumber>
                <StatHelpText>Acumulado</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Promedio por Compra</StatLabel>
                <StatNumber>{formatCurrency(estadisticas.promedio_compra || 0)}</StatNumber>
                <StatHelpText>Ticket promedio</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Última Compra</StatLabel>
                <StatNumber fontSize="xl">
                  {estadisticas.ultima_compra ? 
                    formatDate(estadisticas.ultima_compra, true) : 
                    'Sin compras'
                  }
                </StatNumber>
                <StatHelpText>Fecha</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        <Divider mb={6} />
        
        <Heading size="md" mb={4}>Compras Realizadas</Heading>
        
        {/* Tabla de historial */}
        {ventas.length === 0 ? (
          <Box p={6} bg="gray.50" borderRadius="md" textAlign="center">
            <InfoOutlineIcon boxSize={10} color="gray.400" mb={2} />
            <Text>Este cliente aún no ha realizado compras</Text>
            <Button mt={4} colorScheme="blue" onClick={() => navigate('/ventas/nueva')}>
              Registrar Nueva Venta
            </Button>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" bg="white">
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Folio</Th>
                  <Th isNumeric>Total</Th>
                  <Th>Método Pago</Th>
                  <Th>Estado</Th>
                  <Th width="130px">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {ventas.map(venta => (
                  <Tr key={venta.id}>
                    <Td>{formatDate(venta.fecha_venta)}</Td>
                    <Td>V-{venta.id.toString().padStart(6, '0')}</Td>
                    <Td isNumeric>{formatCurrency(venta.total)}</Td>
                    <Td>
                      <Badge>
                        {venta.metodo_pago === 'efectivo' ? 'Efectivo' :
                         venta.metodo_pago === 'tarjeta' ? 'Tarjeta' :
                         venta.metodo_pago === 'transferencia' ? 'Transferencia' : 
                         venta.metodo_pago === 'credito' ? 'Crédito' : 
                         venta.metodo_pago}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={
                          venta.estado === 'completada' ? 'green' :
                          venta.estado === 'pendiente' ? 'yellow' : 'red'
                        }
                      >
                        {venta.estado === 'completada' ? 'Completada' :
                         venta.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Tooltip label="Ver detalle">
                          <IconButton
                            size="sm"
                            icon={<ExternalLinkIcon />}
                            onClick={() => handleVerDetalle(venta.id)}
                            aria-label="Ver detalle"
                            variant="outline"
                          />
                        </Tooltip>
                        <Tooltip label="Descargar comprobante">
                          <IconButton
                            size="sm"
                            icon={<DownloadIcon />}
                            onClick={() => handleDescargarComprobante(venta.id)}
                            aria-label="Descargar comprobante"
                            variant="outline"
                            isDisabled={venta.estado === 'cancelada'}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            
            {/* Paginación */}
            <Flex justify="space-between" align="center" mt={4}>
              <Text fontSize="sm">
                Mostrando {ventas.length} de {totalVentas} compras
              </Text>
              
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
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default ClienteHistorial;
