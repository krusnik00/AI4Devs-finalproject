const descuentoService = require('../../services/descuento.service');
const { Descuento } = require('../../models');

describe('DescuentoService', () => {
  describe('calcularDescuento', () => {
    it('debe calcular correctamente un descuento porcentual', async () => {
      const venta = {
        subtotal: 1000,
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 500 }
        ]
      };

      const descuento = {
        tipo: 'porcentaje',
        valor: 10,
        minimo_compra: 0,
        condiciones: {}
      };

      const resultado = await descuentoService.calcularDescuento(venta, [descuento]);
      expect(resultado.valor).toBe(100); // 10% de 1000
      expect(resultado.descuento).toBeDefined();
    });

    it('debe calcular correctamente un descuento de monto fijo', async () => {
      const venta = {
        subtotal: 1000,
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 500 }
        ]
      };

      const descuento = {
        tipo: 'monto_fijo',
        valor: 50,
        minimo_compra: 0,
        condiciones: {}
      };

      const resultado = await descuentoService.calcularDescuento(venta, [descuento]);
      expect(resultado.valor).toBe(50);
    });

    it('no debe aplicar descuento si no se cumple el monto mínimo', async () => {
      const venta = {
        subtotal: 100,
        productos: [
          { producto_id: 1, cantidad: 1, precio_unitario: 100 }
        ]
      };

      const descuento = {
        tipo: 'porcentaje',
        valor: 10,
        minimo_compra: 200,
        condiciones: {}
      };

      const resultado = await descuentoService.calcularDescuento(venta, [descuento]);
      expect(resultado.valor).toBe(0);
      expect(resultado.descuento).toBeNull();
    });

    it('debe respetar el máximo descuento permitido', async () => {
      const venta = {
        subtotal: 1000,
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 500 }
        ]
      };

      const descuento = {
        tipo: 'porcentaje',
        valor: 20,
        minimo_compra: 0,
        maximo_descuento: 150,
        condiciones: {}
      };

      const resultado = await descuentoService.calcularDescuento(venta, [descuento]);
      expect(resultado.valor).toBe(150); // Debería ser 150 en lugar de 200 (20% de 1000)
    });
  });

  describe('validarCondiciones', () => {
    it('debe validar correctamente las condiciones por tipo de cliente', () => {
      const venta = {
        subtotal: 1000,
        cliente: { tipo: 'mayorista' },
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 500 }
        ]
      };

      const descuento = {
        minimo_compra: 0,
        condiciones: {
          tipo_cliente: 'mayorista'
        }
      };

      expect(descuentoService.validarCondiciones(venta, descuento)).toBe(true);
    });

    it('debe validar correctamente las condiciones por producto', () => {
      const venta = {
        subtotal: 1000,
        productos: [
          { producto_id: 1, cantidad: 2, precio_unitario: 500 }
        ]
      };

      const descuento = {
        minimo_compra: 0,
        condiciones: {
          productos: [1, 2, 3]
        }
      };

      expect(descuentoService.validarCondiciones(venta, descuento)).toBe(true);
    });
  });
});
