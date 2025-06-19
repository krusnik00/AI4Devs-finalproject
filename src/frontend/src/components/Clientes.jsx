import React from 'react';
import {
  Box,
  Heading,
  Container,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from '@chakra-ui/react';

const Clientes = () => {
  // Datos de ejemplo
  const clientes = [
    { id: 1, nombre: 'Cliente 1', email: 'cliente1@example.com', telefono: '123-456-7890' },
    { id: 2, nombre: 'Cliente 2', email: 'cliente2@example.com', telefono: '123-456-7891' },
    { id: 3, nombre: 'Cliente 3', email: 'cliente3@example.com', telefono: '123-456-7892' },
  ];

  return (
    <Box>
      <Heading mb={6}>Gestión de Clientes</Heading>
      <Container maxW="container.xl" p={0}>
        <Card>
          <CardHeader>
            <Button colorScheme="blue" size="sm">
              Nuevo Cliente
            </Button>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Nombre</Th>
                  <Th>Email</Th>
                  <Th>Teléfono</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {clientes.map((cliente) => (
                  <Tr key={cliente.id}>
                    <Td>{cliente.id}</Td>
                    <Td>{cliente.nombre}</Td>
                    <Td>{cliente.email}</Td>
                    <Td>{cliente.telefono}</Td>
                    <Td>
                      <Button size="sm" colorScheme="blue" mr={2}>
                        Editar
                      </Button>
                      <Button size="sm" colorScheme="red">
                        Eliminar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Clientes;
