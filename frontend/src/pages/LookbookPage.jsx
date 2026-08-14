import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LookbookPage = ({ onNavigate }) => {
  const { formatPrice } = useLanguage();

  const looks = [
    {
      id: 1,
      title: 'City Casual LifeWear - Phong cách Công sở Tối giản',
      desc: 'Sự kết hợp hoàn hảo giữa Áo sơ mi Oxford chất liệu cotton cao cấp và Quần Smart Ankle Pants co giãn 2 chiều, tạo nên vẻ ngoài thanh lịch nhưng vô cùng thoải mái suốt ngày dài năng động.',
      mainImage: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1000&q=80',
      items: [
        {
          id: 1,
          slug: 'airism-cotton-oversized-crew-neck-t-shirt',
          name: 'AIRism Cotton Áo Thun Cổ Tròn Dáng Rộng',
          price: 399000,
          color: '00 WHITE'
        },
        {
          id: 3,
          slug: 'smart-ankle-pants-2-way-stretch',
          name: 'Smart Pants Quần Dài Co Giãn 2 Chiều',
          price: 699000,
          color: '69 NAVY'
        }
      ]
    },
    {
      id: 2,
      title: 'Modern Minimalist Chic - Nữ tính & Hiện đại',
      desc: 'Phối đồ chuẩn phong cách Tokyo với Áo thun Supima Cotton và Quần xếp ly Pleated Wide Pants thời thượng, tôn dáng và mang lại nét thanh lịch tự nhiên.',
      mainImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
      items: [
        {
          id: 6,
          slug: 'women-supima-cotton-crew-neck-t-shirt',
          name: 'Áo Thun Nữ Cotton Supima Cổ Tròn Ngắn Tay',
          price: 299000,
          color: '01 OFF WHITE'
        },
        {
          id: 7,
          slug: 'women-pleated-wide-pants',
          name: 'Quần Xếp Ly Dáng Rộng Pleated Wide Pants Nữ',
          price: 799000,
          color: '32 BEIGE'
        }
      ]
    },
    {
      id: 3,
      title: 'Summer Active Lifestyle - Năng động Mùa hè',
      desc: 'Được thiết kế cho những ngày hè rực rỡ với Áo khoác chống nắng UV Protection AIRism và Áo thun Graphic UT cá tính.',
      mainImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
      items: [
        {
          id: 5,
          slug: 'ut-graphic-t-shirt-jujutsu-kaisen',
          name: 'UT Áo Thun Graphic Anime Series',
          price: 499000,
          color: '09 BLACK'
        },
        {
          id: 8,
          slug: 'women-airism-uv-protection-mesh-hoodie',
          name: 'Áo Khoác Vải Mắt Lưới AIRism Chống Tia UV',
          price: 599000,
          color: '01 OFF WHITE'
        }
      ]
    }
  ];

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e60012', fontWeight: '800', fontSize: '0.85rem', marginBottom: '8px' }}>
          <Sparkles size={16} />
          <span>BEO STYLE GUIDE SS26</span>
        </div>
        <h1 className="heading-display" style={{ fontSize: '2.4rem', textTransform: 'uppercase', marginBottom: '12px' }}>
          LifeWear Lookbook
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.6 }}>
          Gợi ý phối trang phục thường ngày theo phong cách tối giản Nhật Bản. Bấm vào từng sản phẩm trong bộ phối đồ để xem chi tiết và mua ngay.
        </p>
      </div>

      {/* Lookbook items grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
        {looks.map((look) => (
          <div
            key={look.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '40px',
              alignItems: 'center',
              backgroundColor: '#fafafa',
              border: '1px solid #e5e5e5',
              padding: '24px'
            }}
          >
            {/* Look photo */}
            <div style={{ position: 'relative', height: '440px', overflow: 'hidden' }}>
              <img
                src={look.mainImage}
                alt={look.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge-uq red" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                LOOK #{look.id}
              </span>
            </div>

            {/* Look Details & Buyable item tags */}
            <div>
              <h2 className="heading-section" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>
                {look.title}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
                {look.desc}
              </p>

              <div style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px', color: '#111' }}>
                CÁC SẢN PHẨM TRONG BỘ PHỐI ĐỒ NÀY:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {look.items.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => onNavigate('product-detail', { id: it.id, slug: it.slug })}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'border 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111' }}>{it.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>Màu: {it.color}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                className="btn-uq btn-uq-primary"
              >
                <ShoppingBag size={18} />
                <span>Xem Thêm Các Bộ Phối Đồ Khác</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
