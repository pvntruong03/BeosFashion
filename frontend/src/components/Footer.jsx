import React, { useState } from 'react';
import { Mail, Check, MapPin, Phone, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

export const Footer = ({ onNavigate }) => {
  const { t, lang } = useLanguage();
  const { showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      showSuccess(lang === 'vi' ? 'Cảm ơn bạn! Mã giảm giá 10% của bạn là: BEO10' : 'Thank you! Your 10% discount promo code is: BEO10');
      setEmail('');
    }
  };

  return (
    <footer style={{ backgroundColor: '#f8f8f8', borderTop: '1px solid #e5e5e5', marginTop: '40px' }}>
      {/* Value props banner */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '24px 0', backgroundColor: '#ffffff' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Truck size={20} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{lang === 'vi' ? 'Giao hàng Miễn phí' : 'Free Standard Shipping'}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{lang === 'vi' ? 'Cho đơn từ 500.000đ' : 'On orders over 500k'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RefreshCw size={20} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{lang === 'vi' ? 'Đổi hàng 30 ngày' : '30-Day Returns'}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{lang === 'vi' ? 'Đổi size & màu tại showroom' : 'Free size & color exchange'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{lang === 'vi' ? 'Chuẩn Nhật Bản' : 'Japanese Quality'}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{lang === 'vi' ? 'Công nghệ AIRism & HEATTECH' : 'AIRism & HEATTECH'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={20} color="#e60012" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{lang === 'vi' ? 'Click & Collect' : 'Click & Collect'}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{lang === 'vi' ? 'Nhận hàng sau 2 giờ' : 'Ready within 2 hours'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="container" style={{ padding: '36px 12px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '28px',
          marginBottom: '32px'
        }}>
          {/* Col 1: Brand & Philosophy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#e60012', color: '#fff', padding: '4px 6px', fontWeight: '900', fontSize: '1rem', lineHeight: 1 }}>BEO<br/>STORE</div>
              <div style={{ height: '36px', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '2px 6px', border: '1px solid #e0e0e0' }}>
                <img src="/beo-logo.png" alt="BEO Modern Fashion Logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
              {t('lifewear_story_desc')}
            </p>
            <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: '600' }}>
              Hotline: 1900019199999 (08:00 - 22:00)
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Danh mục Sản phẩm' : 'Product Categories'}
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><button onClick={() => onNavigate('products', { gender: 'MEN' })} style={{ color: '#555' }}>{lang === 'vi' ? 'Trang phục Nam' : 'Men Fashion'}</button></li>
              <li><button onClick={() => onNavigate('products', { gender: 'WOMEN' })} style={{ color: '#555' }}>{lang === 'vi' ? 'Trang phục Nữ' : 'Women Fashion'}</button></li>
              <li><button onClick={() => onNavigate('products', { collection: 'LifeWear' })} style={{ color: '#555' }}>{lang === 'vi' ? 'Bộ sưu tập LifeWear' : 'LifeWear Collection'}</button></li>
              <li><button onClick={() => onNavigate('products', { collection: 'AIRism' })} style={{ color: '#555' }}>{lang === 'vi' ? 'Dòng sản phẩm AIRism' : 'AIRism Series'}</button></li>
              <li><button onClick={() => onNavigate('products', { collection: 'HEATTECH' })} style={{ color: '#555' }}>{lang === 'vi' ? 'Dòng sản phẩm HEATTECH' : 'HEATTECH Series'}</button></li>
              <li><button onClick={() => onNavigate('lookbook')} style={{ color: '#555' }}>{lang === 'vi' ? 'LifeWear Lookbook' : 'Lookbook Styling'}</button></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Hỗ trợ Khách hàng' : 'Customer Service'}
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><button onClick={() => onNavigate('stores')} style={{ color: '#555' }}>{lang === 'vi' ? 'Showroom BEO (Cần Thơ)' : 'Flagship Store (Can Tho)'}</button></li>
              <li><button onClick={() => onNavigate('orders')} style={{ color: '#555' }}>{lang === 'vi' ? 'Theo dõi đơn hàng' : 'Track Your Order'}</button></li>
              <li><a href="#" style={{ color: '#555' }}>{lang === 'vi' ? 'Chính sách đổi trả & bảo hành' : 'Returns & Warranty Policy'}</a></li>
              <li><a href="#" style={{ color: '#555' }}>{lang === 'vi' ? 'Bảng kích cỡ (Size Guide)' : 'Size Guide & Conversion'}</a></li>
              <li><a href="#" style={{ color: '#555' }}>{lang === 'vi' ? 'Chính sách quyền riêng tư' : 'Privacy & Security Policy'}</a></li>
            </ul>
          </div>

          {/* Col 4: Newsletter Box */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '12px', textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Đăng ký nhận bản tin' : 'Join Our Newsletter'}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
              {lang === 'vi'
                ? 'Đăng ký ngay hôm nay để nhận Mã giảm giá 10% (BEO10) cho đơn hàng đầu tiên cùng thông tin BST mới nhất.'
                : 'Subscribe today and receive a 10% promo code (BEO10) on your first purchase plus latest collection drops.'}
            </p>

            {subscribed ? (
              <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '2px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} />
                <span>{lang === 'vi' ? 'Mã giảm giá:' : 'Promo code:'} <strong>BEO10</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex' }}>
                  <input
                    type="email"
                    required
                    placeholder={lang === 'vi' ? 'Nhập địa chỉ email của bạn' : 'Enter your email address'}
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
            © 2026 BEO FASHION CO., LTD. / BEO STORE VIETNAM. All rights reserved. Powered by Java Spring Boot & React.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>{lang === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Use'}</span>
            <span>{lang === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy'}</span>
            <span>{lang === 'vi' ? 'Cài đặt Cookie' : 'Cookie Settings'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
