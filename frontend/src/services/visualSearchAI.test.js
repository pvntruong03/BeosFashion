import { describe, expect, it } from 'vitest';
import { productLabel } from './visualSearchAI';

describe('CLIP catalog labels', () => {
  it('uses product attributes and only active colors', () => {
    const label = productLabel({
      name: 'Premium Linen Shirt',
      categoryName: 'Mens Tops',
      gender: 'MEN',
      material: '100% Linen',
      variants: [
        { colorName: '09 BLACK', active: true },
        { colorName: 'Old Red', active: false }
      ]
    });

    expect(label).toContain('Premium Linen Shirt');
    expect(label).toContain('09 BLACK');
    expect(label).not.toContain('Old Red');
  });
});
