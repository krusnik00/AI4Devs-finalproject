describe('Pruebas básicas', () => {
  test('1 + 1 = 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('true debe ser verdadero', () => {
    expect(true).toBeTruthy();
  });

  test('array vacío tiene longitud 0', () => {
    expect([]).toHaveLength(0);
  });
});
