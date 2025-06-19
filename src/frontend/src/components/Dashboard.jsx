import React from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Stack,
} from '@chakra-ui/react';

const Dashboard = () => {
  return (
    <Container maxW={'3xl'}>
      <Stack
        as={Box}
        textAlign={'center'}
        spacing={{ base: 8, md: 14 }}
        py={{ base: 20, md: 36 }}>
        <Heading
          fontWeight={600}
          fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
          lineHeight={'110%'}>
          Bienvenido al <br />
          <Text as={'span'} color={'blue.400'}>
            Panel de Control
          </Text>
        </Heading>
        <Text color={'gray.500'}>
          Has iniciado sesión correctamente. Este es el dashboard de tu aplicación.
        </Text>
      </Stack>
    </Container>
  );
};

export default Dashboard;
