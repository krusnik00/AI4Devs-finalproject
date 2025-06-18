import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  Alert,
  AlertIcon,
  useToast,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react';
import { SearchIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { devolucionService } from '../services/devolucion.service';
import { formatCurrency } from '../utils/formatters';

const DevolucionForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Estado para el número de ticket
  const [numeroTicket, setNumeroTicket] = useState('');
  const [buscando, setBuscando] = useState(false);
  
  // Estado para la venta a procesar
  const [venta, setVenta] = useState(null);
  const [ventaError, setVentaError] = useState(null);
  
  // Estado para la devolución
  const [motivo, setMotivo] = useState('');
  const [descripcionMotivo, setDescripcionMotivo] = useState('');
  const [tipoReembolso, setTipoReembolso] = useState('');
  const [comentarios, setComentarios] = useState('');
  
  // Estado para los productos a devolver
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  
  // Estado para mostrar que se está procesando la devolución
  const [procesando, setProcesando] = useState(false);
  
  // Buscar venta por número de ticket
  const buscarVenta = async () => {
    if (!numeroTicket) {
      toast({
        title: 'Error',
        description: 'Ingrese un número de ticket',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      setBuscando(true);
      setVentaError(null);
      const result = await devolucionService.buscarVentaParaDevolucion(numeroTicket);
      setVenta(result.venta);
      // Inicializar productos seleccionados con cantidad 0
      const productos = result.venta.detalles.map(detalle => ({
        detalle_venta_id: detalle.id,
        producto_id: detalle.producto_id,
        nombre: detalle.producto.nombre,
        precio_unitario: detalle.precio_unitario,
        cantidad_original: detalle.cantidad,
        cantidad_devolvible: detalle.cantidadDevolvible,
        cantidad: 0,
        subtotal: 0
      }));
      setProductosSeleccionados(productos);
    } catch (error) {
      console.error('Error al buscar venta:', error);
      setVenta(null);
      setVentaError(
        error.response?.data?.message || 'No se pudo encontrar la venta'
      );
      
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo encontrar la venta',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setBuscando(false);
    }
  };
  
  // Actualizar cantidad de un producto
  const actualizarCantidad = (index, cantidad) => {
    const producto = productosSeleccionados[index];
    
    // Validar que no exceda la cantidad disponible para devolución
    if (cantidad > producto.cantidad_devolvible) {
      toast({
        title: 'Error',
        description: `No puede devolver más de ${producto.cantidad_devolvible} unidades`,
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      cantidad = producto.cantidad_devolvible;
    }
    
    // Actualizar el producto
    const nuevosProductos = [...productosSeleccionados];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      cantidad: cantidad,
      subtotal: parseFloat((cantidad * parseFloat(producto.precio_unitario)).toFixed(2))
    };
    
    setProductosSeleccionados(nuevosProductos);
  };
  
  // Calcular totales
  const calcularTotales = () => {
    return productosSeleccionados.reduce(
      (totales, producto) => {
        if (producto.cantidad > 0) {
          totales.subtotal += producto.subtotal;
          totales.cantidadProductos += 1;
          totales.cantidadUnidades += producto.cantidad;
        }
        return totales;
      },
      { subtotal: 0, cantidadProductos: 0, cantidadUnidades: 0 }
    );
  };
  
  const calcularImpuestos = () => {
    if (!venta) return 0;
    const totales = calcularTotales();
    const tasaImpuesto = venta.subtotal > 0 ? venta.impuestos / venta.subtotal : 0;
    return parseFloat((totales.subtotal * tasaImpuesto).toFixed(2));
  };
  
  const calcularTotal = () => {
    const totales = calcularTotales();
    const impuestos = calcularImpuestos();
    return totales.subtotal + impuestos;
  };
  
  // Procesar la devolución
  const procesarDevolucion = async () => {
    // Validar que se haya seleccionado al menos un producto
    const productosDevolver = productosSeleccionados.filter(p => p.cantidad > 0);
    if (productosDevolver.length === 0) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar al menos un producto para devolver',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Validar que se haya seleccionado un motivo
    if (!motivo) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un motivo para la devolución',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Validar que se haya seleccionado un tipo de reembolso
    if (!tipoReembolso) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un tipo de reembolso',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      setProcesando(true);
      
      // Preparar datos para la devolución
      const devolucionData = {
        venta_id: venta.id,
        cliente_id: venta.cliente_id,
        motivo,
        descripcion_motivo: descripcionMotivo,
        tipo_reembolso: tipoReembolso,
        comentarios,
        detalles: productosDevolver.map(p => ({
          detalle_venta_id: p.detalle_venta_id,
          cantidad: p.cantidad
        }))
      };
      
      // Enviar solicitud de devolución
      const resultado = await devolucionService.crearDevolucion(devolucionData);
      
      toast({
        title: 'Éxito',
        description: resultado.message,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Redireccionar a la página de detalles de la devolución
      navigate(`/devoluciones/${resultado.devolucion.id}`);
      
    } catch (error) {
      console.error('Error al procesar devolución:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo procesar la devolución',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setProcesando(false);
    }
  };
  
  return (
    <Box p={5}>
      <Heading mb={6}>Devoluciones y Cambios</Heading>
      
      {/* Buscar venta por ticket */}
      <Box mb={8} maxW="600px">
        <FormControl>
          <FormLabel>Número de ticket</FormLabel>
          <HStack>
            <Input 
              value={numeroTicket}
              onChange={(e) => setNumeroTicket(e.target.value)}
              placeholder="Ingrese el número de ticket"
              onKeyPress={(e) => {
                if (e.key === 'Enter') buscarVenta();
              }}
            />
            <Button 
              leftIcon={<SearchIcon />} 
              colorScheme="blue"
              onClick={buscarVenta}
              isLoading={buscando}
            >
              Buscar
            </Button>
          </HStack>
        </FormControl>
      </Box>
      
      {ventaError && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {ventaError}
        </Alert>
      )}
      
      {venta && (
        <>
          {/* Información de la venta */}
          <Box mb={8} p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={3}>Información de la Venta</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Ticket #</Text>
                <Text>{venta.id}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Fecha</Text>
                <Text>{new Date(venta.fecha_venta).toLocaleString()}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Total</Text>
                <Text>{formatCurrency(venta.total)}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Cliente</Text>
                <Text>{venta.cliente ? venta.cliente.nombre : 'Público General'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Estado</Text>
                <Badge colorScheme={venta.estado === 'completada' ? 'green' : 'yellow'}>
                  {venta.estado === 'completada' ? 'Completada' : venta.estado}
                </Badge>
              </Box>
            </SimpleGrid>
          </Box>
          
          {/* Selección de productos a devolver */}
          <Box mb={8}>
            <Heading size="md" mb={3}>Seleccionar productos para devolución</Heading>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Producto</Th>
                    <Th isNumeric>Precio</Th>
                    <Th isNumeric>Cant. Original</Th>
                    <Th isNumeric>Disponible para devolver</Th>
                    <Th isNumeric>Cant. a devolver</Th>
                    <Th isNumeric>Subtotal</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {productosSeleccionados.map((producto, index) => (
                    <Tr 
                      key={producto.detalle_venta_id}
                      opacity={producto.cantidad_devolvible === 0 ? 0.5 : 1}
                    >
                      <Td>{producto.nombre}</Td>
                      <Td isNumeric>{formatCurrency(producto.precio_unitario)}</Td>
                      <Td isNumeric>{producto.cantidad_original}</Td>
                      <Td isNumeric>
                        {producto.cantidad_devolvible}
                        {producto.cantidad_devolvible < producto.cantidad_original && (
                          <Badge ml={2} colorScheme="orange" size="sm">
                            Parcialmente devuelto
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <NumberInput 
                          size="sm"
                          min={0}
                          max={producto.cantidad_devolvible}
                          value={producto.cantidad}
                          onChange={(valor) => actualizarCantidad(index, parseInt(valor))}
                          isDisabled={producto.cantidad_devolvible === 0}
                        >
                          <NumberInputField textAlign="right" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Td>
                      <Td isNumeric>{formatCurrency(producto.subtotal)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            
            {productosSeleccionados.every(p => p.cantidad_devolvible === 0) && (
              <Alert status="info" mt={4}>
                <AlertIcon />
                Todos los productos de esta venta ya han sido devueltos.
              </Alert>
            )}
          </Box>
          
          {/* Formulario de devolución */}
          {productosSeleccionados.some(p => p.cantidad_devolvible > 0) && (
            <>
              <Box mb={8}>
                <Heading size="md" mb={3}>Información de la devolución</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} maxW="900px">
                  <FormControl isRequired>
                    <FormLabel>Motivo de devolución</FormLabel>
                    <Select 
                      placeholder="Seleccionar motivo" 
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                    >
                      <option value="defectuoso">Producto defectuoso</option>
                      <option value="equivocado">Producto equivocado</option>
                      <option value="otro">Otro motivo</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <Textarea 
                      placeholder="Detalles adicionales del motivo" 
                      value={descripcionMotivo}
                      onChange={(e) => setDescripcionMotivo(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Tipo de reembolso</FormLabel>
                    <RadioGroup 
                      value={tipoReembolso} 
                      onChange={setTipoReembolso}
                    >
                      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                        <Radio value="efectivo">Efectivo</Radio>
                        <Radio value="tarjeta">Tarjeta (reembolso)</Radio>
                        <Radio value="nota_credito">Nota de crédito</Radio>
                        <Radio value="cambio_producto">Cambio por otro producto</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Comentarios adicionales</FormLabel>
                    <Textarea 
                      placeholder="Observaciones o notas adicionales" 
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
              
              {/* Resumen y totales */}
              <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" mb={8}>
                <Box maxW={{ base: "100%", md: "50%" }}>
                  <Heading size="md" mb={3}>Resumen</Heading>
                  <VStack align="stretch" spacing={2} p={4} borderWidth="1px" borderRadius="lg">
                    <Flex justify="space-between">
                      <Text>Cantidad de productos:</Text>
                      <Text>{calcularTotales().cantidadProductos}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Cantidad de unidades:</Text>
                      <Text>{calcularTotales().cantidadUnidades}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Subtotal:</Text>
                      <Text>{formatCurrency(calcularTotales().subtotal)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Impuestos:</Text>
                      <Text>{formatCurrency(calcularImpuestos())}</Text>
                    </Flex>
                    <Flex justify="space-between" fontWeight="bold">
                      <Text>Total a reembolsar:</Text>
                      <Text>{formatCurrency(calcularTotal())}</Text>
                    </Flex>
                  </VStack>
                </Box>
                
                <Box alignSelf="flex-end" mt={{ base: 6, md: 0 }}>
                  <Button 
                    colorScheme="blue" 
                    size="lg"
                    onClick={procesarDevolucion}
                    isLoading={procesando}
                    isDisabled={
                      calcularTotales().cantidadProductos === 0 ||
                      !motivo ||
                      !tipoReembolso
                    }
                  >
                    Procesar Devolución
                  </Button>
                </Box>
              </Flex>
            </>
          )}
        </>
      )}
      
      {/* Botón de volver */}
      <Button 
        leftIcon={<ArrowBackIcon />} 
        variant="outline" 
        onClick={() => navigate('/devoluciones')}
        mt={4}
      >
        Volver
      </Button>
    </Box>
  );
};

export default DevolucionForm;
