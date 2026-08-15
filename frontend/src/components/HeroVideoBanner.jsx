import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const HeroVideoBanner = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

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
      id: 'airism-linen',
      badge: lang === 'vi' ? 'BỘ SƯU TẬP SS26' : 'SS26 LIFEWEAR ATELIER',
      title: lang === 'vi' ? 'Sơ Mi Đũi Cao Cấp & AIRism' : 'Premium Linen & AIRism Essentials',
      subtitle: lang === 'vi'
        ? 'Chất liệu lanh tự nhiên kết hợp sợi làm mát thông minh Nhật Bản. Thoáng nhẹ cho ngày hè.'
        : 'Natural European flax blended with Japanese cooling technology for effortless daily comfort.',
      image: '/images/hero-airism-ai.jpg',
      ctaPrimary: { text: lang === 'vi' ? 'Khám Phá BST' : 'Explore Collection', collection: 'AIRism' },
      ctaSecondary: { text: lang === 'vi' ? 'Xem Đồ Nam' : 'Shop Men', gender: 'MEN' },
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const slide = slides[currentSlide];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(460px, 68vh, 680px)',
        backgroundColor: '#111',
        overflow: 'hidden',
        color: '#fff',
        userSelect: 'none'
      }}
    >
      {/* Background Image / Video Stage with Ken Burns Zoom Effect */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: idx === currentSlide ? 1 : 0,
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
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
              objectPosition: 'center 20%',
              transform: isPlaying && idx === currentSlide ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 8s ease-out'
            }}
          />
          {/* Subtle cinematic gradient overlays for pristine readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.1) 100%)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
              pointerEvents: 'none'
            }}
          />
        </div>
      ))}

      {/* Uniqlo US Style Overlay Content: Bottom-Left Card */}
      <div
        className="container"
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(28px, 6vh, 48px)',
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Pill Badge (matching Uniqlo US "TRENDING NOW" badge) */}
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
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
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
              maxWidth: '560px',
              textShadow: '0 1px 8px rgba(0,0,0,0.6)'
            }}
          >
            {slide.subtitle}
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => onNavigate('products', { gender: slide.ctaPrimary.gender, collection: slide.ctaPrimary.collection })}
              className="btn-uq btn-uq-red"
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
              onClick={() => onNavigate('products', { gender: slide.ctaSecondary.gender, collection: slide.ctaSecondary.collection })}
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

      {/* Bottom-Right Media Controls (Play / Pause Indicator matching Uniqlo US) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 20
        }}
      >
        {/* Slide Pagination Dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i === currentSlide ? '#e60012' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause Control Circle (matching || icon from screenshot) */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause banner animation' : 'Play banner animation'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(230, 0, 18, 0.85)';
            e.currentTarget.style.borderColor = '#e60012';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.55)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          }}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '2px' }} />}
        </button>
      </div>
    </section>
  );
};
