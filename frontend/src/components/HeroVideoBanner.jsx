import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const HeroVideoBanner = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'barrel-pants',
      badge: lang === 'vi' ? 'XU HƯỚNG MỚI' : 'TRENDING NOW',
      title: lang === 'vi' ? 'Quần Dáng Rộng Barrel & Smart Pants' : 'Barrel & Pleated Wide Pants',
      subtitle: lang === 'vi'
        ? 'Dòng quần bán chạy nhất với phom dáng suông rộng phóng khoáng, thu nhẹ tinh tế ở phần gấu.'
        : 'Best-selling bottoms with a relaxed fit that slightly tapers at the ankle.',
      image: '/images/hero-fashion-ai.jpg',
      ctaPrimary: { text: t('shop_women'), gender: 'WOMEN' },
      ctaSecondary: { text: t('shop_men'), gender: 'MEN' },
    },
    {
      id: 'beo-airflow-linen',
      badge: lang === 'vi' ? 'BỘ SƯU TẬP SS26' : 'SS26 BEO ESSENTIALS ATELIER',
      title: lang === 'vi' ? 'Sơ Mi Đũi Cao Cấp & BEO AirFlow' : 'Premium Linen & BEO AirFlow Essentials',
      subtitle: lang === 'vi'
        ? 'Chất liệu lanh tự nhiên kết hợp công nghệ sợi làm mát BEO AirFlow. Thoáng nhẹ cho ngày hè.'
        : 'Natural European flax blended with BEO AirFlow cooling technology for effortless daily comfort.',
      image: '/images/hero-beo-airflow-ai.jpg',
      ctaPrimary: { text: lang === 'vi' ? 'Khám Phá BST' : 'Explore Collection', collection: 'BEO AirFlow' },
      ctaSecondary: { text: lang === 'vi' ? 'Xem Đồ Nam' : 'Shop Men', gender: 'MEN' },
    },
    {
      id: 'outerwear-cashmere',
      badge: lang === 'vi' ? 'THỜI TRANG THU ĐÔNG' : 'AUTUMN ATELIER',
      title: lang === 'vi' ? 'Áo Măng Tô Dạ & Len Cashmere' : 'Minimalist Trench Coat & Cashmere',
      subtitle: lang === 'vi'
        ? 'Phom dáng tối giản kinh điển may từ sợi len cao cấp siêu mềm, mang lại cảm giác ấm áp tinh tế.'
        : 'Timeless silhouettes tailored from ultra-soft natural fibers for sophisticated comfort.',
      image: '/images/hero-outerwear-ai.jpg',
      ctaPrimary: { text: lang === 'vi' ? 'Xem Áo Khoác Nữ' : 'Shop Outerwear', gender: 'WOMEN' },
      ctaSecondary: { text: lang === 'vi' ? 'BST Mùa Lạnh' : 'Explore Cashmere', collection: 'BEO Essentials' },
    },
    {
      id: 'smart-menswear',
      badge: lang === 'vi' ? 'CÔNG SỞ HIỆN ĐẠI' : 'MODERN TAILORING',
      title: lang === 'vi' ? 'Áo Blazer Thoáng Nhẹ & Áo Phông BEO AirFlow' : 'Smart Comfort Blazer & BEO AirFlow Tee',
      subtitle: lang === 'vi'
        ? 'Kỹ thuật may đo hiện đại của BEO, co giãn nhẹ và thoáng khí suốt cả ngày làm việc.'
        : 'Contemporary BEO tailoring engineered for lightweight all-day breathability.',
      image: '/images/hero-menswear-ai.jpg',
      ctaPrimary: { text: t('shop_men'), gender: 'MEN' },
      ctaSecondary: { text: lang === 'vi' ? 'Xem Lookbook' : 'View Lookbook', action: 'lookbook' },
    }
  ];

  // Auto-advance slides every 5.5 seconds seamlessly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(480px, 70vh, 700px)',
        backgroundColor: '#111',
        overflow: 'hidden',
        color: '#fff',
        userSelect: 'none'
      }}
    >
      {/* Background Image Stage with Smooth Crossfade and Subtle Zoom */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: idx === currentSlide ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: idx === currentSlide ? 1 : 0,
            overflow: 'hidden'
          }}
        >
          <img
            src={s.image}
            alt={s.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 25%',
              transform: idx === currentSlide ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 6s ease-out'
            }}
          />
          {/* Subtle cinematic gradient overlays for pristine readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.08) 100%)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
              pointerEvents: 'none'
            }}
          />
        </div>
      ))}

      {/* BEO US Style Overlay Content: Bottom-Left Card */}
      <div
        className="container"
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(32px, 6vh, 52px)',
          zIndex: 10
        }}
      >
        <div
          key={slide.id}
          style={{
            maxWidth: '700px',
            animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Pill Badge (matching BEO US "TRENDING NOW" badge) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#e60012',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '14px',
              boxShadow: '0 2px 10px rgba(230,0,18,0.4)'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'inline-block'
              }}
            />
            <span>{slide.badge}</span>
          </div>

          {/* Headline */}
          <h1
            className="heading-editorial"
            style={{
              color: '#ffffff',
              fontSize: 'clamp(2.1rem, 4.5vw, 3.5rem)',
              lineHeight: 1.15,
              fontWeight: '800',
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              textShadow: '0 2px 16px rgba(0,0,0,0.5)'
            }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)',
              color: '#f0ece3',
              lineHeight: 1.55,
              marginBottom: '22px',
              maxWidth: '580px',
              textShadow: '0 1px 8px rgba(0,0,0,0.6)'
            }}
          >
            {slide.subtitle}
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (slide.ctaPrimary.action) onNavigate(slide.ctaPrimary.action);
                else onNavigate('products', { gender: slide.ctaPrimary.gender, collection: slide.ctaPrimary.collection });
              }}
              className="btn-beo btn-beo-red"
              style={{
                padding: '12px 26px',
                fontSize: '0.9rem',
                fontWeight: '700',
                borderRadius: '2px',
                boxShadow: '0 4px 16px rgba(230,0,18,0.3)'
              }}
            >
              <span>{slide.ctaPrimary.text}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                if (slide.ctaSecondary.action) onNavigate(slide.ctaSecondary.action);
                else onNavigate('products', { gender: slide.ctaSecondary.gender, collection: slide.ctaSecondary.collection });
              }}
              style={{
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: '700',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.borderColor = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
              }}
            >
              <span>{slide.ctaSecondary.text}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom-Right Discrete Slide Progress Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 20
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            style={{
              width: i === currentSlide ? '28px' : '8px',
              height: '6px',
              borderRadius: '3px',
              backgroundColor: i === currentSlide ? '#e60012' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            title={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
