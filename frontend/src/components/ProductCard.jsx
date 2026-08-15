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
        border: '1px solid #f0ede5',
        padding: '10px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="luxury-card product-card"
    >
      {/* Product Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '128%', // 3:4 Luxury fashion aspect ratio
          backgroundColor: '#f6f4ee',
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
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
          {product.limitedOffer && <span className="badge-uq red" style={{ fontSize: '0.65rem', padding: '2px 6px', letterSpacing: '0.5px' }}>{lang === 'vi' ? 'Khuyến Mãi' : 'Limited Offer'}</span>}
          {product.isNew && <span className="badge-uq black" style={{ fontSize: '0.65rem', padding: '2px 6px', letterSpacing: '0.5px' }}>{lang === 'vi' ? 'Mới' : 'New'}</span>}
          {product.bestSeller && !product.limitedOffer && <span className="badge-uq gray" style={{ fontSize: '0.65rem', padding: '2px 6px', letterSpacing: '0.5px' }}>{lang === 'vi' ? 'Bán Chạy' : 'Best Seller'}</span>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 3,
            border: '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          <Heart size={16} color={isFavorited ? '#e60012' : '#333'} fill={isFavorited ? '#e60012' : 'none'} />
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
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(12px)',
              padding: '12px 8px',
              borderTop: '1px solid #eae7e0',
              zIndex: 4,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: '700', marginBottom: '6px', color: '#444', textAlign: 'center', letterSpacing: '0.5px' }}>
              {lang === 'vi' ? 'CHỌN SIZE NHANH:' : 'QUICK SELECT SIZE:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
              {product.variants
                ?.filter((v) => !selectedVariant || v.colorName === selectedVariant.colorName)
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleQuickAddSize(v)}
                    disabled={v.totalStock <= 0}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: '1px solid #111',
                      backgroundColor: v.totalStock > 0 ? '#111' : '#f0f0f0',
                      color: v.totalStock > 0 ? '#fff' : '#aaa',
                      cursor: v.totalStock > 0 ? 'pointer' : 'not-allowed',
                      textDecoration: v.totalStock <= 0 ? 'line-through' : 'none',
                      borderRadius: '2px',
                      transition: 'all 0.15s ease'
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
      <div style={{ padding: '10px 2px 2px 2px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Color swatches */}
        {uniqueColors.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
            {uniqueColors.slice(0, 5).map((v) => (
              <button
                key={v.colorName}
                onClick={() => handleColorChange(v)}
                title={v.colorName}
                style={{
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  backgroundColor: v.colorHex,
                  border: selectedVariant?.colorName === v.colorName ? '2px solid #111' : '1px solid #d0ccc0',
                  outline: selectedVariant?.colorName === v.colorName ? '1px solid #fff' : 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              />
            ))}
            {uniqueColors.length > 5 && (
              <span style={{ fontSize: '0.68rem', color: '#888', fontWeight: '600' }}>
                +{uniqueColors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Gender / Collection Tag */}
        <div style={{ fontSize: '0.68rem', color: '#8c887b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
          {product.gender} • {product.collection || 'LifeWear'}
        </div>

        {/* Product Title */}
        <div
          onClick={() => onNavigate('product-detail', { id: product.id, slug: product.slug })}
          style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#141414',
            lineHeight: 1.35,
            marginBottom: '6px',
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', marginBottom: '6px' }}>
          {product.salePrice ? (
            <>
              <span className="text-sale-price" style={{ fontSize: '1.05rem', fontWeight: '800', color: '#e60012' }}>{formatPrice(product.salePrice)}</span>
              <span className="text-old-price" style={{ fontSize: '0.82rem', color: '#999', textDecoration: 'line-through' }}>{formatPrice(product.basePrice)}</span>
            </>
          ) : (
            <span className="text-price" style={{ fontSize: '1rem', fontWeight: '800', color: '#111' }}>{formatPrice(product.basePrice)}</span>
          )}
        </div>

        {/* Rating and Quick Add trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '2px', paddingTop: '6px', borderTop: '1px solid #f2eee6', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#666' }}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: '700', color: '#111', fontSize: '0.78rem' }}>
              {Number(product.averageRating || 5.0).toFixed(1)}
            </span>
          </div>

          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.68rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '3px 8px',
              border: '1px solid #111',
              backgroundColor: showQuickAdd ? '#111' : '#ffffff',
              color: showQuickAdd ? '#fff' : '#111',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Plus size={11} />
            <span>{lang === 'vi' ? 'Thêm' : 'Quick Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
