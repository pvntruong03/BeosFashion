import React, { useState } from 'react';
import { X, Ruler, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const SizeAdvisorModal = ({ isOpen, onClose, onSelectSize }) => {
  const { lang } = useLanguage();
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(66);
  const [preference, setPreference] = useState('regular');
  const [activeTab, setActiveTab] = useState('advisor');

  if (!isOpen) return null;

  // Calculate recommended size
  const calculateSize = () => {
    let base = 'M';

    if (height < 162 || weight < 52) base = 'XS';
    else if (height < 168 || weight < 60) base = 'S';
    else if (height < 176 && weight < 72) base = 'M';
    else if (height < 183 && weight < 82) base = 'L';
    else if (height < 188 || weight < 92) base = 'XL';
    else base = 'XXL';

    if (preference === 'loose' && base !== '3XL') {
      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
      const idx = sizes.indexOf(base);
      if (idx < sizes.length - 1) base = sizes[idx + 1];
    } else if (preference === 'slim' && base !== 'XS') {
      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
      const idx = sizes.indexOf(base);
      if (idx > 0) base = sizes[idx - 1];
    }

    return base;
  };

  const recommendedSize = calculateSize();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ruler size={20} color="#e60012" />
            <span style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Hướng Dẫn & Gợi Ý Chọn Size' : 'Size Guide & AI Fit Advisor'}
            </span>
          </div>
          <button onClick={onClose} style={{ padding: '4px', color: '#666', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
          <button
            onClick={() => setActiveTab('advisor')}
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: '700',
              fontSize: '0.9rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'advisor' ? '2px solid #e60012' : '2px solid transparent',
              color: activeTab === 'advisor' ? '#e60012' : '#666'
            }}
          >
            {lang === 'vi' ? 'Trợ Lý Gợi Ý Thông Minh' : 'Smart Fit Advisor'}
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: '700',
              fontSize: '0.9rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'chart' ? '2px solid #e60012' : '2px solid transparent',
              color: activeTab === 'chart' ? '#e60012' : '#666'
            }}
          >
            {lang === 'vi' ? 'Bảng Kích Cỡ Chi Tiết' : 'Measurement Chart'}
          </button>
        </div>

        {/* Tab 1: Smart Advisor */}
        {activeTab === 'advisor' && (
          <div style={{ padding: '24px' }}>
            {/* Height Slider */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{lang === 'vi' ? 'Chiều cao của bạn:' : 'Your Height:'}</span>
                <span style={{ fontWeight: '800', color: '#e60012', fontSize: '1rem' }}>{height} cm</span>
              </div>
              <input
                type="range"
                min="145"
                max="200"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#e60012' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888' }}>
                <span>145 cm</span>
                <span>200 cm</span>
              </div>
            </div>

            {/* Weight Slider */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{lang === 'vi' ? 'Cân nặng của bạn:' : 'Your Weight:'}</span>
                <span style={{ fontWeight: '800', color: '#e60012', fontSize: '1rem' }}>{weight} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#e60012' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888' }}>
                <span>40 kg</span>
                <span>120 kg</span>
              </div>
            </div>

            {/* Fit Preference */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px' }}>
                {lang === 'vi' ? 'Sở thích phom dáng:' : 'Fit Preference:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'slim', label: lang === 'vi' ? 'Ôm vừa vặn' : 'Slim Fit' },
                  { id: 'regular', label: lang === 'vi' ? 'Chuẩn thoải mái' : 'Regular Fit' },
                  { id: 'loose', label: lang === 'vi' ? 'Rộng rãi Oversize' : 'Relaxed / Oversized' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreference(p.id)}
                    style={{
                      padding: '10px 8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      border: preference === p.id ? '2px solid #111' : '1px solid #ddd',
                      backgroundColor: preference === p.id ? '#111' : '#fff',
                      color: preference === p.id ? '#fff' : '#333',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div style={{
              backgroundColor: '#f8f8f8',
              border: '2px solid #e60012',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#e60012', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                <Sparkles size={18} />
                <span>{lang === 'vi' ? 'KẾT QUẢ GỢI Ý DỰA TRÊN 10.000+ KHÁCH HÀNG' : 'RECOMMENDATION BASED ON 10,000+ FIT PROFILES'}</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111', lineHeight: 1.1, margin: '8px 0' }}>
                SIZE {recommendedSize}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                {lang === 'vi' ? `Độ phù hợp: 96% (Chiều cao ${height}cm, cân nặng ${weight}kg)` : `Confidence score: 96% (${height}cm, ${weight}kg)`}
              </p>
            </div>

            <button
              onClick={() => {
                if (onSelectSize) onSelectSize(recommendedSize);
                onClose();
              }}
              className="btn-beo btn-beo-red"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <CheckCircle2 size={18} />
              <span>{lang === 'vi' ? `Chọn Size ${recommendedSize} Ngay` : `Select Size ${recommendedSize} Now`}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Measurement Table */}
        {activeTab === 'chart' && (
          <div style={{ padding: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', fontWeight: '700' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Size</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>{lang === 'vi' ? 'Vòng ngực (cm)' : 'Chest (cm)'}</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>{lang === 'vi' ? 'Chiều dài áo (cm)' : 'Length (cm)'}</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>{lang === 'vi' ? 'Rộng vai (cm)' : 'Shoulder (cm)'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: 'XS', b: '80 - 88', l: '64', sh: '42' },
                  { s: 'S', b: '88 - 96', l: '66', sh: '44' },
                  { s: 'M', b: '96 - 104', l: '69', sh: '46' },
                  { s: 'L', b: '104 - 112', l: '72', sh: '48' },
                  { s: 'XL', b: '112 - 120', l: '75', sh: '50' },
                  { s: 'XXL', b: '120 - 128', l: '77', sh: '52' },
                ].map((row) => (
                  <tr key={row.s} style={{ backgroundColor: row.s === recommendedSize ? '#fff9e6' : 'transparent' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: '800' }}>{row.s}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{row.b}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{row.l}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{row.sh}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
              {lang === 'vi'
                ? '* Lưu ý: Thông số kích thước có thể chênh lệch 1-2cm tùy theo phom dáng của từng mẫu sản phẩm cụ thể.'
                : '* Note: Standard dimensions may vary by 1-2cm depending on individual garment silhouette.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
