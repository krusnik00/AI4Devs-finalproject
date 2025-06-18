import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Divider,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  NumberInput,
  NumberInputField,
  Image,
  Card,
  CardBody,
  Spinner,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import {
  SearchIcon,
  DeleteIcon,
  AddIcon,
  MinusIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon,
  WarningIcon
} from '@chakra-ui/icons';
import { FaReceipt, FaBarcode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ventaService } from '../services/venta.service';
import { productoService } from '../services/producto.service';
import ClienteSelector from './ClienteSelector';

const PuntoVenta = () => {
  const navigate = useNavigate();
  
  // Estados para el carrito y la venta
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [cantidadPagada, setCantidadPagada] = useState('');
  const [cambio, setCambio] = useState(0);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [impuestos, setImpuestos] = useState(0);
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState({});
  
  // Referencias y timeouts
  const barcodeScannerTimeout = useRef(null);
  const barcodeBuffer = useRef('');
  const searchInputRef = useRef(null);
  
  // Hooks para UI
  const toast = useToast();
  const { isOpen: isResultsDrawerOpen, onOpen: onResultsDrawerOpen, onClose: onResultsDrawerClose } = useDisclosure();
  const { isOpen: isConfirmModalOpen, onOpen: onConfirmModalOpen, onClose: onConfirmModalClose } = useDisclosure();
  const { isOpen: isCompletedModalOpen, onOpen: onCompletedModalOpen, onClose: onCompletedModalClose } = useDisclosure();
  const { isOpen: isProductModalOpen, onOpen: onProductModalOpen, onClose: onProductModalClose } = useDisclosure();
  
  // Estado para guardar la venta completada
  const [ventaCompletada, setVentaCompletada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  // Tasa de impuesto (16% IVA)
  const TASA_IMPUESTO = 0.16;

  useEffect(() => {
    // Enfocar el campo de búsqueda al iniciar
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Configurar detector de escáner de códigos de barras
    const handleKeyDown = (e) => {
      // Si presiona Enter y hay contenido en el buffer de código de barras, procesar
      if (e.key === 'Enter' && barcodeBuffer.current.length > 3) {
        buscarPorCodigoBarras(barcodeBuffer.current);
        barcodeBuffer.current = '';
        e.preventDefault();
        return;
      }
      
      // Reinicia el timeout cada vez que se presiona una tecla
      if (barcodeScannerTimeout.current) {
        clearTimeout(barcodeScannerTimeout.current);
      }
      
      // Configura un timeout para reiniciar el buffer si no hay más teclas presionadas
      barcodeScannerTimeout.current = setTimeout(() => {
        barcodeBuffer.current = '';
      }, 100);
      
      // Ignorar si es un atajo de teclado (Alt, Ctrl, etc)
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      
      // Solo los caracteres que podrian formar parte de un código de barras
      if (/[\d\w]/.test(e.key) && e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (barcodeScannerTimeout.current) {
        clearTimeout(barcodeScannerTimeout.current);
      }
    };
  }, []);
  
  // Efecto para calcular los totales
  useEffect(() => {
    calcularTotales();
  }, [carrito]);
  
  // Calcular subtotal, impuestos y total
  const calcularTotales = () => {
    const nuevoSubtotal = carrito.reduce((acc, item) => 
      acc + (item.precio_unitario * item.cantidad), 0);
    
    const nuevoImpuestos = nuevoSubtotal * TASA_IMPUESTO;
    const nuevoTotal = nuevoSubtotal + nuevoImpuestos;
    
    setSubtotal(nuevoSubtotal);
    setImpuestos(nuevoImpuestos);
    setTotal(nuevoTotal);
    
    // Calcular cambio si hay cantidad pagada
    if (cantidadPagada) {
      const nuevoCambio = parseFloat(cantidadPagada) - nuevoTotal;
      setCambio(nuevoCambio > 0 ? nuevoCambio : 0);
    }
  };
  
  // Buscar producto por código de barras
  const buscarPorCodigoBarras = async (codigo) => {
    try {
      setBuscando(true);
      const response = await productoService.buscarPorCodigoBarras(codigo);
      
      if (response && response.length > 0) {
        // Agregar directamente el producto al carrito
        agregarProductoAlCarrito(response[0]);
      } else {
        toast({
          title: "Producto no encontrado",
          description: `No se encontró ningún producto con el código: ${codigo}`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error al buscar por código de barras:', error);
      toast({
        title: "Error",
        description: "No se pudo buscar el producto",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBuscando(false);
    }
  };
  
  // Buscar productos
  const buscarProductos = async () => {
    if (!busqueda.trim() || busqueda.length < 2) return;
    
    try {
      setBuscando(true);
      const response = await productoService.buscarProductos(busqueda);
      setResultadosBusqueda(response);
      
      if (response.length > 0) {
        onResultsDrawerOpen();
      } else {
        toast({
          title: "Sin resultados",
          description: "No se encontraron productos que coincidan con la búsqueda",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      toast({
        title: "Error",
        description: "No se pudieron buscar productos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBuscando(false);
    }
  };
  
  // Agregar producto al carrito
  const agregarProductoAlCarrito = (producto) => {
    // Verificar que tenga stock suficiente
    if (producto.stock_actual <= 0) {
      toast({
        title: "Sin stock",
        description: `El producto ${producto.nombre} no tiene stock disponible`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Buscar si ya existe en el carrito para actualizar cantidad
    const index = carrito.findIndex(item => item.producto_id === producto.id);
    
    if (index !== -1) {
      // Verificar que no exceda el stock disponible
      const cantidadActual = carrito[index].cantidad;
      if (cantidadActual >= producto.stock_actual) {
        toast({
          title: "Stock insuficiente",
          description: `No hay más unidades disponibles de ${producto.nombre}`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Incrementar cantidad
      const updatedCarrito = [...carrito];
      updatedCarrito[index].cantidad += 1;
      setCarrito(updatedCarrito);
    } else {
      // Agregar nuevo producto al carrito
      const nuevoItem = {
        producto_id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio_unitario: producto.precio_venta,
        cantidad: 1,
        stock_disponible: producto.stock_actual
      };
      
      setCarrito([...carrito, nuevoItem]);
    }
    
    // Cerrar drawer de resultados si está abierto
    if (isResultsDrawerOpen) {
      onResultsDrawerClose();
    }
    
    // Limpiar búsqueda
    setBusqueda('');
    setResultadosBusqueda([]);
    
    // Enfocar de nuevo en la búsqueda
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Actualizar cantidad de un producto en el carrito
  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const productoCarrito = carrito[index];
    
    // Verificar stock disponible
    if (nuevaCantidad > productoCarrito.stock_disponible) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${productoCarrito.stock_disponible} unidades disponibles`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Actualizar cantidad
    const updatedCarrito = [...carrito];
    updatedCarrito[index].cantidad = nuevaCantidad;
    setCarrito(updatedCarrito);
  };
  
  // Eliminar producto del carrito
  const eliminarDelCarrito = (index) => {
    const updatedCarrito = [...carrito];
    updatedCarrito.splice(index, 1);
    setCarrito(updatedCarrito);
  };
  
  // Mostrar detalles de un producto
  const mostrarDetallesProducto = (producto) => {
    setProductoSeleccionado(producto);
    onProductModalOpen();
  };
  
  // Limpiar el carrito
  const limpiarCarrito = () => {
    if (window.confirm("¿Estás seguro de cancelar la venta actual?")) {
      setCarrito([]);
      setCliente(null);
      setMetodoPago('efectivo');
      setCantidadPagada('');
      setCambio(0);
      setErrorValidacion({});
    }
  };
  
  // Validar venta antes de procesar
  const validarVenta = () => {
    const errores = {};
    
    if (carrito.length === 0) {
      errores.carrito = "Debe agregar al menos un producto al carrito";
    }
    
    if (metodoPago === 'efectivo' && (!cantidadPagada || parseFloat(cantidadPagada) < total)) {
      errores.pago = "La cantidad pagada debe ser mayor o igual al total";
    }
    
    if (metodoPago === 'credito' && !cliente) {
      errores.cliente = "Debe seleccionar un cliente para ventas a crédito";
    }
    
    setErrorValidacion(errores);
    return Object.keys(errores).length === 0;
  };
  
  // Preparar confirmación de venta
  const prepararConfirmacion = () => {
    if (validarVenta()) {
      onConfirmModalOpen();
    }
  };
  
  // Procesar la venta
  const procesarVenta = async () => {
    if (procesandoVenta) return;
    
    setProcesandoVenta(true);
    try {
      const ventaData = {
        cliente_id: cliente ? cliente.id : null,
        metodo_pago: metodoPago,
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
        productos: carrito.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      };
      
      const response = await ventaService.crearVenta(ventaData);
      
      // Cerrar modal de confirmación
      onConfirmModalClose();
      
      // Guardar venta completada
      setVentaCompletada(response.venta);
      
      // Mostrar modal de venta completada
      onCompletedModalOpen();
      
      // Reiniciar el carrito y los campos
      setCarrito([]);
      setCliente(null);
      setMetodoPago('efectivo');
      setCantidadPagada('');
      setCambio(0);
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      
      if (error.response && error.response.data.productos_sin_stock) {
        // Manejar error específico de falta de stock
        const productosSinStock = error.response.data.productos_sin_stock;
        const mensajeError = productosSinStock.map(p => 
          `${p.nombre || 'Producto'} (${p.codigo || p.id}): ${p.stock_actual} disponibles, ${p.cantidad_solicitada} solicitados`
        ).join('\n');
        
        toast({
          title: "Stock insuficiente",
          description: mensajeError,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Error general
        toast({
          title: "Error al procesar la venta",
          description: error.response?.data?.message || "Ha ocurrido un error inesperado",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setProcesandoVenta(false);
    }
  };
  
  // Imprimir comprobante
  const imprimirComprobante = async (ventaId) => {
    try {
      await ventaService.descargarComprobante(ventaId);
    } catch (error) {
      console.error('Error al descargar comprobante:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el comprobante",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle input de búsqueda con tecla Enter
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarProductos();
    }
  };
  
  // Renders
  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={4} p={4}>
      {/* Panel izquierdo - Búsqueda de productos */}
      <GridItem colSpan={{ base: 12, lg: 7 }}>
        <VStack spacing={4} align="stretch">          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Heading size="lg">Punto de Venta</Heading>
            <HStack>
              <Button 
                leftIcon={<FaReceipt />} 
                colorScheme="blue"
                variant="outline"
                onClick={() => navigate('/devoluciones/nueva')}
                size="sm"
              >
                Devoluciones
              </Button>
              <Button 
                leftIcon={<DeleteIcon />} 
                colorScheme="red"
                variant="outline"
                onClick={limpiarCarrito}
                isDisabled={carrito.length === 0}
                size="sm"
              >
                Limpiar
              </Button>
            </HStack>
          </Flex>
          
          {/* Búsqueda de productos */}
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
            <FormLabel mb={1}>Buscar producto</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <SearchIcon color='gray.300' />
              </InputLeftElement>
              <Input
                ref={searchInputRef}
                placeholder="Buscar por nombre, código o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <InputRightElement width='4.5rem'>
                <Button 
                  h='1.75rem' 
                  size='sm'
                  colorScheme="blue"
                  onClick={buscarProductos}
                  isLoading={buscando}
                  isDisabled={busqueda.length < 2 || buscando}
                >
                  Buscar
                </Button>
              </InputRightElement>
            </InputGroup>
            <Text mt={2} fontSize="xs" color="gray.500">
              <FaBarcode style={{ display: 'inline', marginRight: '5px' }} />
              Use un escáner de código de barras o busque por nombre o código
            </Text>
          </Box>
          
          {/* Carrito de compras */}
          <Box 
            bg="white" 
            borderRadius="md" 
            boxShadow="sm" 
            height={{ base: "auto", lg: "calc(100vh - 310px)" }} 
            overflow="auto"
          >
            <Table variant="simple" size="sm">
              <Thead position="sticky" top={0} bg="white" zIndex={1}>
                <Tr>
                  <Th>Producto</Th>
                  <Th isNumeric>Precio</Th>
                  <Th isNumeric>Cant.</Th>
                  <Th isNumeric>Subtotal</Th>
                  <Th width="40px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {carrito.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8}>
                      <Text color="gray.500">Carrito vacío</Text>
                      <Text fontSize="sm" mt={2} color="gray.400">
                        Busque y agregue productos para comenzar
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  carrito.map((item, index) => (
                    <Tr key={`${item.producto_id}-${index}`}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{item.nombre}</Text>
                          <Text fontSize="xs" color="gray.500">Cód: {item.codigo}</Text>
                        </VStack>
                      </Td>
                      <Td isNumeric>${item.precio_unitario.toFixed(2)}</Td>
                      <Td>
                        <Flex justify="flex-end" align="center">
                          <IconButton
                            size="xs"
                            icon={<MinusIcon />}
                            onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                            disabled={item.cantidad <= 1}
                            aria-label="Disminuir cantidad"
                            mr={1}
                          />
                          <Text width="30px" textAlign="center">
                            {item.cantidad}
                          </Text>
                          <IconButton
                            size="xs"
                            icon={<AddIcon />}
                            onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                            disabled={item.cantidad >= item.stock_disponible}
                            aria-label="Aumentar cantidad"
                            ml={1}
                          />
                        </Flex>
                      </Td>
                      <Td isNumeric>${(item.precio_unitario * item.cantidad).toFixed(2)}</Td>
                      <Td>
                        <IconButton
                          size="xs"
                          colorScheme="red"
                          icon={<DeleteIcon />}
                          onClick={() => eliminarDelCarrito(index)}
                          aria-label="Eliminar producto"
                        />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </GridItem>
      
      {/* Panel derecho - Resumen de venta */}
      <GridItem colSpan={{ base: 12, lg: 5 }}>
        <Card bg="white" boxShadow="sm">
          <CardBody>
            <VStack spacing={5} align="stretch">
              {/* Selector de cliente */}
              <Box>
                <FormLabel>Cliente</FormLabel>
                <ClienteSelector
                  onClienteSelect={setCliente}
                  clienteSeleccionado={cliente}
                />
                {errorValidacion.cliente && (
                  <Text color="red.500" fontSize="sm" mt={1}>{errorValidacion.cliente}</Text>
                )}
              </Box>
              
              <Divider />
              
              {/* Método de pago */}
              <FormControl>
                <FormLabel>Método de pago</FormLabel>
                <Select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="credito">Crédito</option>
                </Select>
              </FormControl>
              
              {/* Cantidad recibida (solo para efectivo) */}
              {metodoPago === 'efectivo' && (
                <FormControl isInvalid={!!errorValidacion.pago}>
                  <FormLabel>Cantidad recibida</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents='none' color='gray.300'>
                      $
                    </InputLeftElement>
                    <NumberInput
                      min={0}
                      width="100%"
                      value={cantidadPagada}
                      onChange={(value) => {
                        setCantidadPagada(value);
                        const nuevoCambio = parseFloat(value) - total;
                        setCambio(nuevoCambio > 0 ? nuevoCambio : 0);
                      }}
                    >
                      <NumberInputField borderLeftRadius="md" pl={8} />
                    </NumberInput>
                  </InputGroup>
                  {errorValidacion.pago && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errorValidacion.pago}</Text>
                  )}
                </FormControl>
              )}
              
              {/* Cambio (solo para efectivo) */}
              {metodoPago === 'efectivo' && cantidadPagada && (
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Cambio:</Text>
                    <Text fontWeight="bold" color={cambio >= 0 ? "green.500" : "red.500"}>
                      ${cambio.toFixed(2)}
                    </Text>
                  </Flex>
                </Box>
              )}
              
              <Divider />
              
              {/* Resumen de venta */}
              <VStack spacing={2} align="stretch">
                <Flex justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>IVA ({(TASA_IMPUESTO * 100).toFixed(0)}%):</Text>
                  <Text>${impuestos.toFixed(2)}</Text>
                </Flex>
                <Divider />
                <Flex justify="space-between" fontWeight="bold" fontSize="xl">
                  <Text>Total:</Text>
                  <Text>${total.toFixed(2)}</Text>
                </Flex>
              </VStack>
              
              {/* Mensaje de error */}
              {errorValidacion.carrito && (
                <Box bg="red.50" p={3} borderRadius="md">
                  <Text color="red.500">{errorValidacion.carrito}</Text>
                </Box>
              )}
              
              {/* Botón finalizar compra */}
              <Button
                size="lg"
                colorScheme="green"
                leftIcon={<FaReceipt />}
                onClick={prepararConfirmacion}
                isDisabled={carrito.length === 0}
                mt={4}
              >
                Finalizar Venta
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </GridItem>
      
      {/* Drawer de resultados de búsqueda */}
      <Drawer
        isOpen={isResultsDrawerOpen}
        placement="left"
        onClose={onResultsDrawerClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Resultados de búsqueda</DrawerHeader>
          
          <DrawerBody>
            {resultadosBusqueda.length === 0 ? (
              <Text textAlign="center" py={10} color="gray.500">No se encontraron productos</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {resultadosBusqueda.map((producto) => (
                  <Card key={producto.id} variant="outline" cursor="pointer" _hover={{ shadow: 'md' }}>
                    <CardBody>
                      <Flex justify="space-between">
                        <Box onClick={() => mostrarDetallesProducto(producto)}>
                          <Text fontWeight="bold">{producto.nombre}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Cód: {producto.codigo} | SKU: {producto.sku}
                          </Text>
                          <Text mt={1} color="blue.600" fontSize="lg" fontWeight="medium">
                            ${producto.precio_venta.toFixed(2)}
                          </Text>
                          <Badge 
                            colorScheme={producto.stock_actual > 0 ? 'green' : 'red'}
                            mt={1}
                          >
                            Stock: {producto.stock_actual}
                          </Badge>
                        </Box>
                        <Button
                          colorScheme="blue"
                          leftIcon={<AddIcon />}
                          onClick={() => agregarProductoAlCarrito(producto)}
                          alignSelf="center"
                          isDisabled={producto.stock_actual <= 0}
                        >
                          Agregar
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </DrawerBody>
          
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onResultsDrawerClose}>
              Cerrar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Modal de confirmación de venta */}
      <Modal isOpen={isConfirmModalOpen} onClose={onConfirmModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Venta</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="bold">Cliente:</Text>
                <Text>{cliente ? cliente.nombre : 'Cliente General'}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Método de Pago:</Text>
                <Badge colorScheme="blue">
                  {metodoPago === 'efectivo' ? 'Efectivo' :
                   metodoPago === 'tarjeta' ? 'Tarjeta' :
                   metodoPago === 'transferencia' ? 'Transferencia' : 'Crédito'}
                </Badge>
              </Box>
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold">Resumen:</Text>
                <HStack justifyContent="space-between" mt={2}>
                  <Text>Subtotal:</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>IVA ({(TASA_IMPUESTO * 100).toFixed(0)}%):</Text>
                  <Text>${impuestos.toFixed(2)}</Text>
                </HStack>
                <HStack justifyContent="space-between" fontWeight="bold">
                  <Text>Total:</Text>
                  <Text>${total.toFixed(2)}</Text>
                </HStack>
              </Box>
              
              {metodoPago === 'efectivo' && (
                <Box bg="blue.50" p={2} borderRadius="md">
                  <HStack justifyContent="space-between">
                    <Text>Recibido:</Text>
                    <Text>${parseFloat(cantidadPagada).toFixed(2)}</Text>
                  </HStack>
                  <HStack justifyContent="space-between" fontWeight="bold">
                    <Text>Cambio:</Text>
                    <Text color="green.500">${cambio.toFixed(2)}</Text>
                  </HStack>
                </Box>
              )}
              
              <Text>
                ¿Desea confirmar y procesar esta venta?
              </Text>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button mr={3} onClick={onConfirmModalClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="green" 
              onClick={procesarVenta} 
              leftIcon={<CheckIcon />}
              isLoading={procesandoVenta}
              loadingText="Procesando"
            >
              Confirmar Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Modal de venta completada */}
      <Modal isOpen={isCompletedModalOpen} onClose={onCompletedModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>¡Venta Completada!</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {ventaCompletada && (
              <VStack align="stretch" spacing={4}>
                <Box bg="green.50" p={3} borderRadius="md" textAlign="center">
                  <CheckIcon w={10} h={10} color="green.500" mb={2} />
                  <Heading size="md">Venta Procesada Correctamente</Heading>
                  <Text mt={1}>Folio: V-{ventaCompletada.id.toString().padStart(6, '0')}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Cliente:</Text>
                  <Text>{ventaCompletada.cliente ? ventaCompletada.cliente.nombre : 'Cliente General'}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Detalles:</Text>
                  <HStack justifyContent="space-between" mt={2}>
                    <Text>Fecha:</Text>
                    <Text>{new Date(ventaCompletada.fecha_venta).toLocaleString()}</Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text>Método de pago:</Text>
                    <Badge>
                      {ventaCompletada.metodo_pago === 'efectivo' ? 'Efectivo' :
                       ventaCompletada.metodo_pago === 'tarjeta' ? 'Tarjeta' :
                       ventaCompletada.metodo_pago === 'transferencia' ? 'Transferencia' : 'Crédito'}
                    </Badge>
                  </HStack>
                  <HStack justifyContent="space-between" fontWeight="bold" mt={2}>
                    <Text>Total:</Text>
                    <Text>${ventaCompletada.total.toFixed(2)}</Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button 
              mr={3} 
              leftIcon={<FaReceipt />} 
              onClick={() => {
                imprimirComprobante(ventaCompletada.id);
                onCompletedModalClose();
              }}
              colorScheme="blue"
            >
              Imprimir Comprobante
            </Button>
            <Button onClick={onCompletedModalClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Modal de detalle de producto */}
      <Modal isOpen={isProductModalOpen} onClose={onProductModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalle del Producto</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {productoSeleccionado && (
              <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                <GridItem colSpan={{ base: 12, md: 4 }}>
                  <Image 
                    src={productoSeleccionado.imagen_url || "https://via.placeholder.com/150?text=Sin+Imagen"} 
                    fallbackSrc="https://via.placeholder.com/150?text=Sin+Imagen"
                    borderRadius="md"
                    alt={productoSeleccionado.nombre}
                  />
                </GridItem>
                
                <GridItem colSpan={{ base: 12, md: 8 }}>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Heading size="md">{productoSeleccionado.nombre}</Heading>
                      <Text color="gray.600" mt={1}>{productoSeleccionado.descripcion}</Text>
                    </Box>
                    
                    <Flex justify="space-between" align="center">
                      <Badge colorScheme="purple">{productoSeleccionado.categoria?.nombre || 'Sin categoría'}</Badge>
                      <Badge colorScheme="blue">{productoSeleccionado.marca?.nombre || 'Sin marca'}</Badge>
                    </Flex>
                    
                    <Box>
                      <Text><strong>SKU:</strong> {productoSeleccionado.sku}</Text>
                      <Text><strong>Código:</strong> {productoSeleccionado.codigo}</Text>
                      <Text><strong>Código de barras:</strong> {productoSeleccionado.codigo_barras || 'N/A'}</Text>
                    </Box>
                    
                    {productoSeleccionado.modelo_compatible && (
                      <Text><strong>Modelo compatible:</strong> {productoSeleccionado.modelo_compatible}</Text>
                    )}
                    
                    {productoSeleccionado.anio_compatible && (
                      <Text><strong>Año compatible:</strong> {productoSeleccionado.anio_compatible}</Text>
                    )}
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text color="gray.600">Precio de venta</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                          ${productoSeleccionado.precio_venta.toFixed(2)}
                        </Text>
                      </Box>
                      
                      <Badge 
                        colorScheme={productoSeleccionado.stock_actual > 0 ? 'green' : 'red'}
                        p={2}
                        fontSize="md"
                      >
                        Stock: {productoSeleccionado.stock_actual}
                      </Badge>
                    </Flex>
                  </VStack>
                </GridItem>
              </Grid>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              leftIcon={<AddIcon />}
              onClick={() => {
                agregarProductoAlCarrito(productoSeleccionado);
                onProductModalClose();
              }}
              isDisabled={!productoSeleccionado || productoSeleccionado.stock_actual <= 0}
            >
              Agregar al Carrito
            </Button>
            <Button onClick={onProductModalClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

export default PuntoVenta;
