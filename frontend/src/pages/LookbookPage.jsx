import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export const LookbookPage = ({ onNavigate }) => {
  const { formatPrice, lang } = useLanguage();
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLookbooks = async () => {
      try {
        const res = await api.get('/lookbooks');
        setLooks(res.data || []);
      } catch (err) {
        console.error('Error fetching lookbooks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLookbooks();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={48} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (looks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{lang === 'vi' ? 'Bộ sưu tập đang được cập nhật' : 'Lookbooks coming soon'}</h2>
      </div>
    );
  }

  return (
    <div className="container lookbook-page">
      <div className="lookbook-intro">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e60012', fontWeight: '800', fontSize: '0.85rem', marginBottom: '8px' }}>
          <Sparkles size={16} />
          <span>BEO STYLE GUIDE SS26</span>
        </div>
        <h1 className="heading-display lookbook-title">
          {lang === 'vi' ? 'BEO Essentials Lookbook' : 'BEO Essentials Styling Lookbook'}
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
          {lang === 'vi'
            ? 'Gợi ý phối trang phục thường ngày theo phong cách tối giản đặc trưng của BEO. Bấm vào từng sản phẩm trong bộ phối đồ để xem chi tiết và mua ngay.'
            : 'Curated everyday outfit formulas crafted around BEO simplicity and functionality. Click any featured item in the set to view details and buy instantly.'}
        </p>
      </div>

      {/* Lookbook items grid */}
      <div className="lookbook-list">
        {looks.map((look) => (
          <div
            key={look.id}
            className="lookbook-card"
          >
            {/* Look photo */}
            <div className="lookbook-image-wrap">
              <img
                src={look.mainImage}
                alt={look.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge-beo red" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                LOOK #{look.id}
              </span>
            </div>

            {/* Look Details & Buyable item tags */}
            <div className="lookbook-details">
              <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>
                {look.title}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
                {look.desc}
              </p>

              <div style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px', color: '#111' }}>
                {lang === 'vi' ? 'CÁC SẢN PHẨM TRONG BỘ PHỐI ĐỒ NÀY:' : 'FEATURED ITEMS IN THIS LOOK:'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {look.items.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => onNavigate('product-detail', { id: it.id, slug: it.slug })}
                    className="lookbook-product-row"
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
                  >
                    <div className="lookbook-product-copy">
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111' }}>{it.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>{lang === 'vi' ? 'Màu:' : 'Color:'} {it.color}</div>
                    </div>
                    <div className="lookbook-product-price">
                      <span style={{ fontWeight: '800', color: '#e60012', fontSize: '0.95rem' }}>
                        {formatPrice(it.price)}
                      </span>
                      <ArrowRight size={16} color="#111" />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('products')}
                className="btn-beo btn-beo-primary lookbook-cta"
              >
                <ShoppingBag size={18} />
                <span>{lang === 'vi' ? 'Xem Thêm Các Bộ Phối Đồ Khác' : 'Explore All Collection Items'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
