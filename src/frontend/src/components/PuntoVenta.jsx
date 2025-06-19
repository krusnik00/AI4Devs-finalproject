import React from 'react';
import {
  Box,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';

const PuntoVenta = () => {
  return (
    <Box>
      <Heading mb={6}>Punto de Venta</Heading>
      <Container maxW="container.xl" p={0}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">Ventas del Día</Heading>
            </CardHeader>
            <CardBody>
              <Text>Información de las ventas del día estará disponible aquí</Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Heading size="md">Productos Populares</Heading>
            </CardHeader>
            <CardBody>
              <Text>Lista de productos más vendidos aparecerá aquí</Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Heading size="md">Estado de Caja</Heading>
            </CardHeader>
            <CardBody>
              <Text>Información del estado de caja estará disponible aquí</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default PuntoVenta;
