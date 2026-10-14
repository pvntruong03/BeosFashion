export const isAdultVariant = (variant) => variant.active !== false &&
  !/^(?:[5-9]0|1[0-6]0)$/.test(String(variant.size).trim());

export const sortSizes = (sizes) => {
  const order = ['FREE', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
  return [...new Set(sizes)].sort((a, b) => {
    const left = order.indexOf(a), right = order.indexOf(b);
    return (left < 0 ? 100 : left) - (right < 0 ? 100 : right) || String(a).localeCompare(String(b), undefined, { numeric: true });
  });
};

const DEFAULT_COLOR_HEX = {
  '09 BLACK': '#111111',
  '00 WHITE': '#ffffff',
  '68 BLUE': '#2980b9',
  '32 BEIGE': '#d2b48c',
  '03 GRAY': '#7f8c8d',
  '12 PINK': '#fadbd8',
};

const variantKey = (colorName, size) => `${String(colorName).trim()}::${String(size).trim()}`;

export const buildVariantMatrix = ({
  colors,
  sizes,
  productCode,
  imageUrl,
  existingVariants = [],
  barcodeFactory = () => '45500' + Math.floor(1000000 + Math.random() * 9000000),
}) => {
  const existingByCombination = new Map(
    existingVariants.map((variant) => [variantKey(variant.colorName, variant.size), variant])
  );

  return colors.flatMap((colorName) => sizes.map((size) => {
    const existing = existingByCombination.get(variantKey(colorName, size));
    if (existing) {
      return {
        id: existing.id,
        colorName,
        colorHex: existing.colorHex || DEFAULT_COLOR_HEX[colorName] || '#000000',
        size,
        sku: existing.sku,
        barcode: existing.barcode,
        priceAdjustment: existing.priceAdjustment ?? 0,
        totalStock: existing.totalStock ?? 0,
        imageUrl: existing.imageUrl || imageUrl,
        active: existing.active !== false,
      };
    }

    return {
      colorName,
      colorHex: DEFAULT_COLOR_HEX[colorName] || '#000000',
      size,
      sku: `${productCode}-${String(colorName).substring(0, 2)}-${size}`,
      barcode: barcodeFactory(),
      totalStock: 50,
      imageUrl,
    };
  }));
};
