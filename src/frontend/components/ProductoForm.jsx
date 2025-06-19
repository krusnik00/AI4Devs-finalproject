import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  Stack,
  useToast,
  Image,
  VStack,
  HStack,
  Text,
  IconButton
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const ProductoForm = ({ producto, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion_corta: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    precio_compra: '',
    precio_venta: '',
    stock_minimo: '',
    stock_actual: '',
    ubicacion: '',
    imagen: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (producto) {
      setFormData({
        ...producto,
        imagen: null // La imagen se maneja separadamente
      });
      if (producto.imagen_url) {
        setPreviewImage(producto.imagen_url);
      }
    }
    cargarCatalogos();
  }, [producto]);

  const cargarCatalogos = async () => {
    try {
      // Cargar categorías
      const resCategorias = await fetch('/api/categorias');
      const dataCategorias = await resCategorias.json();
      setCategorias(dataCategorias.data);

      // Cargar marcas
      const resMarcas = await fetch('/api/marcas');
      const dataMarcas = await resMarcas.json();
      setMarcas(dataMarcas.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los catálogos',
        status: 'error',
        duration: 5000,
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

  const handleNumberInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null
    }));
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.descripcion_corta || !formData.categoriaId || !formData.marcaId) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Crear FormData para enviar la imagen
    const sendData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'imagen' && formData[key]) {
        sendData.append('imagen', formData[key]);
      } else if (formData[key] !== null && formData[key] !== undefined) {
        sendData.append(key, formData[key]);
      }
    });

    try {
      await onSubmit(sendData);
      // Limpiar formulario después del éxito
      if (!isEditing) {
        setFormData({
          codigo: '',
          nombre: '',
          descripcion_corta: '',
          descripcion: '',
          categoriaId: '',
          marcaId: '',
          precio_compra: '',
          precio_venta: '',
          stock_minimo: '',
          stock_actual: '',
          ubicacion: '',
          imagen: null
        });
        setPreviewImage(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar el producto',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4}>
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Código</FormLabel>
            <Input
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              placeholder="Código del producto"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Nombre</FormLabel>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Nombre del producto"
            />
          </FormControl>
        </HStack>

        <FormControl isRequired>
          <FormLabel>Descripción Corta</FormLabel>
          <Input
            name="descripcion_corta"
            value={formData.descripcion_corta}
            onChange={handleInputChange}
            placeholder="Descripción corta del producto"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Descripción Detallada</FormLabel>
          <Textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción detallada del producto"
          />
        </FormControl>

        <HStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Categoría</FormLabel>
            <Select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleInputChange}
              placeholder="Seleccione una categoría"
            >
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Marca</FormLabel>
            <Select
              name="marcaId"
              value={formData.marcaId}
              onChange={handleInputChange}
              placeholder="Seleccione una marca"
            >
              {marcas.map(marca => (
                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
              ))}
            </Select>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Precio de Compra</FormLabel>
            <NumberInput
              min={0}
              value={formData.precio_compra}
              onChange={(value) => handleNumberInputChange('precio_compra', value)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Precio de Venta</FormLabel>
            <NumberInput
              min={0}
              value={formData.precio_venta}
              onChange={(value) => handleNumberInputChange('precio_venta', value)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Stock Mínimo</FormLabel>
            <NumberInput
              min={0}
              value={formData.stock_minimo}
              onChange={(value) => handleNumberInputChange('stock_minimo', value)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Stock Actual</FormLabel>
            <NumberInput
              min={0}
              value={formData.stock_actual}
              onChange={(value) => handleNumberInputChange('stock_actual', value)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>Ubicación en Almacén</FormLabel>
          <Input
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleInputChange}
            placeholder="Ubicación en almacén"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Imagen del Producto</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            display="none"
            id="imagen-producto"
          />
          <Button as="label" htmlFor="imagen-producto">
            Seleccionar Imagen
          </Button>
          
          {previewImage && (
            <Box mt={2} position="relative" maxW="200px">
              <Image src={previewImage} alt="Vista previa" />
              <IconButton
                icon={<DeleteIcon />}
                position="absolute"
                top={0}
                right={0}
                onClick={removeImage}
                colorScheme="red"
                aria-label="Eliminar imagen"
              />
            </Box>
          )}
        </FormControl>

        <Button type="submit" colorScheme="blue" mt={4}>
          {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </VStack>
    </Box>
  );
};

export default ProductoForm;
