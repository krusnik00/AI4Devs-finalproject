import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Badge,
  IconButton,
  Textarea
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { descuentoService } from '../services/descuento.service';

const GestionDescuentos = () => {
  const [descuentos, setDescuentos] = useState([]);
  const [descuentoActual, setDescuentoActual] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'porcentaje',
    valor: '',
    fecha_inicio: '',
    fecha_fin: '',
    minimo_compra: '',
    maximo_descuento: '',
    uso_maximo: '',
    estado: 'activo'
  });

  // Cargar descuentos al montar el componente
  useEffect(() => {
    cargarDescuentos();
  }, []);

  const cargarDescuentos = async () => {
    try {
      const data = await descuentoService.obtenerDescuentos();
      setDescuentos(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los descuentos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (descuentoActual) {
        await descuentoService.actualizarDescuento(descuentoActual.id, formData);
        toast({
          title: 'Éxito',
          description: 'Descuento actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await descuentoService.crearDescuento(formData);
        toast({
          title: 'Éxito',
          description: 'Descuento creado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      cargarDescuentos();
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al procesar el descuento',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditar = (descuento) => {
    setDescuentoActual(descuento);
    setFormData({
      nombre: descuento.nombre,
      descripcion: descuento.descripcion,
      tipo: descuento.tipo,
      valor: descuento.valor,
      fecha_inicio: new Date(descuento.fecha_inicio).toISOString().split('T')[0],
      fecha_fin: new Date(descuento.fecha_fin).toISOString().split('T')[0],
      minimo_compra: descuento.minimo_compra,
      maximo_descuento: descuento.maximo_descuento || '',
      uso_maximo: descuento.uso_maximo || '',
      estado: descuento.estado
    });
    onOpen();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este descuento?')) {
      try {
        await descuentoService.eliminarDescuento(id);
        toast({
          title: 'Éxito',
          description: 'Descuento eliminado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        cargarDescuentos();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el descuento',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const resetForm = () => {
    setDescuentoActual(null);
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'porcentaje',
      valor: '',
      fecha_inicio: '',
      fecha_fin: '',
      minimo_compra: '',
      maximo_descuento: '',
      uso_maximo: '',
      estado: 'activo'
    });
  };

  const handleNuevo = () => {
    resetForm();
    onOpen();
  };

  return (
    <Box p={4}>
      <Box mb={4} display="flex" justifyContent="flex-end">
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleNuevo}>
          Nuevo Descuento
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Tipo</Th>
            <Th>Valor</Th>
            <Th>Vigencia</Th>
            <Th>Estado</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {descuentos.map((descuento) => (
            <Tr key={descuento.id}>
              <Td>{descuento.nombre}</Td>
              <Td>{descuento.tipo === 'porcentaje' ? '%' : '$'}</Td>
              <Td>{descuento.valor}</Td>
              <Td>
                {new Date(descuento.fecha_inicio).toLocaleDateString()} -
                {new Date(descuento.fecha_fin).toLocaleDateString()}
              </Td>
              <Td>
                <Badge
                  colorScheme={descuento.estado === 'activo' ? 'green' : 'red'}
                >
                  {descuento.estado}
                </Badge>
              </Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditar(descuento)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Eliminar"
                  colorScheme="red"
                  onClick={() => handleEliminar(descuento.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {descuentoActual ? 'Editar Descuento' : 'Nuevo Descuento'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                  >
                    <option value="porcentaje">Porcentaje</option>
                    <option value="monto_fijo">Monto Fijo</option>
                    <option value="producto">Por Producto</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Valor</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Fecha Inicio</FormLabel>
                  <Input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Fecha Fin</FormLabel>
                  <Input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Monto Mínimo de Compra</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      name="minimo_compra"
                      value={formData.minimo_compra}
                      onChange={handleInputChange}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Máximo Descuento</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      name="maximo_descuento"
                      value={formData.maximo_descuento}
                      onChange={handleInputChange}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Uso Máximo</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      name="uso_maximo"
                      value={formData.uso_maximo}
                      onChange={handleInputChange}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </Select>
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" type="submit">
                {descuentoActual ? 'Actualizar' : 'Crear'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GestionDescuentos;
