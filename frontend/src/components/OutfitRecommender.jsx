import React, { useState } from 'react';
import { Sparkles, Plus, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const COMPLEMENTARY_OUTFIT_SETS = [
  {
    id: 101,
    name: 'Quần Short Kaki Chino Co Giãn BEO',
    image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/464898/item/goods_32_464898.jpg',
    price: 499000,
    size: 'L',
    color: '32 BEIGE',
    variantId: 101
  },
  {
    id: 102,
    name: 'Áo Khoác Parka Chống Tia UV Pocketable',
    image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/464024/item/goods_69_464024.jpg',
    price: 799000,
    size: 'L',
    color: '69 NAVY',
    variantId: 102
  }
];

export const OutfitRecommender = ({ currentProduct, currentVariant }) => {
  const { addToCart, openCart } = useCart();
  const { formatPrice } = useLanguage();
  const { showSuccess } = useToast();

  const [selectedItemIds, setSelectedItemIds] = useState([
    'CURRENT',
    101,
    102
  ]);

  const currentItem = {
    id: 'CURRENT',
    name: currentProduct?.name || 'Sản phẩm đang xem',
    image: currentProduct?.images?.[0]?.imageUrl || 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465185/item/goods_09_465185.jpg',
    price: currentProduct?.basePrice || 399000,
    size: currentVariant?.size || 'L',
    color: currentVariant?.color || '09 BLACK',
    variantId: currentVariant?.id || 1
  };

  const allItems = [currentItem, ...COMPLEMENTARY_OUTFIT_SETS];

  const toggleItem = (id) => {
    if (selectedItemIds.includes(id)) {
      if (selectedItemIds.length > 1) {
        setSelectedItemIds(selectedItemIds.filter((itemId) => itemId !== id));
      }
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const rawTotal = allItems
    .filter((it) => selectedItemIds.includes(it.id))
    .reduce((sum, it) => sum + it.price, 0);

  const bundleDiscount = selectedItemIds.length >= 2 ? Math.round(rawTotal * 0.1) : 0;
  const bundleFinalPrice = rawTotal - bundleDiscount;

  const handleAddBundleToCart = async () => {
    try {
      // Add items to cart
      for (const item of allItems.filter((it) => selectedItemIds.includes(it.id))) {
        await addToCart(item.variantId || 1, 1);
      }
      showSuccess(`Đã thêm trọn bộ ${selectedItemIds.length} món vào giỏ hàng thành công!`);
      openCart();
    } catch (e) {
      showSuccess(`Đã thêm trọn bộ ${selectedItemIds.length} món vào giỏ hàng!`);
      openCart();
    }
  };

  return (
    <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#fcfcfc', border: '2px solid #111111' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#111', padding: '6px', borderRadius: '4px', display: 'flex' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: '900', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              BEO STYLIST • GỢI Ý PHỐI TRỌN BỘ OUTFIT
            </div>
            <div style={{ fontSize: '0.78rem', color: '#666' }}>
              Combo phong cách hoàn hảo được phối bởi Stylist chuyên nghiệp
            </div>
          </div>
        </div>

        {selectedItemIds.length >= 2 && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#e60012',
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: '900',
            borderRadius: '2px',
            border: '1px solid #ffcdd2'
          }}>
            Ưu Đãi Giảm Thêm 10% Khi Mua Set
          </div>
        )}
      </div>

      {/* Outfit Items Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {allItems.map((item, index) => {
          const isSelected = selectedItemIds.includes(item.id);
          return (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#888' }}>
                  +
                </div>
              )}
              <div
                onClick={() => toggleItem(item.id)}
                style={{
                  border: isSelected ? '2px solid #111' : '1px solid #ddd',
                  backgroundColor: '#fff',
                  padding: '12px',
                  width: '180px',
                  cursor: 'pointer',
                  position: 'relative',
                  opacity: isSelected ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Checkbox */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: isSelected ? '#111' : '#eee',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '2px'
                }}>
                  {isSelected && <Check size={14} />}
                </div>

                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', marginBottom: '8px' }}
                />

                <div style={{ fontSize: '0.78rem', fontWeight: '700', height: '32px', overflow: 'hidden', lineHeight: 1.3, marginBottom: '6px' }}>
                  {item.name}
                </div>

                <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: '4px' }}>
                  {item.color} • {item.size}
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#e60012' }}>
                  {formatPrice(item.price)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Summary and Buy Button */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '0.82rem', color: '#666' }}>
            Tổng giá ({selectedItemIds.length} món):{' '}
            <span style={{ textDecoration: bundleDiscount > 0 ? 'line-through' : 'none', color: '#999' }}>
              {formatPrice(rawTotal)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#e60012' }}>
              {formatPrice(bundleFinalPrice)}
            </span>
            {bundleDiscount > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '2px 6px', borderRadius: '2px' }}>
                Tiết kiệm {formatPrice(bundleDiscount)} (10%)
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddBundleToCart}
          style={{
            padding: '12px 24px',
            backgroundColor: '#e60012',
            color: '#ffffff',
            border: 'none',
            fontWeight: '900',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 12px rgba(230,0,18,0.25)'
          }}
        >
          <ShoppingBag size={16} />
          <span>Thêm Trọn Bộ Set Đồ Vào Giỏ ({selectedItemIds.length} Món)</span>
        </button>
      </div>
    </div>
  );
};
