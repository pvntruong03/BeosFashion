import React, { useState } from 'react';
import { Mail, Check, MapPin, Phone, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      showSuccess('Cảm ơn bạn! Mã giảm giá 10% của bạn là: BEO10');
      setEmail('');
    }
  };

  return (
    <footer style={{ backgroundColor: '#f8f8f8', borderTop: '1px solid #e5e5e5', marginTop: '60px' }}>
      {/* Value props banner */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '36px 0', backgroundColor: '#ffffff' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Giao hàng Miễn phí</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Cho tất cả đơn hàng từ 500.000đ</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={24} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Đổi hàng trong 30 ngày</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Đổi size & mẫu tại mọi chi nhánh</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Chất lượng Chuẩn Nhật Bản</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Công nghệ sợi vải AIRism & HEATTECH</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={24} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Nhận tại Cửa hàng (Click & Collect)</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Lấy hàng nhanh trong vòng 2 giờ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Col 1: Brand & Philosophy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#e60012', color: '#fff', padding: '4px 6px', fontWeight: '900', fontSize: '1rem', lineHeight: 1 }}>BEO<br/>SHOP</div>
              <div style={{ backgroundColor: '#e60012', color: '#fff', padding: '4px 6px', fontWeight: '900', fontSize: '0.75rem', lineHeight: 1.1 }}>ベオ<br/>ファッション</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
              {t('lifewear_story_desc')}
            </p>
            <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: '600' }}>
              Hotline: 1900 1234 (09:00 - 18:00)
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase' }}>Danh mục Sản phẩm</div>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><button onClick={() => onNavigate('products', { gender: 'MEN' })} style={{ color: '#555' }}>Trang phục Nam</button></li>
              <li><button onClick={() => onNavigate('products', { gender: 'WOMEN' })} style={{ color: '#555' }}>Trang phục Nữ</button></li>
              <li><button onClick={() => onNavigate('products', { gender: 'KIDS' })} style={{ color: '#555' }}>Trang phục Trẻ em</button></li>
              <li><button onClick={() => onNavigate('products', { collection: 'AIRism' })} style={{ color: '#555' }}>Dòng sản phẩm AIRism</button></li>
              <li><button onClick={() => onNavigate('products', { collection: 'HEATTECH' })} style={{ color: '#555' }}>Dòng sản phẩm HEATTECH</button></li>
              <li><button onClick={() => onNavigate('lookbook')} style={{ color: '#555' }}>LifeWear Lookbook</button></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase' }}>Hỗ trợ Khách hàng</div>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><button onClick={() => onNavigate('stores')} style={{ color: '#555' }}>Tìm cửa hàng gần nhất</button></li>
              <li><button onClick={() => onNavigate('orders')} style={{ color: '#555' }}>Theo dõi đơn hàng</button></li>
              <li><a href="#" style={{ color: '#555' }}>Chính sách đổi trả & bảo hành</a></li>
              <li><a href="#" style={{ color: '#555' }}>Bảng kích cỡ (Size Guide)</a></li>
              <li><a href="#" style={{ color: '#555' }}>Chính sách quyền riêng tư</a></li>
            </ul>
          </div>

          {/* Col 4: Newsletter Box */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '12px', textTransform: 'uppercase' }}>Đăng ký nhận bản tin</div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
              Đăng ký ngay hôm nay để nhận <strong>Mã giảm giá 10% (BEO10)</strong> cho đơn hàng đầu tiên cùng thông tin BST mới nhất.
            </p>

            {subscribed ? (
              <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '2px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} />
                <span>Mã giảm giá: <strong>BEO10</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex' }}>
                  <input
                    type="email"
                    required
                    placeholder="Nhập địa chỉ email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #ccc',
                      borderRight: 'none',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-uq btn-uq-red"
                    style={{ padding: '10px 16px', fontSize: '0.85rem', borderRadius: 0 }}
                  >
                    <Mail size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid #e5e5e5',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.8rem',
          color: '#888'
        }}>
          <div>
            © 2026 BEO FASHION CO., LTD. / BEO VIETNAM. All rights reserved. Powered by Java Spring Boot & React.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Điều khoản sử dụng</span>
            <span>Chính sách bảo mật</span>
            <span>Cài đặt Cookie</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
