import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Flame, Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export const HomePage = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFeatured, resNew, resBest] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/new-arrivals'),
          api.get('/products/best-sellers'),
        ]);

        if (resFeatured.data) setFeaturedProducts(resFeatured.data);
        if (resNew.data) setNewArrivals(resNew.data);
        if (resBest.data) setBestSellers(resBest.data);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* 1. HERO BANNER */}
      <section style={{ position: 'relative', backgroundColor: '#000', color: '#fff', overflow: 'hidden' }}>
        <div style={{
          position: 'relative',
          minHeight: '520px',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%), url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%'
        }}>
          <div className="container" style={{ padding: '60px 24px', maxWidth: '1400px' }}>
            <div style={{ maxWidth: '620px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#e60012',
                color: '#fff',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: '800',
                letterSpacing: '1px',
                marginBottom: '16px'
              }}>
                <Sparkles size={14} />
                <span>BỘ SƯU TẬP MỚI SS26</span>
              </div>

              <h1 className="heading-display" style={{ color: '#ffffff', marginBottom: '16px' }}>
                AIRism & LifeWear
              </h1>

              <p style={{ fontSize: '1.1rem', color: '#e0e0e0', lineHeight: 1.6, marginBottom: '28px' }}>
                Trải nghiệm sự thoáng mát tức thì với sợi vải thông minh công nghệ cao. Thiết kế tối giản, tinh tế cho phong cách hàng ngày.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate('products', { gender: 'MEN' })}
                  className="btn-uq btn-uq-red"
                  style={{ padding: '14px 28px' }}
                >
                  <span>{t('shop_men')}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => onNavigate('products', { gender: 'WOMEN' })}
                  className="btn-uq btn-uq-secondary"
                  style={{ padding: '14px 28px' }}
                >
                  <span>{t('shop_women')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES (MEN / WOMEN / KIDS / LIFEWEAR) */}
      <section style={{ padding: '48px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {[
              {
                title: 'NAM (MEN)',
                sub: 'Áo thun AIRism, Sơ mi Oxford, Quần Smart Pants',
                img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
                gender: 'MEN'
              },
              {
                title: 'NỮ (WOMEN)',
                sub: 'Cotton Supima, Quần Pleated Pants, Đầm Rayon',
                img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
                gender: 'WOMEN'
              },
              {
                title: 'BEO LIFEWEAR ESSENTIALS',
                sub: 'Chất liệu AIRism, Dry-EX, Vải dệt 3D cao cấp',
                img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
                collection: 'AIRism'
              },
              {
                title: 'UT GRAPHIC COLLECTION',
                sub: 'Áo thun Anime, Nghệ thuật & Văn hóa đại chúng',
                img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
                collection: 'UT Graphic'
              },
            ].map((cat, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('products', { gender: cat.gender, collection: cat.collection })}
                style={{
                  position: 'relative',
                  height: '320px',
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
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '24px',
                  color: '#fff'
                }}>
                  <div style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '0.5px' }}>{cat.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#ddd', marginTop: '4px' }}>{cat.sub}</div>
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                    <span>Khám phá ngay</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS (HÀNG MỚI VỀ) */}
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
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {newArrivals.slice(0, 4).map((product) => (
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
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {bestSellers.slice(0, 4).map((product) => (
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
                Trang phục giản đơn cho cuộc sống tốt đẹp hơn.
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7, marginBottom: '24px' }}>
                LifeWear là những trang phục được sáng tạo từ các giá trị văn hóa Nhật Bản: đơn giản, chất lượng cao, bền bỉ cùng thời gian. Được thiết kế hiện đại, thanh lịch để trở thành những mảnh ghép hoàn hảo trong tủ đồ thường ngày của bạn.
              </p>
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  onClick={() => onNavigate('lookbook')}
                  className="btn-uq btn-uq-primary"
                >
                  <span>Xem Lookbook Phối Đồ</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => onNavigate('stores')}
                  className="btn-uq btn-uq-outline-gray"
                >
                  <span>Tìm Cửa Hàng Gần Nhất</span>
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
