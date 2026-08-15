import React, { useState } from 'react';
import { Lock, Mail, User, Phone, MapPin, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LoginPage = ({ onNavigate }) => {
  const { login, register, loginAsDemo } = useAuth();
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState('login');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Can Tho');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      if (res.redirectPath === '/admin/dashboard') {
        onNavigate('admin');
      } else if (res.redirectPath === '/staff/dashboard') {
        onNavigate('staff');
      } else {
        onNavigate('home');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      address: regAddress,
      city: regCity
    });
    setLoading(false);
    if (res.success) {
      onNavigate('home');
    }
  };

  const handleDemoLoginClick = async (demoType) => {
    setLoading(true);
    const res = await loginAsDemo(demoType);
    setLoading(false);
    if (res.success) {
      if (res.redirectPath === '/admin/dashboard') {
        onNavigate('admin');
      } else if (res.redirectPath === '/staff/dashboard') {
        onNavigate('staff');
      } else {
        onNavigate('home');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: '960px' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <div style={{ backgroundColor: '#e60012', color: '#fff', padding: '6px 8px', fontWeight: '900', fontSize: '1.2rem', lineHeight: 1 }}>BEO<br/>STORE</div>
          <div style={{ height: '42px', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '2px 8px', border: '1px solid #e0e0e0' }}>
            <img src="/beo-logo.png" alt="BEO Modern Fashion Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        <h1 className="heading-section" style={{ fontSize: '1.8rem', textTransform: 'uppercase' }}>
          {lang === 'vi' ? 'CỔNG ĐĂNG NHẬP HỆ THỐNG BEO' : 'BEO STORE UNIFIED LOGIN PORTAL'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
          {lang === 'vi'
            ? 'Một trang đăng nhập duy nhất cho tất cả Khách hàng, Nhân viên chi nhánh và Quản trị viên'
            : 'Single login gateway with role-based routing for Customers, Store Managers, and System Admins'}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left Column: Login / Register Box */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                padding: '12px',
                fontWeight: '800',
                fontSize: '0.95rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === 'login' ? '2px solid #e60012' : '2px solid transparent',
                color: activeTab === 'login' ? '#e60012' : '#666',
                textAlign: 'center'
              }}
            >
              {lang === 'vi' ? 'ĐĂNG NHẬP' : 'SIGN IN'}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                flex: 1,
                padding: '12px',
                fontWeight: '800',
                fontSize: '0.95rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === 'register' ? '2px solid #e60012' : '2px solid transparent',
                color: activeTab === 'register' ? '#e60012' : '#666',
                textAlign: 'center'
              }}
            >
              {lang === 'vi' ? 'ĐĂNG KÝ MỚI' : 'CREATE ACCOUNT'}
            </button>
          </div>

          {/* Form Login */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                  {lang === 'vi' ? 'ĐỊA CHỈ EMAIL *' : 'EMAIL ADDRESS *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #ccc', outline: 'none' }}
                  />
                  <Mail size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>{lang === 'vi' ? 'MẬT KHẨU *' : 'PASSWORD *'}</label>
                  <a href="#" style={{ fontSize: '0.75rem', color: '#e60012' }}>{lang === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #ccc', outline: 'none' }}
                  />
                  <Lock size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-uq btn-uq-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
              >
                <span>{loading ? (lang === 'vi' ? 'Đang xác thực...' : 'Authenticating...') : (lang === 'vi' ? 'Đăng Nhập' : 'Sign In')}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            /* Form Register */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                  {lang === 'vi' ? 'Họ và tên *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                  {lang === 'vi' ? 'Email *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                  {lang === 'vi' ? 'Mật khẩu * (Tối thiểu 6 ký tự)' : 'Password * (Min 6 characters)'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                  {lang === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                  {lang === 'vi' ? 'Địa chỉ nhận hàng' : 'Shipping Address'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Số nhà, tên đường, quận/huyện...' : 'Street address, apartment, district...'}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-uq btn-uq-red"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
              >
                <span>{loading ? (lang === 'vi' ? 'Đang tạo tài khoản...' : 'Creating Account...') : (lang === 'vi' ? 'Đăng Ký Thành Viên' : 'Register Account')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: 1-Click Quick Demo Login Accounts */}
        <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <KeyRound size={20} color="#e60012" />
            <span style={{ fontWeight: '800', fontSize: '1.05rem', textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Tài Khoản Thử Nghiệm 1-Click' : '1-Click Quick Demo Switcher'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
            {lang === 'vi'
              ? 'Bấm trực tiếp vào các nút bên dưới để đăng nhập ngay và trải nghiệm cơ chế tự động điều hướng theo quyền hạn (Single Login Routing):'
              : 'Click any role below to instantly log in and experience seamless role-based routing (Single Login Gateway):'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Admin */}
            <div
              onClick={() => handleDemoLoginClick('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #111',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>👑 {lang === 'vi' ? 'Admin Quản Trị Hệ Thống' : 'System Administrator'}</span>
                  <span className="badge-uq red">ADMIN</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                  admin@uniqlo.com • {lang === 'vi' ? 'Điều hướng:' : 'Redirect:'} <code>/admin/dashboard</code>
                </div>
              </div>
              <ArrowRight size={16} color="#e60012" />
            </div>

            {/* Staff Manager */}
            <div
              onClick={() => handleDemoLoginClick('staff_manager')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>🏬 {lang === 'vi' ? 'Quản Lý Cửa Hàng (Store Manager)' : 'Store Manager (POS & Inventory)'}</span>
                  <span className="badge-uq black">MANAGER</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                  manager.cantho@uniqlo.com • {lang === 'vi' ? 'Chi nhánh Cần Thơ (Vincom Xuân Khánh)' : 'Can Tho Flagship Store'}
                </div>
              </div>
              <ArrowRight size={16} />
            </div>

            {/* Customer */}
            <div
              onClick={() => handleDemoLoginClick('customer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>👤 {lang === 'vi' ? 'Khách Hàng (Customer)' : 'Customer (Shopper)'}</span>
                  <span className="badge-uq gray">CUSTOMER</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                  customer@gmail.com • {lang === 'vi' ? 'Mua sắm & Giỏ hàng' : 'Shopping Bag & Orders'}
                </div>
              </div>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
