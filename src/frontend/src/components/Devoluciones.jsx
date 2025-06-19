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
  Badge,
} from '@chakra-ui/react';

const Devoluciones = () => {
  // Datos de ejemplo
  const devoluciones = [
    { 
      id: 1, 
      fecha: '2025-06-19', 
      cliente: 'Cliente 1', 
      producto: 'Producto A',
      motivo: 'Producto defectuoso',
      estado: 'Pendiente'
    },
    { 
      id: 2, 
      fecha: '2025-06-18', 
      cliente: 'Cliente 2', 
      producto: 'Producto B',
      motivo: 'Talla incorrecta',
      estado: 'Aprobada'
    },
  ];

  return (
    <Box>
      <Heading mb={6}>Gestión de Devoluciones</Heading>
      <Container maxW="container.xl" p={0}>
        <Card>
          <CardHeader>
            <Button colorScheme="blue" size="sm">
              Nueva Devolución
            </Button>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Fecha</Th>
                  <Th>Cliente</Th>
                  <Th>Producto</Th>
                  <Th>Motivo</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {devoluciones.map((devolucion) => (
                  <Tr key={devolucion.id}>
                    <Td>{devolucion.id}</Td>
                    <Td>{devolucion.fecha}</Td>
                    <Td>{devolucion.cliente}</Td>
                    <Td>{devolucion.producto}</Td>
                    <Td>{devolucion.motivo}</Td>
                    <Td>
                      <Badge
                        colorScheme={devolucion.estado === 'Aprobada' ? 'green' : 'yellow'}
                      >
                        {devolucion.estado}
                      </Badge>
                    </Td>
                    <Td>
                      <Button size="sm" colorScheme="blue" mr={2}>
                        Ver Detalles
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

export default Devoluciones;
