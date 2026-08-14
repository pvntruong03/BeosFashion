import React, { useState, useMemo } from 'react';
import { X, Sparkles, Check, Info, ArrowRight, UserCheck } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export const AiSizeRecommenderModal = ({ isOpen, onClose, onSelectSize, currentSelectedSize, productName }) => {
  const { showSuccess } = useToast();

  const [gender, setGender] = useState('MEN'); // 'MEN', 'WOMEN'
  const [height, setHeight] = useState(172); // cm
  const [weight, setWeight] = useState(66); // kg
  const [fitPreference, setFitPreference] = useState('REGULAR'); // 'SLIM', 'REGULAR', 'RELAXED', 'OVERSIZE'

  // AI Size Calculation
  const recommendation = useMemo(() => {
    const bmi = weight / Math.pow(height / 100, 2);
    let baseSize = 'M';
    let confidence = 96;

    if (gender === 'MEN') {
      if (height < 165 && weight < 56) baseSize = 'S';
      else if (height <= 172 && weight <= 66) baseSize = 'M';
      else if (height <= 178 && weight <= 76) baseSize = 'L';
      else if (height <= 185 && weight <= 86) baseSize = 'XL';
      else baseSize = 'XXL';
    } else {
      if (height < 155 && weight < 47) baseSize = 'XS';
      else if (height <= 160 && weight <= 53) baseSize = 'S';
      else if (height <= 166 && weight <= 60) baseSize = 'M';
      else if (height <= 172 && weight <= 68) baseSize = 'L';
      else baseSize = 'XL';
    }

    // Fit adjustment
    const sizeHierarchy = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    let currentIndex = sizeHierarchy.indexOf(baseSize);

    if (fitPreference === 'SLIM' && currentIndex > 0 && bmi < 24) {
      // Keep or down
    } else if ((fitPreference === 'RELAXED' || fitPreference === 'OVERSIZE') && currentIndex < sizeHierarchy.length - 1) {
      currentIndex += 1;
      baseSize = sizeHierarchy[currentIndex];
      confidence = 94;
    }

    let bmiStatus = 'Cân đối (Chuẩn phom BEO)';
    if (bmi < 18.5) bmiStatus = 'Thon gọn (Gầy nhẹ)';
    else if (bmi >= 25 && bmi < 30) bmiStatus = 'Đậm người (Cần phom thoải mái)';
    else if (bmi >= 30) bmiStatus = 'Dáng vạm vỡ / Tròn';

    return {
      size: baseSize,
      confidence,
      bmi: bmi.toFixed(1),
      bmiStatus,
      chestEst: gender === 'MEN' ? Math.round(weight * 0.95 + 30) : Math.round(weight * 0.9 + 32),
      waistEst: gender === 'MEN' ? Math.round(weight * 0.85 + 24) : Math.round(weight * 0.8 + 22),
    };
  }, [gender, height, weight, fitPreference]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectSize(recommendation.size);
    showSuccess(`Đã tự động chọn Size ${recommendation.size} chuẩn theo vóc dáng của bạn!`);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '2px solid #111111',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative',
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
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                AI SIZE ASSISTANT • GỢI Ý SIZE CHUẨN XÁC
              </div>
              <div style={{ fontSize: '0.75rem', color: '#bbb' }}>
                Công nghệ đo chuẩn phom dáng thời trang BEO Modern Fashion
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

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Gender Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: '#333' }}>
              1. Giới Tính:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'MEN', label: 'Nam (Men)' },
                { id: 'WOMEN', label: 'Nữ (Women)' }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    border: gender === g.id ? '2px solid #111' : '1px solid #ddd',
                    backgroundColor: gender === g.id ? '#111' : '#f9f9f9',
                    color: gender === g.id ? '#fff' : '#444',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Height & Weight Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#333' }}>2. Chiều Cao:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#e60012' }}>{height} cm</span>
              </div>
              <input
                type="range"
                min="145"
                max="195"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#111', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888' }}>
                <span>145 cm</span>
                <span>170 cm</span>
                <span>195 cm</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#333' }}>3. Cân Nặng:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#e60012' }}>{weight} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="115"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#111', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888' }}>
                <span>40 kg</span>
                <span>75 kg</span>
                <span>115 kg</span>
              </div>
            </div>
          </div>

          {/* Fit Preference */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: '#333' }}>
              4. Form Dáng Ưa Thích:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { id: 'SLIM', label: 'Ôm Sát (Slim)' },
                { id: 'REGULAR', label: 'Vừa Vặn (Standard)' },
                { id: 'RELAXED', label: 'Thoải Mái (Loose)' },
                { id: 'OVERSIZE', label: 'Oversize (Rộng)' }
              ].map((fit) => (
                <button
                  key={fit.id}
                  onClick={() => setFitPreference(fit.id)}
                  style={{
                    padding: '8px 4px',
                    fontSize: '0.75rem',
                    fontWeight: fitPreference === fit.id ? '800' : '600',
                    border: fitPreference === fit.id ? '2px solid #e60012' : '1px solid #ddd',
                    backgroundColor: fitPreference === fit.id ? '#fff0f0' : '#ffffff',
                    color: fitPreference === fit.id ? '#e60012' : '#555',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    textAlign: 'center'
                  }}
                >
                  {fit.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '2px solid #111',
            padding: '20px',
            position: 'relative',
            marginBottom: '20px'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '16px',
              backgroundColor: '#e60012',
              color: '#fff',
              padding: '2px 10px',
              fontSize: '0.72rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Kết Quả Đề Xuất Từ AI BEO
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '2px' }}>
                  Kích thước khuyến nghị cho bạn:
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#111', lineHeight: 1 }}>
                    SIZE {recommendation.size}
                  </span>
                  <span style={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '3px 8px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    borderRadius: '12px'
                  }}>
                    Độ chuẩn xác {recommendation.confidence}%
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#555', borderLeft: '1px solid #ddd', paddingLeft: '16px' }}>
                <div>Chỉ số BMI: <strong>{recommendation.bmi}</strong></div>
                <div style={{ color: '#00875a', fontWeight: '700' }}>{recommendation.bmiStatus}</div>
                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#777' }}>
                  Ngực ~{recommendation.chestEst}cm • Eo ~{recommendation.waistEst}cm
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleApply}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#e60012',
                color: '#ffffff',
                border: 'none',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(230,0,18,0.3)'
              }}
            >
              <UserCheck size={18} />
              <span>Áp Dụng Size {recommendation.size} Này Ngay</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '14px 20px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
