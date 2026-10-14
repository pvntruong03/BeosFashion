import { describe, expect, it } from 'vitest';
import { buildVariantMatrix, isAdultVariant, sortSizes } from './productVariants';

describe('product variant rules', () => {
  it('hides inactive and legacy numeric variants', () => {
    expect(isAdultVariant({ size: 'M', active: true })).toBe(true);
    expect(isAdultVariant({ size: '100', active: true })).toBe(false);
    expect(isAdultVariant({ size: 'L', active: false })).toBe(false);
  });

  it('sorts adult apparel sizes in shopping order without duplicates', () => {
    expect(sortSizes(['XL', 'S', 'M', 'S', 'FREE'])).toEqual(['FREE', 'S', 'M', 'XL']);
  });

  it('preserves IDs, SKUs, barcodes, and stock when editing an existing matrix', () => {
    const existing = {
      id: 42,
      colorName: '09 BLACK',
      colorHex: '#111111',
      size: 'M',
      sku: 'BEO-OLD-09-M',
      barcode: '455001234567',
      totalStock: 17,
      imageUrl: 'old-image.jpg',
      active: true,
    };

    const matrix = buildVariantMatrix({
      colors: ['09 BLACK'],
      sizes: ['M', 'L'],
      productCode: 'BEO-NEW',
      imageUrl: 'new-image.jpg',
      existingVariants: [existing],
      barcodeFactory: () => '455009999999',
    });

    expect(matrix[0]).toMatchObject({
      id: 42,
      sku: 'BEO-OLD-09-M',
      barcode: '455001234567',
      totalStock: 17,
    });
    expect(matrix[1]).toMatchObject({
      size: 'L',
      sku: 'BEO-NEW-09-L',
      barcode: '455009999999',
      totalStock: 50,
    });
  });
});
