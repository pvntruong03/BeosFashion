import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Save,
  ShieldCheck,
  Award,
  Sparkles,
  ShoppingBag,
  Heart,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
];

export const ProfilePage = ({ onNavigate }) => {
  const { user, updateUserData } = useAuth();
  const { t, lang } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('general');

  // General profile form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Can Tho');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || 'Can Tho');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>
          {lang === 'vi' ? 'Vui lòng đăng nhập' : 'Please Sign In'}
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          {lang === 'vi' ? 'Bạn cần đăng nhập để quản lý thông tin tài khoản và xem quyền lợi hội viên.' : 'Please sign in to manage account profile and membership privileges.'}
        </p>
        <button onClick={() => onNavigate('login')} className="btn-uq btn-uq-primary">
          {lang === 'vi' ? 'Đăng nhập ngay' : 'Sign In Now'}
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showError(lang === 'vi' ? 'Vui lòng nhập họ và tên của bạn' : 'Please enter your full name');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        avatar: avatar.trim()
      });

      if (updateUserData) {
        updateUserData(res.data);
      }
      showSuccess(lang === 'vi' ? 'Đã cập nhật thông tin hồ sơ thành công!' : 'Profile information updated successfully!');
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi cập nhật thông tin' : 'Failed to update profile'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      showError(lang === 'vi' ? 'Vui lòng nhập mật khẩu hiện tại' : 'Please enter current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showError(lang === 'vi' ? 'Mật khẩu mới phải có tối thiểu 6 ký tự' : 'New password must have at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(lang === 'vi' ? 'Mật khẩu xác nhận không khớp' : 'Passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword,
        newPassword
      });

      showSuccess(lang === 'vi' ? 'Đã thay đổi mật khẩu thành công!' : 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi đổi mật khẩu' : 'Failed to change password'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 24px 60px 24px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '28px',
          backgroundColor: '#111111',
          color: '#ffffff',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={fullName}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ffffff',
                backgroundColor: '#333'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '22px',
                height: '22px',
                backgroundColor: '#e60012',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #111'
              }}
            >
              <Sparkles size={12} color="#fff" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                {user.fullName || user.email}
              </h1>
              <span className="badge-uq red">{user.role}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0 0 0' }}>
              {lang === 'vi' ? 'Thành viên BEO LifeWear • Email:' : 'BEO LifeWear Member • Email:'} <strong>{user.email}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onNavigate('orders')}
            className="btn-uq btn-uq-outline-gray"
            style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#fff', borderColor: '#444' }}
          >
            <ShoppingBag size={16} />
            <span>{t('orders')}</span>
          </button>
          <button
            onClick={() => onNavigate('wishlist')}
            className="btn-uq btn-uq-outline-gray"
            style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#fff', borderColor: '#444' }}
          >
            <Heart size={16} />
            <span>{t('wishlist')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Left Sidebar Navigation */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            {lang === 'vi' ? 'Tài Khoản Của Tôi' : 'My Account Settings'}
          </div>

          <div>
            {[
              { id: 'general', label: lang === 'vi' ? '1. Thông tin cá nhân & Địa chỉ' : '1. Profile & Shipping Address', icon: <User size={18} /> },
              { id: 'password', label: lang === 'vi' ? '2. Bảo mật & Đổi mật khẩu' : '2. Security & Password', icon: <Lock size={18} /> },
              { id: 'membership', label: lang === 'vi' ? '3. Quyền lợi Hội viên BEO Club' : '3. BEO Club Membership Privileges', icon: <Award size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  border: 'none',
                  borderLeft: activeTab === tab.id ? '4px solid #e60012' : '4px solid transparent',
                  backgroundColor: activeTab === tab.id ? '#fafafa' : '#ffffff',
                  color: activeTab === tab.id ? '#e60012' : '#333',
                  fontWeight: activeTab === tab.id ? '800' : '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  transition: 'var(--transition)'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '20px', backgroundColor: '#fcfcfc', borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#00875a' }}>
              <ShieldCheck size={18} />
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{lang === 'vi' ? 'Bảo mật thông tin 100%' : '100% Privacy Protected'}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.5, margin: 0 }}>
              {lang === 'vi' ? 'Dữ liệu của bạn được mã hóa an toàn theo tiêu chuẩn bảo mật điện tử của BEO STORE.' : 'Your data is encrypted securely following international e-commerce standards.'}
            </p>
          </div>
        </div>

        {/* Right Tab Content Area */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '28px' }}>
          {/* ================= TAB 1: GENERAL PROFILE ================= */}
          {activeTab === 'general' && (
            <div>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Hồ Sơ Cá Nhân & Địa Chỉ Giao Hàng' : 'Personal Profile & Shipping Address'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                  {lang === 'vi' ? 'Quản lý thông tin hồ sơ để việc đặt hàng và nhận ưu đãi diễn ra nhanh chóng nhất.' : 'Manage profile details for faster checkout and exclusive member perks.'}
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* Avatar Chooser */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
                    {lang === 'vi' ? 'Ảnh đại diện (Avatar)' : 'Profile Photo (Avatar)'}
                  </label>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                    <img
                      src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt="Preview"
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }}
                    />
                    <div style={{ flex: 1 }}>
                      <input
                        type="url"
                        placeholder={lang === 'vi' ? 'Nhập đường dẫn URL ảnh hoặc chọn mẫu bên dưới...' : 'Enter photo URL or choose a preset below...'}
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Preset Avatars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#666' }}>{lang === 'vi' ? 'Gợi ý mẫu:' : 'Presets:'}</span>
                    {PRESET_AVATARS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Preset ${idx + 1}`}
                        onClick={() => setAvatar(url)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: avatar === url ? '2px solid #e60012' : '1px solid #ccc',
                          transform: avatar === url ? 'scale(1.1)' : 'scale(1)',
                          transition: 'transform 0.15s'
                        }}
                        title={lang === 'vi' ? 'Bấm để chọn' : 'Click to select'}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                      {lang === 'vi' ? 'Họ và tên *' : 'Full Name *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem' }}
                        placeholder="Alex Johnson"
                      />
                      <User size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                      {lang === 'vi' ? 'Số điện thoại nhận hàng' : 'Phone Number'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem' }}
                        placeholder="0912345678"
                      />
                      <Phone size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Email đăng nhập (Không thể thay đổi)' : 'Account Email (Read-only)'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5', color: '#666', outline: 'none', fontSize: '0.9rem', cursor: 'not-allowed' }}
                    />
                    <Mail size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                      {lang === 'vi' ? 'Địa chỉ nhận hàng mặc định' : 'Default Shipping Address'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem' }}
                        placeholder={lang === 'vi' ? 'Số nhà, tên đường, phường/xã...' : 'Street address, apartment, ward...'}
                      />
                      <MapPin size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                      {lang === 'vi' ? 'Tỉnh / Thành phố' : 'City / Province'}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem', backgroundColor: '#fff' }}
                    >
                      <option value="Can Tho">Can Tho</option>
                      <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                      <option value="Ha Noi">Ha Noi</option>
                      <option value="Da Nang">Da Nang</option>
                      <option value="Hai Phong">Hai Phong</option>
                      <option value="Binh Duong">Binh Duong</option>
                      <option value="Dong Nai">Dong Nai</option>
                      <option value="An Giang">An Giang</option>
                      <option value="Kien Giang">Kien Giang</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn-uq btn-uq-red"
                    style={{ padding: '12px 28px', fontSize: '0.9rem', fontWeight: '700' }}
                  >
                    <Save size={16} />
                    <span>{isSavingProfile ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? 'Lưu Thay Đổi' : 'Save Changes')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 2: PASSWORD CHANGE ================= */}
          {activeTab === 'password' && (
            <div>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Đổi Mật Khẩu Bảo Mật' : 'Change Security Password'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                  {lang === 'vi' ? 'Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu của bạn cho người khác.' : 'Keep your account secure by using a strong password of at least 6 characters.'}
                </p>
              </div>

              <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Mật khẩu hiện tại *' : 'Current Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem' }}
                    placeholder={lang === 'vi' ? 'Nhập mật khẩu đang dùng' : 'Enter current password'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Mật khẩu mới * (Tối thiểu 6 ký tự)' : 'New Password * (At least 6 characters)'}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem' }}
                    placeholder={lang === 'vi' ? 'Nhập mật khẩu mới' : 'Enter new password'}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Xác nhận mật khẩu mới *' : 'Confirm New Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.9rem' }}
                    placeholder={lang === 'vi' ? 'Nhập lại mật khẩu mới' : 'Confirm new password'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="btn-uq btn-uq-red"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', fontWeight: '700' }}
                >
                  <Lock size={16} />
                  <span>{isSavingPassword ? (lang === 'vi' ? 'Đang cập nhật...' : 'Updating...') : (lang === 'vi' ? 'Cập Nhật Mật Khẩu' : 'Update Password')}</span>
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB 3: MEMBERSHIP & REWARDS ================= */}
          {activeTab === 'membership' && (
            <div>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Hội Viên BEO Club & Đặc Quyền' : 'BEO Club Membership & Rewards'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                  {lang === 'vi' ? 'Thẻ thành viên điện tử BEO LifeWear tích điểm cho mọi đơn hàng trực tuyến và tại cửa hàng.' : 'Digital loyalty membership card earning reward points for every purchase.'}
                </p>
              </div>

              {/* Digital Membership Card Preview */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #111111 0%, #333333 100%)',
                  color: '#ffffff',
                  padding: '24px',
                  marginBottom: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#aaa', textTransform: 'uppercase' }}>
                      BEO LIFEWEAR MEMBER
                    </span>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', marginTop: '4px', letterSpacing: '1px' }}>
                      {user.fullName || 'ESTEEMED CLIENT'}
                    </div>
                  </div>
                  <span className="badge-uq red" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                    BEO VIP SILVER
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{lang === 'vi' ? 'MÃ THÀNH VIÊN' : 'MEMBER ID'}</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '2px', fontFamily: 'monospace' }}>
                      BEO-{user.id ? String(user.id).padStart(6, '0') : '888888'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{lang === 'vi' ? 'ĐIỂM TÍCH LŨY' : 'REWARD POINTS'}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffb800' }}>
                      {user.points ? user.points.toLocaleString() : '1,500'} PTS
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Grid */}
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '14px', textTransform: 'uppercase' }}>
                {lang === 'vi' ? 'Đặc Quyền Hội Viên Dành Riêng Cho Bạn' : 'Exclusive VIP Member Benefits'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', border: '1px solid #eee', backgroundColor: '#fafafa' }}>
                  <div style={{ color: '#e60012', fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>
                    🎁 {lang === 'vi' ? 'Voucher Sinh Nhật 15%' : '15% Birthday Gift Voucher'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {lang === 'vi' ? 'Nhận mã giảm giá 15% vào tháng sinh nhật của bạn cho mọi sản phẩm LifeWear.' : 'Receive a special 15% birthday discount voucher during your birthday month.'}
                  </div>
                </div>

                <div style={{ padding: '16px', border: '1px solid #eee', backgroundColor: '#fafafa' }}>
                  <div style={{ color: '#e60012', fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>
                    🚚 {lang === 'vi' ? 'Miễn Phí Vận Chuyển' : 'Free Standard Shipping'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {lang === 'vi' ? 'Tự động freeship toàn quốc cho tất cả đơn hàng từ 500.000đ.' : 'Automatic free shipping on all orders over 500,000 VND.'}
                  </div>
                </div>

                <div style={{ padding: '16px', border: '1px solid #eee', backgroundColor: '#fafafa' }}>
                  <div style={{ color: '#e60012', fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>
                    🔄 {lang === 'vi' ? '30 Ngày Đổi Trả' : '30-Day Free Return & Exchange'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {lang === 'vi' ? 'Chính sách đổi hàng linh hoạt tại toàn bộ hệ thống cửa hàng BEO trên toàn quốc.' : 'Hassle-free exchange policy across all BEO flagship stores nationwide.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
