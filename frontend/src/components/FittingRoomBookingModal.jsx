import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Store, Phone } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export const FittingRoomBookingModal = ({ isOpen, onClose, productName, selectedVariant }) => {
  const { user } = useAuth();
  const { showSuccess } = useToast();

  const [dateOption, setDateOption] = useState('Hôm nay');
  const [timeSlot, setTimeSlot] = useState('14:00 - 15:30');
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState(`Chuẩn bị sản phẩm ${productName || ''} (${selectedVariant?.color || ''} - Size ${selectedVariant?.size || ''})`);
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      return;
    }
    setIsBooked(true);
    showSuccess('Đặt lịch thử đồ thành công! Nhân viên Showroom Cần Thơ đã sẵn sàng đón tiếp quý khách.');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '520px',
        border: '2px solid #111',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#111111',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#e60012', padding: '6px', borderRadius: '4px', display: 'flex' }}>
              <Store size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                HẸN LỊCH THỬ ĐỒ TẠI SHOWROOM CẦN THƠ
              </div>
              <div style={{ fontSize: '0.75rem', color: '#bbb' }}>
                BEO VIP Fitting Room Experience
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {isBooked ? (
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: '#e8f5e9', borderRadius: '50%', marginBottom: '16px' }}>
              <CheckCircle2 size={48} color="#2e7d32" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              ĐẶT LỊCH THỬ ĐỒ THÀNH CÔNG!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5, marginBottom: '20px' }}>
              Nhân viên BEO Showroom Cần Thơ đã tiếp nhận và chuẩn bị sẵn set đồ trong phòng thử VIP cho bạn vào lúc <strong>{timeSlot} ({dateOption})</strong>.
            </p>
            <div style={{ backgroundColor: '#f9f9f9', padding: '12px', border: '1px dashed #ddd', fontSize: '0.8rem', color: '#666', marginBottom: '24px' }}>
              📍 <strong>Địa chỉ Showroom:</strong> 123 Đường 30 Tháng 4, Q. Ninh Kiều, Cần Thơ<br />
              📞 <strong>Hotline hỗ trợ:</strong> 1900019199999
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '12px 28px',
                backgroundColor: '#111',
                color: '#fff',
                border: 'none',
                fontWeight: '900',
                fontSize: '0.88rem',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              Đã Hiểu & Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* Showroom Location Banner */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f5f5f5', padding: '12px', marginBottom: '20px' }}>
              <MapPin size={18} color="#e60012" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: '#333' }}>
                <strong>BEO Flagship Showroom Cần Thơ</strong><br />
                123 Đường 30 Tháng 4, P. An Phú, Q. Ninh Kiều, TP. Cần Thơ (Mở cửa 8:30 - 22:00)
              </div>
            </div>

            {/* Date Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '8px' }}>
                1. Chọn Ngày Ghé Thử:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Hôm nay', 'Ngày mai', 'Ngày kia'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDateOption(d)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '0.82rem',
                      fontWeight: dateOption === d ? '800' : '600',
                      border: dateOption === d ? '2px solid #111' : '1px solid #ddd',
                      backgroundColor: dateOption === d ? '#111' : '#fff',
                      color: dateOption === d ? '#fff' : '#444',
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '8px' }}>
                2. Chọn Khung Giờ:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  '09:00 - 10:30',
                  '11:00 - 12:30',
                  '14:00 - 15:30',
                  '16:30 - 18:00',
                  '19:00 - 20:30',
                  '20:30 - 21:45'
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    style={{
                      padding: '8px',
                      fontSize: '0.78rem',
                      fontWeight: timeSlot === slot ? '800' : '600',
                      border: timeSlot === slot ? '2px solid #e60012' : '1px solid #ddd',
                      backgroundColor: timeSlot === slot ? '#fff0f0' : '#fff',
                      color: timeSlot === slot ? '#e60012' : '#444',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '4px' }}>
                  Họ và tên:
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '4px' }}>
                  Số điện thoại:
                </label>
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '4px' }}>
                Yêu cầu chuẩn bị thêm:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', fontSize: '0.82rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#e60012',
                color: '#fff',
                border: 'none',
                fontWeight: '900',
                fontSize: '0.92rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(230,0,18,0.3)'
              }}
            >
              Xác Nhận Giữ Chỗ & Đặt Lịch Thử VIP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
