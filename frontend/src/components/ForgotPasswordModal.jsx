import React, { useState } from 'react';
import { KeyRound, Mail, ShieldCheck, X } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      const challenge = response.data;
      if (challenge?.resetToken) setToken(challenge.resetToken);
      setStep('reset');
      setMessage(lang === 'vi'
        ? 'Mã đặt lại có hiệu lực trong 15 phút. Mã đã được điền tự động trên môi trường local.'
        : 'The reset token is valid for 15 minutes and has been filled automatically in the local environment.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setStep('complete');
      setMessage(lang === 'vi' ? 'Mật khẩu đã được cập nhật. Bạn có thể đăng nhập ngay.' : 'Password updated. You can sign in now.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="reset-password-title" style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,.7)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div style={{ width: 'min(100%, 460px)', background: '#fff', border: '1px solid #111', boxShadow: '0 24px 64px rgba(0,0,0,.35)' }}>
        <div style={{ background: '#111', color: '#fff', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <KeyRound size={20} color="#e60012" />
            <h2 id="reset-password-title" style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase' }}>{lang === 'vi' ? 'Đặt lại mật khẩu' : 'Reset password'}</h2>
          </div>
          <button onClick={onClose} aria-label="Close"><X color="#fff" /></button>
        </div>

        <div style={{ padding: 24 }}>
          {step === 'request' && (
            <form onSubmit={requestReset} style={{ display: 'grid', gap: 14 }}>
              <p style={{ color: '#555', lineHeight: 1.6 }}>{lang === 'vi' ? 'Nhập email tài khoản để tạo mã đặt lại mật khẩu dùng một lần.' : 'Enter your account email to create a one-time reset token.'}</p>
              <label style={{ fontSize: '.8rem', fontWeight: 800 }}>{lang === 'vi' ? 'EMAIL TÀI KHOẢN' : 'ACCOUNT EMAIL'}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#777' }} />
                <input autoFocus required type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #bbb' }} />
              </div>
              <button disabled={loading} className="btn-beo btn-beo-primary" style={{ minHeight: 46 }}>{loading ? '...' : (lang === 'vi' ? 'Tạo mã đặt lại' : 'Create reset token')}</button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={resetPassword} style={{ display: 'grid', gap: 14 }}>
              <label style={{ fontSize: '.8rem', fontWeight: 800 }}>{lang === 'vi' ? 'MÃ ĐẶT LẠI' : 'RESET TOKEN'}</label>
              <input required value={token} onChange={(event) => setToken(event.target.value)} style={{ width: '100%', padding: 11, border: '1px solid #bbb', fontFamily: 'monospace' }} />
              <label style={{ fontSize: '.8rem', fontWeight: 800 }}>{lang === 'vi' ? 'MẬT KHẨU MỚI (TỪ 8 KÝ TỰ)' : 'NEW PASSWORD (8+ CHARACTERS)'}</label>
              <input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={{ width: '100%', padding: 11, border: '1px solid #bbb' }} />
              <button disabled={loading} className="btn-beo btn-beo-primary" style={{ minHeight: 46 }}>{loading ? '...' : (lang === 'vi' ? 'Cập nhật mật khẩu' : 'Update password')}</button>
            </form>
          )}

          {step === 'complete' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <ShieldCheck size={48} color="#00875a" style={{ margin: '0 auto 12px' }} />
              <button onClick={onClose} className="btn-beo btn-beo-primary">{lang === 'vi' ? 'Quay lại đăng nhập' : 'Return to sign in'}</button>
            </div>
          )}

          {message && <div style={{ marginTop: 16, padding: 12, background: step === 'complete' ? '#e8f5e9' : '#f5f5f5', color: '#333', fontSize: '.82rem', lineHeight: 1.5 }}>{message}</div>}
        </div>
      </div>
    </div>
  );
};
