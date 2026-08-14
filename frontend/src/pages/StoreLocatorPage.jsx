import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Truck,
  Scissors
} from 'lucide-react';
import api from '../services/api';

export const StoreLocatorPage = ({ onNavigate }) => {
  const [store, setStore] = useState({
    name: 'BEO Modern Fashion Showroom',
    address: '209 Đường 30 Tháng 4, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ',
    city: 'Cần Thơ',
    phone: '1900019199999',
    openingHours: '08:00 - 22:00',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get('/stores');
        if (res.data && res.data.length > 0) {
          setStore(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching store info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1200px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff0f0', color: '#e60012', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase' }}>
          <Sparkles size={14} /> Trải Nghiệm Thời Trang Trực Tiếp
        </div>
        <h1 className="heading-section" style={{ fontSize: '2.2rem', textTransform: 'uppercase', color: '#111', marginBottom: '10px' }}>
          Showroom BEO Modern Fashion
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#666', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Không gian mua sắm thời trang tối giản & cao cấp. Đầy đủ các bộ sưu tập mới nhất cùng dịch vụ chăm sóc khách hàng độc quyền.
        </p>
      </div>

      {/* Main Grid: Visual Hero & Store Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Store Experience Image & Special Features */}
        <div>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', border: '1px solid #eee', marginBottom: '24px' }}>
            <img
              src={store.imageUrl || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80'}
              alt={store.name}
              style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 16px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '2px' }}>
              Showroom BEO Modern Fashion • Cần Thơ
            </div>
          </div>

          {/* Premium Services Box */}
          <div style={{ backgroundColor: '#fcfcfc', border: '1px solid #e5e5e5', padding: '24px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#111', textTransform: 'uppercase', marginBottom: '16px' }}>
              Dịch Vụ Độc Quyền Tại Showroom
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: '#444' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#e6f4ea', color: '#00875a', borderRadius: '4px', marginTop: '2px' }}>
                  <Truck size={16} />
                </div>
                <div>
                  <strong style={{ color: '#111' }}>Click & Collect (Nhận hàng tại quầy):</strong> Đặt online trước trên website và nhận đồ tại showroom chỉ sau 2 giờ.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#e6f4ea', color: '#00875a', borderRadius: '4px', marginTop: '2px' }}>
                  <Scissors size={16} />
                </div>
                <div>
                  <strong style={{ color: '#111' }}>Cắt chỉnh gấu quần miễn phí:</strong> Chỉnh sửa độ dài quần chuẩn form theo số đo của bạn trong 30 phút.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '6px', backgroundColor: '#e6f4ea', color: '#00875a', borderRadius: '4px', marginTop: '2px' }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <strong style={{ color: '#111' }}>Đổi trả miễn phí 30 ngày:</strong> Hỗ trợ đổi size/màu trực tiếp tại showroom nhanh chóng.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Address, Hours, Contact & Direct Navigation */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', padding: '32px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00875a', fontWeight: '800', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00875a', display: 'inline-block' }}></span>
            ĐANG MỞ CỬA PHỤC VỤ (08:00 - 22:00)
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#111', marginBottom: '20px' }}>
            {store.name}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={20} color="#e60012" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>Địa Chỉ Showroom</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111', marginTop: '2px' }}>
                  {store.address}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Clock size={20} color="#111" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>Thời Gian Mở Cửa</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111', marginTop: '2px' }}>
                  {store.openingHours} • Mở cửa tất cả các ngày trong tuần
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Phone size={20} color="#111" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>Tổng Đài Hotline</div>
                <a href="tel:1900019199999" style={{ fontSize: '1.1rem', fontWeight: '900', color: '#e60012', marginTop: '2px', display: 'inline-block', textDecoration: 'none' }}>
                  1900019199999
                </a>
              </div>
            </div>
          </div>

          {/* Social Channels Quick Connect */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '24px', marginBottom: '32px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', marginBottom: '14px' }}>
              Kênh Liên Hệ & Hỗ Trợ Nhanh
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <a
                href="https://zalo.me/0567740000"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#0068ff',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                <MessageCircle size={16} /> Zalo 0567740000
              </a>

              <a
                href="https://www.facebook.com/beofashionstorecantho/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#1877f2',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Fanpage Facebook
              </a>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => onNavigate('products')}
              className="btn-uq btn-uq-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
            >
              <span>Khám Phá Toàn Bộ Bộ Sưu Tập Thời Trang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
