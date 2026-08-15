import React, { useState } from 'react';
import { Heart, Star, Plus, Check } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

export const ProductCard = ({ product, onNavigate }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice, lang } = useLanguage();

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [activeImage, setActiveImage] = useState(
    selectedVariant?.imageUrl || product.primaryImageUrl
  );
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const isFavorited = isInWishlist(product.id);

  // Group unique colors for swatches
  const colorMap = new Map();
  if (product.variants) {
    product.variants.forEach((v) => {
      if (!colorMap.has(v.colorName)) {
        colorMap.set(v.colorName, v);
      }
    });
  }
  const uniqueColors = Array.from(colorMap.values());

  const handleColorChange = (variant) => {
    setSelectedVariant(variant);
    if (variant.imageUrl) {
      setActiveImage(variant.imageUrl);
    }
  };

  const handleQuickAddSize = async (variant) => {
    await addToCart(variant.id, 1, true);
    setShowQuickAdd(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        transition: 'var(--transition)',
      }}
      className="product-card"
    >
      {/* Product Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '125%', // 4:5 aspect ratio
          backgroundColor: '#f8f8f8',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => onNavigate('product-detail', { id: product.id, slug: product.slug })}
      >
        <img
          src={activeImage}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
          {product.limitedOffer && <span className="badge-uq red">{lang === 'vi' ? 'Khuyến Mãi Có Hạn' : 'Limited Offer'}</span>}
          {product.isNew && <span className="badge-uq black">{lang === 'vi' ? 'Mới' : 'New'}</span>}
          {product.bestSeller && !product.limitedOffer && <span className="badge-uq gray">{lang === 'vi' ? 'Bán Chạy' : 'Best Seller'}</span>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            zIndex: 3,
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          <Heart size={18} color={isFavorited ? '#e60012' : '#333'} fill={isFavorited ? '#e60012' : 'none'} />
        </button>

        {/* Quick Add Flyout Overlay */}
        {showQuickAdd && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              padding: '12px',
              borderTop: '1px solid #eee',
              zIndex: 4,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px', color: '#666', textAlign: 'center' }}>
              {lang === 'vi' ? 'CHỌN SIZE ĐỂ THÊM NHANH:' : 'SELECT SIZE FOR QUICK ADD:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {product.variants
                ?.filter((v) => !selectedVariant || v.colorName === selectedVariant.colorName)
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleQuickAddSize(v)}
                    disabled={v.totalStock <= 0}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: '1px solid #111',
                      backgroundColor: v.totalStock > 0 ? '#fff' : '#f0f0f0',
                      color: v.totalStock > 0 ? '#111' : '#aaa',
                      cursor: v.totalStock > 0 ? 'pointer' : 'not-allowed',
                      textDecoration: v.totalStock <= 0 ? 'line-through' : 'none'
                    }}
                  >
                    {v.size}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div style={{ padding: '8px 0 4px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Color swatches */}
        {uniqueColors.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
            {uniqueColors.slice(0, 5).map((v) => (
              <button
                key={v.colorName}
                onClick={() => handleColorChange(v)}
                title={v.colorName}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: v.colorHex,
                  border: selectedVariant?.colorName === v.colorName ? '2px solid #111' : '1px solid #ccc',
                  outline: selectedVariant?.colorName === v.colorName ? '1px solid #fff' : 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              />
            ))}
            {uniqueColors.length > 5 && (
              <span style={{ fontSize: '0.7rem', color: '#888' }}>
                +{uniqueColors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Gender / Collection Tag */}
        <div style={{ fontSize: '0.7rem', color: '#767676', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>
          {product.gender} • {product.collection || 'LifeWear'}
        </div>

        {/* Product Title */}
        <div
          onClick={() => onNavigate('product-detail', { id: product.id, slug: product.slug })}
          style={{
            fontSize: '0.88rem',
            fontWeight: '600',
            color: '#111',
            lineHeight: 1.3,
            marginBottom: '4px',
            cursor: 'pointer',
            minHeight: '2.4em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', marginBottom: '4px' }}>
          {product.salePrice ? (
            <>
              <span className="text-sale-price" style={{ fontSize: '1.05rem' }}>{formatPrice(product.salePrice)}</span>
              <span className="text-old-price" style={{ fontSize: '0.82rem' }}>{formatPrice(product.basePrice)}</span>
            </>
          ) : (
            <span className="text-price" style={{ fontSize: '0.98rem' }}>{formatPrice(product.basePrice)}</span>
          )}
        </div>

        {/* Rating and Quick Add trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#666' }}>
            <Star size={13} color="#ffab00" fill="#ffab00" />
            <span style={{ fontWeight: '700', color: '#111' }}>{product.averageRating || 5.0}</span>
          </div>

          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.7rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#111',
              padding: '3px 6px',
              border: '1px solid #e0e0e0',
              backgroundColor: '#fafafa',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            <Plus size={11} />
            <span>{lang === 'vi' ? 'Thêm' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
