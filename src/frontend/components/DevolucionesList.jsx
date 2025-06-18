import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Input,
  Select,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  IconButton
} from '@chakra-ui/react';
import { 
  AddIcon, 
  SearchIcon, 
  ArrowForwardIcon, 
  CheckIcon,
  CloseIcon,
  DownloadIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { devolucionService } from '../services/devolucion.service';
import { formatCurrency, formatDate } from '../utils/formatters';

const DevolucionesList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Estado para devoluciones
  const [devoluciones, setDevoluciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para paginación
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  // Estado para cancelación
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [devolucionAModificar, setDevolucionAModificar] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [accion, setAccion] = useState(null); // 'autorizar' o 'cancelar'
  
  // Referencia para el botón de cancelar
  const cancelRef = React.useRef();
  
  // Cargar devoluciones
  const cargarDevoluciones = async (pagina = 1, filtrosActuales = filtros) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        pagina,
        limite: 10,
        ...filtrosActuales
      };
      
      const data = await devolucionService.listarDevoluciones(params);
      
      setDevoluciones(data.devoluciones);
      setPagina(data.pagina);
      setTotalPaginas(data.totalPaginas);
      
    } catch (err) {
      console.error('Error al cargar devoluciones:', err);
      setError('No se pudieron cargar las devoluciones.');
      
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las devoluciones',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar devoluciones al montar el componente
  useEffect(() => {
    cargarDevoluciones();
  }, []);
  
  // Manejar cambio de filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Aplicar filtros
  const aplicarFiltros = () => {
    cargarDevoluciones(1, filtros);
  };
  
  // Limpiar filtros
  const limpiarFiltros = () => {
    const filtrosLimpios = {
      estado: '',
      fecha_inicio: '',
      fecha_fin: ''
    };
    setFiltros(filtrosLimpios);
    cargarDevoluciones(1, filtrosLimpios);
  };
  
  // Ir a la página de crear devolución
  const irACrearDevolucion = () => {
    navigate('/devoluciones/nueva');
  };
  
  // Ver detalle de devolución
  const verDetalleDevolucion = (id) => {
    navigate(`/devoluciones/${id}`);
  };
  
  // Mostrar diálogo para autorizar devolución
  const mostrarDialogoAutorizar = (devolucion) => {
    setDevolucionAModificar(devolucion);
    setAccion('autorizar');
    onOpen();
  };
  
  // Mostrar diálogo para cancelar devolución
  const mostrarDialogoCancelar = (devolucion) => {
    setDevolucionAModificar(devolucion);
    setAccion('cancelar');
    onOpen();
  };
  
  // Procesar acción (autorizar o cancelar)
  const procesarAccion = async () => {
    try {
      if (accion === 'autorizar') {
        await devolucionService.autorizarDevolucion(devolucionAModificar.id);
        toast({
          title: 'Devolución autorizada',
          description: 'La devolución ha sido autorizada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else if (accion === 'cancelar') {
        if (!motivo) {
          toast({
            title: 'Error',
            description: 'Debe proporcionar un motivo para cancelar la devolución',
            status: 'error',
            duration: 3000,
            isClosable: true
          });
          return;
        }
        
        await devolucionService.cancelarDevolucion(devolucionAModificar.id, motivo);
        toast({
          title: 'Devolución cancelada',
          description: 'La devolución ha sido cancelada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
      
      // Recargar datos
      onClose();
      setMotivo('');
      cargarDevoluciones(pagina);
      
    } catch (error) {
      console.error(`Error al ${accion} devolución:`, error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `No se pudo ${accion} la devolución`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // Generar comprobante
  const generarComprobante = (id) => {
    devolucionService.generarComprobante(id);
  };
  
  // Cambiar de página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      cargarDevoluciones(nuevaPagina);
    }
  };
  
  // Renderizar estado con color
  const renderizarEstado = (estado) => {
    let color;
    let texto;
    
    switch (estado) {
      case 'completada':
        color = 'green';
        texto = 'Completada';
        break;
      case 'pendiente':
        color = 'yellow';
        texto = 'Pendiente';
        break;
      case 'cancelada':
        color = 'red';
        texto = 'Cancelada';
        break;
      default:
        color = 'gray';
        texto = estado;
    }
    
    return <Badge colorScheme={color}>{texto}</Badge>;
  };
  
  // Renderizar tipo de devolución
  const renderizarTipo = (tipo) => {
    return tipo === 'devolucion' ? 'Devolución' : 'Cambio';
  };
  
  // Renderizar tipo de reembolso
  const renderizarTipoReembolso = (tipo) => {
    switch (tipo) {
      case 'efectivo':
        return 'Efectivo';
      case 'tarjeta':
        return 'Tarjeta';
      case 'nota_credito':
        return 'Nota de crédito';
      case 'cambio_producto':
        return 'Cambio por producto';
      default:
        return tipo;
    }
  };
  
  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Devoluciones y Cambios</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={irACrearDevolucion}
        >
          Nueva Devolución
        </Button>
      </Flex>
      
      {/* Filtros */}
      <Box mb={6} p={4} bg="white" borderRadius="md" shadow="sm">
        <Heading size="md" mb={4}>Filtros</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl>
            <FormLabel>Estado</FormLabel>
            <Select 
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              placeholder="Todos"
            >
              <option value="completada">Completada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Fecha Inicio</FormLabel>
            <Input 
              type="date"
              name="fecha_inicio"
              value={filtros.fecha_inicio}
              onChange={handleFiltroChange}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Fecha Fin</FormLabel>
            <Input 
              type="date"
              name="fecha_fin"
              value={filtros.fecha_fin}
              onChange={handleFiltroChange}
            />
          </FormControl>
        </SimpleGrid>
        
        <Flex mt={4} justify="flex-end">
          <Button 
            variant="outline" 
            mr={3}
            onClick={limpiarFiltros}
          >
            Limpiar
          </Button>
          <Button 
            leftIcon={<SearchIcon />} 
            colorScheme="blue"
            onClick={aplicarFiltros}
          >
            Filtrar
          </Button>
        </Flex>
      </Box>
      
      {/* Tabla de devoluciones */}
      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Box p={4} bg="red.50" borderRadius="md">
          <Text color="red.500">{error}</Text>
        </Box>
      ) : (
        <>
          <Box overflowX="auto">
            {devoluciones.length === 0 ? (
              <Box p={8} textAlign="center">
                <Text fontSize="lg">No se encontraron devoluciones</Text>
              </Box>
            ) : (
              <Table variant="simple" bg="white" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>ID</Th>
                    <Th>Fecha</Th>
                    <Th>Venta</Th>
                    <Th>Tipo</Th>
                    <Th>Motivo</Th>
                    <Th>Reembolso</Th>
                    <Th isNumeric>Total</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {devoluciones.map(devolucion => (
                    <Tr key={devolucion.id}>
                      <Td>{devolucion.id}</Td>
                      <Td>{formatDate(devolucion.fecha_devolucion)}</Td>
                      <Td>{devolucion.venta_id}</Td>
                      <Td>{renderizarTipo(devolucion.tipo)}</Td>
                      <Td>{
                        devolucion.motivo === 'defectuoso' ? 'Defectuoso' :
                        devolucion.motivo === 'equivocado' ? 'Equivocado' :
                        'Otro'
                      }</Td>
                      <Td>{renderizarTipoReembolso(devolucion.tipo_reembolso)}</Td>
                      <Td isNumeric>{formatCurrency(devolucion.total)}</Td>
                      <Td>{renderizarEstado(devolucion.estado)}</Td>
                      <Td>
                        <Flex>
                          <IconButton
                            icon={<ArrowForwardIcon />}
                            size="sm"
                            variant="ghost"
                            aria-label="Ver detalles"
                            onClick={() => verDetalleDevolucion(devolucion.id)}
                            mr={1}
                          />
                          
                          {devolucion.estado === 'pendiente' && (
                            <IconButton
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              aria-label="Autorizar"
                              onClick={() => mostrarDialogoAutorizar(devolucion)}
                              mr={1}
                            />
                          )}
                          
                          {devolucion.estado !== 'cancelada' && (
                            <IconButton
                              icon={<CloseIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              aria-label="Cancelar"
                              onClick={() => mostrarDialogoCancelar(devolucion)}
                              mr={1}
                            />
                          )}
                          
                          {devolucion.estado === 'completada' && (
                            <IconButton
                              icon={<DownloadIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              aria-label="Comprobante"
                              onClick={() => generarComprobante(devolucion.id)}
                            />
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
          
          {/* Paginación */}
          {totalPaginas > 1 && (
            <Flex justify="center" mt={4}>
              <Button
                onClick={() => cambiarPagina(pagina - 1)}
                isDisabled={pagina === 1}
                mr={2}
              >
                Anterior
              </Button>
              <Text alignSelf="center" mx={2}>
                Página {pagina} de {totalPaginas}
              </Text>
              <Button
                onClick={() => cambiarPagina(pagina + 1)}
                isDisabled={pagina === totalPaginas}
                ml={2}
              >
                Siguiente
              </Button>
            </Flex>
          )}
        </>
      )}
      
      {/* Diálogo de confirmación */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {accion === 'autorizar' ? 'Autorizar Devolución' : 'Cancelar Devolución'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {accion === 'autorizar' ? (
                <>
                  ¿Está seguro de autorizar esta devolución? 
                  Esta acción actualizará el inventario y no podrá revertirse.
                </>
              ) : (
                <>
                  ¿Está seguro de cancelar esta devolución?
                  {devolucionAModificar?.estado === 'completada' && 
                    ' Esto revertirá los cambios en el inventario.'}
                  <FormControl mt={4} isRequired>
                    <FormLabel>Motivo de la cancelación</FormLabel>
                    <Input 
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Ingrese el motivo"
                    />
                  </FormControl>
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Volver
              </Button>
              <Button 
                colorScheme={accion === 'autorizar' ? 'green' : 'red'}
                onClick={procesarAccion} 
                ml={3}
                isDisabled={accion === 'cancelar' && !motivo}
              >
                {accion === 'autorizar' ? 'Autorizar' : 'Cancelar'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DevolucionesList;
