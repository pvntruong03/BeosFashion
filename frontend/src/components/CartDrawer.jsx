import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

const parseCustomization = (rawNotes) => {
  if (!rawNotes) return null;
  try {
    const details = JSON.parse(rawNotes);
    return details?.isCustomized ? details : null;
  } catch {
    return null;
  }
};

export const CartDrawer = ({ onNavigate }) => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();
  const { formatPrice, t, lang } = useLanguage();

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subTotal = cart?.subTotal || 0;
  const freeThreshold = 500000;
  const remainingForFreeShip = Math.max(freeThreshold - subTotal, 0);
  const progressPercent = Math.min((subTotal / freeThreshold) * 100, 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop click to close */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Drawer content */}
      <div
        className="animate-drawer"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-drawer)',
          zIndex: 2001
        }}
      >
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="#e60012" />
            <span style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
              {t('shopping_cart')} ({items.length})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ padding: '4px', color: '#666', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{ backgroundColor: '#fcfcfc', padding: '14px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', marginBottom: '6px' }}>
            <Truck size={16} color={remainingForFreeShip === 0 ? '#00875a' : '#e60012'} />
            {remainingForFreeShip === 0 ? (
              <span style={{ color: '#00875a', fontWeight: '700' }}>{t('free_shipping_achieved')}</span>
            ) : (
              <span>
                {lang === 'vi' ? (
                  <>Mua thêm <strong>{formatPrice(remainingForFreeShip)}</strong> để được <strong>Miễn phí vận chuyển</strong></>
                ) : (
                  <>Add <strong>{formatPrice(remainingForFreeShip)}</strong> more to get <strong>Free Standard Shipping</strong></>
                )}
              </span>
            )}
          </div>
          <div style={{ height: '6px', backgroundColor: '#e5e5e5', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: remainingForFreeShip === 0 ? '#00875a' : '#e60012',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <ShoppingBag size={48} color="#ccc" style={{ marginBottom: '16px' }} />
              <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '8px' }}>{t('empty_cart')}</div>
              <p style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
                {lang === 'vi' ? 'Hãy khám phá các sản phẩm BEO Essentials mới nhất!' : 'Discover the latest BEO Essentials collection!'}
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('products');
                }}
                className="btn-beo btn-beo-primary"
                style={{ width: '100%' }}
              >
                {lang === 'vi' ? 'Tiếp tục mua sắm' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => {
                const customization = parseCustomization(item.customNotes);
                return (
                  <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
                    }}
                    style={{ width: '74px', height: '90px', objectFit: 'cover', backgroundColor: '#f5f5f5' }}
                  />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111', lineHeight: 1.3 }}>
                        {customization?.apparelName || item.productName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.8rem', color: '#666' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.colorHex, border: '1px solid #ccc' }} />
                          {item.colorName}
                        </span>
                        <span>|</span>
                        <span>Size: <strong>{item.size}</strong></span>
                      </div>
                      {customization && (
                        <div style={{ marginTop: '7px', padding: '7px 9px', backgroundColor: '#fff6f6', borderLeft: '3px solid #e60012', fontSize: '0.74rem', color: '#444', lineHeight: 1.45 }}>
                          <div style={{ fontWeight: '800', color: '#b0000e', marginBottom: '2px' }}>
                            {lang === 'vi' ? 'BEO CUSTOM LAB' : 'BEO CUSTOM LAB'}
                          </div>
                          {customization.text && <div>{lang === 'vi' ? 'Nội dung' : 'Text'}: <strong>{customization.text}</strong></div>}
                          <div>{customization.position}</div>
                          <div>{customization.font} • {customization.threadColor}</div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      {/* Quantity selector */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '4px 8px', color: '#555', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: '600' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '4px 8px', color: '#555', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price & delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                          {formatPrice(item.subTotal)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ color: '#999', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          title={lang === 'vi' ? 'Xóa' : 'Remove'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e5e5', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{t('subtotal')}</span>
              <span style={{ fontSize: '1.15rem', fontWeight: '800' }}>{formatPrice(subTotal)}</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '16px' }}>
              {lang === 'vi' ? 'Thuế VAT và phí vận chuyển sẽ được tính khi thanh toán' : 'Taxes and shipping fees calculated at checkout'}
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onNavigate('checkout');
              }}
              className="btn-beo btn-beo-red"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <span>{t('checkout')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
