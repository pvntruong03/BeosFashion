import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Flame, Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { HeroVideoBanner } from '../components/HeroVideoBanner';
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
      {/* 1. UNIQLO US HAUTE EDITORIAL HERO VIDEO / LOOKBOOK BANNER */}
      <HeroVideoBanner onNavigate={onNavigate} />

      {/* 2. CATEGORY TILES (MEN / WOMEN / KIDS / LIFEWEAR) */}
      <section style={{ padding: '36px 0', backgroundColor: '#faf9f5' }}>
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
                  height: '240px',
                  backgroundColor: '#f5f5f5',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid #eae5d8',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="img-editorial-zoom"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,15,15,0.85) 0%, rgba(15,15,15,0.2) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '18px',
                  color: '#fff'
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '1px', color: '#c5a880', textTransform: 'uppercase', marginBottom: '2px' }}>
                    0{idx + 1} • ATELIER
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{cat.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ddd', marginTop: '2px' }}>{cat.sub}</div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
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
      <section style={{ padding: '48px 0', borderTop: '1px solid #eae5d8', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <div className="luxury-badge" style={{ color: '#e60012', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} />
                <span>SS26 ATELIER COLLECTION</span>
              </div>
              <h2 className="heading-editorial" style={{ fontSize: '2.2rem', margin: 0 }}>
                {t('new_arrivals')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products', { isNew: true })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.88rem', color: '#111', letterSpacing: '0.5px' }}
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
      <section style={{ padding: '52px 0', backgroundColor: '#f9f7f2', borderTop: '1px solid #eae5d8' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <div className="luxury-badge" style={{ color: '#d97706', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} />
                <span>TIMELESS ESSENTIALS</span>
              </div>
              <h2 className="heading-editorial" style={{ fontSize: '2.2rem', margin: 0 }}>
                {t('best_sellers')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products', { bestSeller: true })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.88rem', color: '#111', letterSpacing: '0.5px' }}
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
      <section style={{ padding: '72px 0', backgroundColor: '#ffffff', borderTop: '1px solid #eae5d8' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}>
            <div>
              <div className="luxury-badge" style={{ color: '#e60012', marginBottom: '10px' }}>THE JAPANESE PHILOSOPHY</div>
              <h2 className="heading-editorial" style={{ fontSize: '2.5rem', lineHeight: 1.18, marginBottom: '20px' }}>
                {lang === 'vi' ? <>Trang phục giản đơn cho <span className="editorial-italic">cuộc sống tốt đẹp hơn.</span></> : <>Simple apparel, <span className="editorial-italic">elevated for life.</span></>}
              </h2>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.75, marginBottom: '28px' }}>
                {lang === 'vi'
                  ? 'LifeWear là những trang phục được sáng tạo từ các giá trị văn hóa Nhật Bản: đơn giản, chất lượng cao, bền bỉ cùng thời gian. Được thiết kế hiện đại, thanh lịch để trở thành những mảnh ghép hoàn hảo trong tủ đồ thường ngày của bạn.'
                  : 'LifeWear is clothing inspired by Japanese values of simplicity, quality, and longevity. Designed to be of the time and for the time, LifeWear is crafted with modern elegance to become the cornerstone of your daily wardrobe.'}
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate('lookbook')}
                  className="btn-uq btn-uq-primary"
                  style={{ padding: '12px 24px', letterSpacing: '0.5px' }}
                >
                  <span>{lang === 'vi' ? 'Xem Lookbook Phối Đồ' : 'Explore Lookbook'}</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => onNavigate('stores')}
                  className="btn-uq btn-uq-outline-gray"
                  style={{ padding: '12px 24px' }}
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
