// Test básico para verificar que Jest funcione correctamente
describe('Pruebas básicas', () => {
  test('1 + 1 debe ser igual a 2', () => {
    expect(1 + 1).toBe(2);
  });
  
  test('true debe ser verdadero', () => {
    expect(true).toBeTruthy();
  });
});
