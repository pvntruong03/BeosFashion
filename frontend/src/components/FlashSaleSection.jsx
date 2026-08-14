import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight, Zap, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FLASH_SALE_ITEMS = [
  {
    id: 21,
    name: 'Áo Thun Cổ Tròn AIRism Chống Nhăn',
    image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465185/item/goods_09_465185.jpg',
    originalPrice: 399000,
    salePrice: 249000,
    discountPct: 38,
    soldPct: 88,
    soldCount: 142,
    tag: 'Bán Chạy Nhất'
  },
  {
    id: 22,
    name: 'Áo Khoác Chống Tia UV BEO Pocketable',
    image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/464024/item/goods_69_464024.jpg',
    originalPrice: 799000,
    salePrice: 499000,
    discountPct: 38,
    soldPct: 76,
    soldCount: 98,
    tag: 'Công Nghệ UV'
  },
  {
    id: 23,
    name: 'Quần Short Kaki Chino Co Giãn Thoải Mái',
    image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/464898/item/goods_32_464898.jpg',
    originalPrice: 599000,
    salePrice: 399000,
    discountPct: 33,
    soldPct: 92,
    soldCount: 185,
    tag: 'Sắp Cháy Hàng'
  },
  {
    id: 24,
    name: 'Áo Sơ Mi Vải Linen Dệt Tự Nhiên Cao Cấp',
    image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465201/item/goods_00_465201.jpg',
    originalPrice: 899000,
    salePrice: 599000,
    discountPct: 33,
    soldPct: 65,
    soldCount: 74,
    tag: 'Linen Collection'
  }
];

export const FlashSaleSection = ({ onNavigate }) => {
  const { formatPrice } = useLanguage();

  // 4-hour countdown loop
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section style={{ backgroundColor: '#ffffff', padding: '36px 0', borderBottom: '1px solid #eee' }}>
      <div className="container">
        {/* Flash Sale Header Banner */}
        <div style={{
          backgroundColor: '#111111',
          color: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          borderRadius: '2px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Title with Pulsing Flame */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#e60012',
              color: '#ffffff',
              padding: '6px 12px',
              fontWeight: '900',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '1px'
            }}>
              <Flame size={20} color="#fff" />
              <span>FLASH SALE</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e0e0e0' }}>
              Khung Giờ Vàng Săn Deal Thời Trang BEO
            </div>
          </div>

          {/* Countdown Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#bbb' }}>
              <Clock size={16} />
              <span>KẾT THÚC SAU:</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                backgroundColor: '#ffffff',
                color: '#111111',
                fontWeight: '900',
                fontSize: '1.05rem',
                padding: '4px 8px',
                borderRadius: '2px',
                minWidth: '32px',
                textAlign: 'center'
              }}>
                {pad(timeLeft.hours)}
              </span>
              <span style={{ fontWeight: '900', color: '#fff' }}>:</span>
              <span style={{
                backgroundColor: '#ffffff',
                color: '#111111',
                fontWeight: '900',
                fontSize: '1.05rem',
                padding: '4px 8px',
                borderRadius: '2px',
                minWidth: '32px',
                textAlign: 'center'
              }}>
                {pad(timeLeft.minutes)}
              </span>
              <span style={{ fontWeight: '900', color: '#fff' }}>:</span>
              <span style={{
                backgroundColor: '#e60012',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '1.05rem',
                padding: '4px 8px',
                borderRadius: '2px',
                minWidth: '32px',
                textAlign: 'center'
              }}>
                {pad(timeLeft.seconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {FLASH_SALE_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('product-detail', { id: item.id })}
              style={{
                border: '1px solid #e5e5e5',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#e60012';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e5e5';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Discount Badge */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: '#e60012',
                color: '#fff',
                fontWeight: '900',
                fontSize: '0.8rem',
                padding: '3px 8px',
                zIndex: 2,
                borderRadius: '2px'
              }}>
                -{item.discountPct}%
              </div>

              {/* Tag Pill */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(17, 17, 17, 0.85)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.7rem',
                padding: '2px 8px',
                zIndex: 2,
                borderRadius: '2px'
              }}>
                {item.tag}
              </div>

              {/* Image Container */}
              <div style={{ width: '100%', height: '260px', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Product Info */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: '0 0 10px 0', lineHeight: 1.4, color: '#111' }}>
                    {item.name}
                  </h3>

                  {/* Pricing */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#e60012' }}>
                      {formatPrice(item.salePrice)}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#999', textDecoration: 'line-through' }}>
                      {formatPrice(item.originalPrice)}
                    </span>
                  </div>
                </div>

                {/* Flame Sold Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '800', marginBottom: '4px', color: '#555' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e60012' }}>
                      <Flame size={12} /> Đã bán {item.soldCount} chiếc
                    </span>
                    <span>{item.soldPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#ffebee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${item.soldPct}%`,
                      height: '100%',
                      backgroundColor: '#e60012',
                      background: 'linear-gradient(90deg, #ff8a80, #e60012)'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
