import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  InputGroup,
  InputLeftAddon,
  FormErrorMessage,
  RadioGroup,
  Radio,
  Divider,
  NumberInput,
  NumberInputField,
  Flex,
  Text,
  Badge,
  Switch,
  useBreakpointValue
} from '@chakra-ui/react';

const initialFormData = {
  tipo: 'particular',
  nombre: '',
  apellido: '',
  empresa: '',
  rfc: '',
  correo: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  estado: '',
  codigo_postal: '',
  notas: '',
  limite_credito: 0,
  dias_credito: 0,
  activo: true
};

const ClienteForm = ({ isOpen, onClose, onSubmit, cliente }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Layout responsivo
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Inicializar form cuando se edita un cliente
  useEffect(() => {
    if (cliente) {
      setFormData({
        tipo: cliente.tipo || 'particular',
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        empresa: cliente.empresa || '',
        rfc: cliente.rfc || '',
        correo: cliente.correo || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        estado: cliente.estado || '',
        codigo_postal: cliente.codigo_postal || '',
        notas: cliente.notas || '',
        limite_credito: cliente.limite_credito || 0,
        dias_credito: cliente.dias_credito || 0,
        activo: cliente.activo !== undefined ? cliente.activo : true
      });
    } else {
      // Limpiar datos si es nuevo cliente
      setFormData(initialFormData);
    }
    
    // Limpiar errores
    setErrors({});
  }, [cliente, isOpen]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar errores al cambiar un campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Manejar cambios en campos numéricos
  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Validación básica
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    
    if (formData.tipo === 'empresa' && !formData.empresa.trim()) {
      newErrors.empresa = "El nombre de la empresa es obligatorio";
    }
    
    if (formData.correo && !/^\S+@\S+\.\S+$/.test(formData.correo)) {
      newErrors.correo = "Formato de correo inválido";
    }
    
    if (formData.rfc && formData.rfc.length !== 13) {
      newErrors.rfc = "El RFC debe tener 13 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            {cliente && (
              <Badge ml={2} colorScheme={cliente.activo ? 'green' : 'red'}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            )}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Tipo de cliente */}
              <FormControl>
                <FormLabel>Tipo de Cliente</FormLabel>
                <RadioGroup
                  value={formData.tipo}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo: value }));
                  }}
                >
                  <HStack spacing={5}>
                    <Radio value="particular">Particular</Radio>
                    <Radio value="empresa">Empresa</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              
              <Divider />
              
              {/* Información básica */}
              {formData.tipo === 'particular' ? (
                <Flex direction={isMobile ? "column" : "row"} gap={4}>
                  <FormControl isRequired isInvalid={!!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    <FormErrorMessage>{errors.nombre}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Apellido</FormLabel>
                    <Input
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                    />
                  </FormControl>
                </Flex>
              ) : (
                <FormControl isRequired isInvalid={!!errors.empresa}>
                  <FormLabel>Nombre de la Empresa</FormLabel>
                  <Input
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.empresa}</FormErrorMessage>
                </FormControl>
              )}
              
              {/* RFC */}
              <FormControl isInvalid={!!errors.rfc}>
                <FormLabel>RFC</FormLabel>
                <Input
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleChange}
                  maxLength={13}
                />
                <FormErrorMessage>{errors.rfc}</FormErrorMessage>
              </FormControl>
              
              {/* Contacto */}
              <Flex direction={isMobile ? "column" : "row"} gap={4}>
                <FormControl isInvalid={!!errors.correo}>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <Input
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.correo}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    maxLength={15}
                  />
                </FormControl>
              </Flex>
              
              <Divider />
              
              {/* Dirección */}
              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  rows={2}
                />
              </FormControl>
              
              <Flex direction={isMobile ? "column" : "row"} gap={4}>
                <FormControl>
                  <FormLabel>Ciudad</FormLabel>
                  <Input
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Input
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Código Postal</FormLabel>
                  <Input
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </FormControl>
              </Flex>
              
              <Divider />
              
              {/* Información de crédito */}
              <Text fontWeight="medium">Información de Crédito</Text>
              
              <Flex direction={isMobile ? "column" : "row"} gap={4}>
                <FormControl>
                  <FormLabel>Límite de Crédito</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>$</InputLeftAddon>
                    <NumberInput
                      min={0}
                      value={formData.limite_credito}
                      onChange={(value) => handleNumberChange('limite_credito', Number(value))}
                    >
                      <NumberInputField borderLeftRadius={0} />
                    </NumberInput>
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Días de Crédito</FormLabel>
                  <NumberInput
                    min={0}
                    max={90}
                    value={formData.dias_credito}
                    onChange={(value) => handleNumberChange('dias_credito', Number(value))}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </Flex>
              
              {/* Notas */}
              <FormControl>
                <FormLabel>Notas adicionales</FormLabel>
                <Textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={3}
                />
              </FormControl>
              
              {/* Estado (solo para edición) */}
              {cliente && (
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="activo" mb="0">
                    Cliente activo
                  </FormLabel>
                  <Switch
                    id="activo"
                    name="activo"
                    isChecked={formData.activo}
                    onChange={handleChange}
                    colorScheme="green"
                  />
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Guardando"
            >
              {cliente ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ClienteForm;
