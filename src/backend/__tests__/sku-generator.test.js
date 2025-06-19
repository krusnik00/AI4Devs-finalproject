const { generateSKU, generateProductCode } = require('../../utils/sku-generator');

describe('SKU Generator', () => {
    test('generateSKU should create a valid SKU format', async () => {
        const sku = await generateSKU('Frenos', 'BREMBO', 'F150');
        expect(sku).toMatch(/^FRE-BRE-F15-\d{4}$/);
    });

    test('generateSKU should handle missing modelo', async () => {
        const sku = await generateSKU('Frenos', 'BREMBO');
        expect(sku).toMatch(/^FRE-BRE-GEN-\d{4}$/);
    });

    test('generateProductCode should create a valid 8-character code', () => {
        const code = generateProductCode();
        expect(code).toMatch(/^[A-F0-9]{8}$/);
    });
});
