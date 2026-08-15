import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Flame, Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export const HomePage = ({ onNavigate }) => {
  const { t, lang } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFeatured, resNew, resBest] = await Promise.all([
          api.get('/products/featured').catch(() => null),
          api.get('/products/new-arrivals').catch(() => null),
          api.get('/products/best-sellers').catch(() => null),
        ]);

        const extractList = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.content)) return res.content;
          return [];
        };

        const featured = extractList(resFeatured);
        const newest = extractList(resNew);
        const best = extractList(resBest);

        if (featured.length > 0) setFeaturedProducts(featured);
        if (newest.length > 0) setNewArrivals(newest);
        if (best.length > 0) setBestSellers(best);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayNewArrivals = (newArrivals && newArrivals.length > 0)
    ? newArrivals.slice(0, 4)
    : (featuredProducts && featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : []);

  const displayBestSellers = (bestSellers && bestSellers.length > 0)
    ? bestSellers.slice(0, 4)
    : (featuredProducts && featuredProducts.length > 4 ? featuredProducts.slice(4, 8) : (featuredProducts || []).slice(0, 4));

  return (
    <div>
      {/* 1. HERO BANNER */}
      <section style={{ position: 'relative', backgroundColor: '#000', color: '#fff', overflow: 'hidden' }}>
        <div style={{
          position: 'relative',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 100%), url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%'
        }}>
          <div className="container" style={{ padding: '36px 16px', maxWidth: '1400px' }}>
            <div style={{ maxWidth: '620px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#e60012',
                color: '#fff',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                <Sparkles size={13} />
                <span>{lang === 'vi' ? 'BỘ SƯU TẬP MỚI SS26' : 'SS26 NEW ARRIVALS'}</span>
              </div>

              <h1 className="heading-display" style={{ color: '#ffffff', marginBottom: '12px' }}>
                AIRism & LifeWear
              </h1>

              <p className="desktop-only" style={{ fontSize: '1rem', color: '#e0e0e0', lineHeight: 1.5, marginBottom: '24px' }}>
                {lang === 'vi'
                  ? 'Trải nghiệm sự thoáng mát tức thì với sợi vải thông minh công nghệ cao. Thiết kế tối giản, tinh tế cho phong cách hàng ngày.'
                  : 'Experience instant cooling comfort with high-tech smart fabrics. Minimalist, refined silhouettes designed for everyday life.'}
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                <button
                  onClick={() => onNavigate('products', { gender: 'MEN' })}
                  className="btn-uq btn-uq-red"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <span>{t('shop_men')}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => onNavigate('products', { gender: 'WOMEN' })}
                  className="btn-uq btn-uq-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <span>{t('shop_women')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES (MEN / WOMEN / KIDS / LIFEWEAR) */}
      <section style={{ padding: '28px 0' }}>
        <div className="container">
          <div className="responsive-product-grid">
            {[
              {
                title: lang === 'vi' ? 'NAM (MEN)' : 'MEN ESSENTIALS',
                sub: lang === 'vi' ? 'AIRism, Sơ mi, Smart Pants' : 'AIRism, Oxford, Smart Pants',
                img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
                gender: 'MEN'
              },
              {
                title: lang === 'vi' ? 'NỮ (WOMEN)' : 'WOMEN ESSENTIALS',
                sub: lang === 'vi' ? 'Supima, Pleated Pants, Đầm' : 'Supima, Pleated Pants, Dresses',
                img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
                gender: 'WOMEN'
              },
              {
                title: lang === 'vi' ? 'BEO LIFEWEAR' : 'LIFEWEAR LAB',
                sub: lang === 'vi' ? 'AIRism, Dry-EX, Vải dệt 3D' : 'AIRism, Dry-EX, 3D Knit',
                img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
                collection: 'AIRism'
              },
              {
                title: lang === 'vi' ? 'UT GRAPHIC' : 'UT GRAPHIC',
                sub: lang === 'vi' ? 'Anime, Nghệ thuật' : 'Anime & Pop Culture',
                img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
                collection: 'UT Graphic'
              },
            ].map((cat, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('products', { gender: cat.gender, collection: cat.collection })}
                style={{
                  position: 'relative',
                  height: '220px',
                  backgroundColor: '#f5f5f5',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '14px',
                  color: '#fff'
                }}>
                  <div style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '0.5px' }}>{cat.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#ddd', marginTop: '2px' }}>{cat.sub}</div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                    <span>{lang === 'vi' ? 'Khám phá' : 'Explore'}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section style={{ padding: '36px 0', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e60012', fontWeight: '800', fontSize: '0.85rem' }}>
                <Sparkles size={16} />
                <span>NEW IN THIS WEEK</span>
              </div>
              <h2 className="heading-section" style={{ marginTop: '4px' }}>
                {t('new_arrivals')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products', { isNew: true })}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '0.9rem', color: '#111' }}
            >
              <span>{lang === 'vi' ? 'Xem tất cả' : 'View All'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="responsive-product-grid">
            {displayNewArrivals.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIMITED OFFERS BANNER & BEST SELLERS */}
      <section style={{ padding: '48px 0', backgroundColor: '#fcfcfc', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e60012', fontWeight: '800', fontSize: '0.85rem' }}>
                <Flame size={16} />
                <span>TOP RATED & POPULAR</span>
              </div>
              <h2 className="heading-section" style={{ marginTop: '4px' }}>
                {t('best_sellers')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products', { bestSeller: true })}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '0.9rem', color: '#111' }}
            >
              <span>{lang === 'vi' ? 'Xem tất cả' : 'View All'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="responsive-product-grid">
            {displayBestSellers.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIFEWEAR PHILOSOPHY & LOOKBOOK TEASER */}
      <section style={{ padding: '60px 0', backgroundColor: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div>
              <span className="badge-uq red" style={{ marginBottom: '12px' }}>BEO LIFEWEAR</span>
              <h2 className="heading-display" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                {lang === 'vi' ? 'Trang phục giản đơn cho cuộc sống tốt đẹp hơn.' : 'Simple apparel made better for everyone.'}
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7, marginBottom: '24px' }}>
                {lang === 'vi'
                  ? 'LifeWear là những trang phục được sáng tạo từ các giá trị văn hóa Nhật Bản: đơn giản, chất lượng cao, bền bỉ cùng thời gian. Được thiết kế hiện đại, thanh lịch để trở thành những mảnh ghép hoàn hảo trong tủ đồ thường ngày của bạn.'
                  : 'LifeWear is clothing inspired by Japanese values of simplicity, quality, and longevity. Designed to be of the time and for the time, LifeWear is made with modern elegance to become the foundation of your daily wardrobe.'}
              </p>
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  onClick={() => onNavigate('lookbook')}
                  className="btn-uq btn-uq-primary"
                >
                  <span>{lang === 'vi' ? 'Xem Lookbook Phối Đồ' : 'Explore Lookbook'}</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => onNavigate('stores')}
                  className="btn-uq btn-uq-outline-gray"
                >
                  <span>{lang === 'vi' ? 'Tìm Cửa Hàng Gần Nhất' : 'Find Store Location'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
                alt="LifeWear Woman"
                style={{ width: '100%', height: '280px', objectFit: 'cover' }}
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                alt="LifeWear Man"
                style={{ width: '100%', height: '280px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
