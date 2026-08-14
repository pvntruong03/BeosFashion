import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Type,
  Smile,
  Upload,
  RotateCcw,
  ShoppingBag,
  Eye,
  Check,
  Palette,
  Layers,
  HelpCircle,
  X,
  Plus,
  Minus,
  Sliders,
  Award,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

// Base Apparel Types
const APPAREL_TYPES = [
  {
    id: 'tshirt',
    name: 'Áo Thun Cotton Supima Trơn',
    basePrice: 299000,
    frontImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    description: 'Chất vải 100% Cotton Supima dệt mịn màng, bề mặt phẳng mịn tối ưu cho in ấn và thêu vi tính cao cấp.'
  },
  {
    id: 'polo',
    name: 'Áo Polo AIRism Pique Có Cổ',
    basePrice: 399000,
    frontImage: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    description: 'Vải dệt pique thoáng khí AIRism mát lạnh, cổ áo đứng phom lịch lãm, thích hợp thêu logo ngực trái.'
  },
  {
    id: 'hoodie',
    name: 'Áo Hoodie Nỉ Bông Dày Dặn',
    basePrice: 549000,
    frontImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    description: 'Form áo Oversized dáng Streetwear rộng rãi, mũ trùm 2 lớp giữ ấm cực tốt.'
  },
  {
    id: 'tote',
    name: 'Túi Tote Vải Canvas Dày 12oz',
    basePrice: 199000,
    frontImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    description: 'Vải bố canvas mộc bền chắc, quai đeo êm ái, in chữ slogan thời trang.'
  }
];

// Garment Base Colors
const BASE_COLORS = [
  { name: '00 WHITE', hex: '#FFFFFF', bg: '#f8f9fa', border: '#ddd', textColor: '#111' },
  { name: '09 BLACK', hex: '#1C1C1C', bg: '#1c1c1c', border: '#000', textColor: '#fff' },
  { name: '69 NAVY', hex: '#1E2B37', bg: '#1e2b37', border: '#111', textColor: '#fff' },
  { name: '31 BEIGE', hex: '#E6DCB8', bg: '#e6dcb8', border: '#ccc', textColor: '#333' },
  { name: '04 GRAY', hex: '#A8A8A8', bg: '#a8a8a8', border: '#888', textColor: '#fff' }
];

// Embroidery & Print Thread Colors
const THREAD_COLORS = [
  { name: 'Chỉ Vàng Gold', hex: '#D4AF37', border: '#b8941f' },
  { name: 'Chỉ Trắng Tinh', hex: '#FFFFFF', border: '#ddd' },
  { name: 'Chỉ Đen Tuyền', hex: '#111111', border: '#000' },
  { name: 'Chỉ Đỏ BEO', hex: '#E60012', border: '#b3000e' },
  { name: 'Chỉ Xanh Royal', hex: '#0052CC', border: '#003d99' },
  { name: 'Chỉ Xanh Rêu', hex: '#2E7D32', border: '#1b5e20' },
  { name: 'Chỉ Bạc Silver', hex: '#C0C0C0', border: '#999' }
];

// Typography Fonts
const FONTS = [
  { id: 'sans', name: 'Hiện Đại (Sans-serif)', fontFamily: "'Inter', sans-serif", style: 'Clean & Minimal' },
  { id: 'serif', name: 'Cổ Điển (Serif)', fontFamily: "'Playfair Display', Georgia, serif", style: 'Luxury & Elegant' },
  { id: 'mono', name: 'Mã Vạch / Tech (Mono)', fontFamily: "'JetBrains Mono', monospace", style: 'Tech & Streetwear' },
  { id: 'bold', name: 'Đậm Nét (Bold Impact)', fontFamily: "'Oswald', Impact, sans-serif", style: 'Bold & Sporty' },
  { id: 'cursive', name: 'Chữ Ký Nghệ Thuật', fontFamily: "'Dancing Script', cursive, serif", style: 'Signature & Chic' }
];

// Print & Embroidery Positions
const PRINT_POSITIONS = [
  { id: 'CHEST_LEFT', name: 'Ngực Trái (Thêu Nhỏ)', description: 'Thêu tên / logo mini 5-7cm thanh lịch', fee: 50000 },
  { id: 'CHEST_CENTER', name: 'Chính Giữa Ngực', description: 'In / Thêu slogan bản rộng 20cm nổi bật', fee: 70000 },
  { id: 'BACK_CENTER', name: 'Lưng Áo (Bản To)', description: 'In họa tiết lớn sau lưng phong cách Streetwear', fee: 90000 }
];

// Badges & Embroidery Icons
const EMBROIDERY_ICONS = [
  { id: 'beo-logo', name: 'BEO Brand Crown', icon: '👑' },
  { id: 'heart', name: 'Trái Tim Tối Giản', icon: '❤️' },
  { id: 'star', name: 'Ngôi Sao May Mắn', icon: '⭐' },
  { id: 'sparkle', name: 'Ánh Kim Cương', icon: '✨' },
  { id: 'cantho-wave', name: 'Sóng Biển Cần Thơ', icon: '🌊' },
  { id: 'coffee', name: 'Cà Phê Sáng', icon: '☕' },
  { id: 'fire', name: 'Ngọn Lửa Nhiệt Huyết', icon: '🔥' },
  { id: 'clover', name: 'Cỏ 4 Lá May Mắn', icon: '🍀' },
  { id: 'cat', name: 'Mèo Năng Lượng', icon: '🐱' },
  { id: 'smile', name: 'Nụ Cười Happy', icon: '😊' },
  { id: 'music', name: 'Nốt Nhạc Chill', icon: '🎵' },
  { id: 'plane', name: 'Máy Bay Du Lịch', icon: '✈️' }
];

export const ProductCustomizerStudio = ({ initialProduct, onClose, onNavigate }) => {
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { formatPrice } = useLanguage();

  const fileInputRef = useRef(null);

  // Studio States
  const [selectedApparel, setSelectedApparel] = useState(APPAREL_TYPES[0]);
  const [selectedColor, setSelectedColor] = useState(BASE_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [viewSide, setViewSide] = useState('FRONT'); // 'FRONT' | 'BACK'
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'badge' | 'image' | 'garment'

  // Customization Layer States
  const [position, setPosition] = useState('CHEST_LEFT');
  const [customText, setCustomText] = useState('BEO 2026');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedThread, setSelectedThread] = useState(THREAD_COLORS[3]); // Red
  const [textSize, setTextSize] = useState(20);
  const [selectedBadge, setSelectedBadge] = useState(EMBROIDERY_ICONS[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageScale, setImageScale] = useState(100);

  // Price Calculation
  const currentPosConfig = PRINT_POSITIONS.find((p) => p.id === position) || PRINT_POSITIONS[0];
  const customFee = currentPosConfig.fee;
  const totalPrice = selectedApparel.basePrice + customFee;

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showError('Dung lượng ảnh tối đa 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setActiveTab('image');
      showSuccess('Đã tải ảnh lên canvas thành công!');
    };
    reader.readAsDataURL(file);
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    const customDetails = {
      isCustomized: true,
      apparelName: selectedApparel.name,
      garmentColor: selectedColor.name,
      size: selectedSize,
      position: currentPosConfig.name,
      text: customText.trim() || null,
      font: selectedFont.name,
      threadColor: selectedThread.name,
      badge: selectedBadge ? selectedBadge.name : null,
      hasUploadedImage: !!uploadedImage
    };

    // Synthesize product object for cart
    const customizedProduct = {
      id: 21, // Custom Lab Product ID
      name: `[Custom Lab] ${selectedApparel.name} - ${customText || 'Cá nhân hóa'}`,
      code: `BEO-CUSTOM-${Date.now().toString().slice(-4)}`,
      primaryImageUrl: selectedApparel.frontImage,
      basePrice: totalPrice,
      salePrice: null,
      customDetails
    };

    const customizedVariant = {
      id: 999, // Dynamic custom variant
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      totalStock: 99,
      priceAdjustment: customFee
    };

    addToCart(customizedProduct, customizedVariant, 1);
    showSuccess(`Đã thêm thiết kế áo "${customText || selectedApparel.name}" vào giỏ hàng!`);
    if (onClose) onClose();
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      boxShadow: 'var(--shadow-lg)',
      borderRadius: '2px',
      overflow: 'hidden',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Studio Header */}
      <div style={{
        backgroundColor: '#111111',
        color: '#ffffff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#e60012',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            borderRadius: '2px'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '900', fontSize: '1.15rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              BEO CUSTOM LAB: XƯỞNG THIẾT KẾ & THÊU ÁO CÁ NHÂN HÓA
            </div>
            <div style={{ fontSize: '0.78rem', color: '#aaa' }}>
              Tự tay sáng tạo chữ thêu vi tính, slogan, sticker & ảnh kỷ niệm trên phôi áo thời trang cao cấp
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Main Studio Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(360px, 1fr)',
        gap: '0',
        minHeight: '620px'
      }}>
        {/* ================= LEFT: INTERACTIVE LIVE CANVAS PREVIEW ================= */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          borderRight: '1px solid #e5e5e5'
        }}>
          {/* Top Canvas Controls: Front/Back view & Base Color Badges */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}>
            {/* Front / Back Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              padding: '3px',
              borderRadius: '2px',
              border: '1px solid #ddd',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <button
                onClick={() => setViewSide('FRONT')}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  border: 'none',
                  backgroundColor: viewSide === 'FRONT' ? '#111' : 'transparent',
                  color: viewSide === 'FRONT' ? '#fff' : '#555',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                MẶT TRƯỚC
              </button>
              <button
                onClick={() => setViewSide('BACK')}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  border: 'none',
                  backgroundColor: viewSide === 'BACK' ? '#111' : 'transparent',
                  color: viewSide === 'BACK' ? '#fff' : '#555',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                MẶT SAU (LƯNG)
              </button>
            </div>

            {/* Position Indicator Badge */}
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              backgroundColor: '#111',
              color: '#fff',
              padding: '5px 12px',
              borderRadius: '2px'
            }}>
              Vị trí: {currentPosConfig.name}
            </div>
          </div>

          {/* Garment Silhouette Mockup with Layered Customization */}
          <div style={{
            position: 'relative',
            width: '380px',
            maxWidth: '100%',
            height: '440px',
            margin: '20px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Garment Base Photo */}
            <img
              src={viewSide === 'FRONT' ? selectedApparel.frontImage : selectedApparel.backImage}
              alt="Custom Apparel"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: selectedColor.hex === '#1C1C1C'
                  ? 'brightness(0.4) contrast(1.2)'
                  : selectedColor.hex === '#1E2B37'
                  ? 'hue-rotate(180deg) brightness(0.5)'
                  : selectedColor.hex === '#E6DCB8'
                  ? 'sepia(0.3) brightness(0.9)'
                  : 'none',
                transition: 'filter 0.3s ease'
              }}
            />

            {/* Live Customization Layer Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Placement Box */}
              <div style={{
                position: 'absolute',
                ...(position === 'CHEST_LEFT' && viewSide === 'FRONT'
                  ? { top: '32%', left: '38%', transform: 'translate(-50%, -50%)', maxWidth: '90px' }
                  : position === 'CHEST_CENTER' && viewSide === 'FRONT'
                  ? { top: '38%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '180px' }
                  : position === 'BACK_CENTER' && viewSide === 'BACK'
                  ? { top: '35%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '200px' }
                  : { display: 'none' }),
                textAlign: 'center',
                padding: '6px',
                border: '1px dashed rgba(230,0,18,0.5)',
                borderRadius: '2px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(1px)'
              }}>
                {/* Uploaded User Photo if any */}
                {uploadedImage && (
                  <div style={{ marginBottom: '4px' }}>
                    <img
                      src={uploadedImage}
                      alt="Uploaded badge"
                      style={{
                        width: `${Math.round(40 * (imageScale / 100))}px`,
                        height: 'auto',
                        borderRadius: '4px',
                        display: 'block',
                        margin: '0 auto',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}
                    />
                  </div>
                )}

                {/* Badge Icon */}
                {selectedBadge && !uploadedImage && (
                  <div style={{
                    fontSize: position === 'CHEST_LEFT' ? '22px' : '36px',
                    lineHeight: 1,
                    marginBottom: '4px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}>
                    {selectedBadge.icon}
                  </div>
                )}

                {/* Custom Text with chosen Font & Thread color */}
                {customText && (
                  <div style={{
                    fontFamily: selectedFont.fontFamily,
                    color: selectedThread.hex,
                    fontSize: `${position === 'CHEST_LEFT' ? Math.min(textSize, 14) : textSize}px`,
                    fontWeight: '900',
                    letterSpacing: selectedFont.id === 'mono' ? '2px' : '1px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.2
                  }}>
                    {customText}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Live Price & Specs Bar */}
          <div style={{
            width: '100%',
            backgroundColor: '#ffffff',
            padding: '12px 18px',
            border: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '2px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>GIÁ PHÔI ÁO + CÔNG THÊU IN:</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#e60012' }}>
                {formatPrice(totalPrice)}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#555' }}>
              <div>Phôi: <strong>{selectedApparel.name}</strong></div>
              <div>Màu: <strong>{selectedColor.name}</strong> | Size: <strong>{selectedSize}</strong></div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: STUDIO CONTROLS & TOOLBOX ================= */}
        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            {/* Toolbox Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '12px'
            }}>
              {[
                { id: 'garment', label: '1. Phôi Áo', icon: <Layers size={15} /> },
                { id: 'text', label: '2. Nhập Chữ', icon: <Type size={15} /> },
                { id: 'badge', label: '3. Sticker', icon: <Smile size={15} /> },
                { id: 'image', label: '4. Tải Ảnh', icon: <Upload size={15} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? '#111' : '#f5f5f5',
                    color: activeTab === tab.id ? '#fff' : '#444',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ================= TAB 1: GARMENT SELECTION ================= */}
            {activeTab === 'garment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Chọn Loại Phôi Trang Phục:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {APPAREL_TYPES.map((ap) => (
                      <div
                        key={ap.id}
                        onClick={() => setSelectedApparel(ap)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          border: selectedApparel.id === ap.id ? '2px solid #111' : '1px solid #ddd',
                          backgroundColor: selectedApparel.id === ap.id ? '#fafafa' : '#fff',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.88rem' }}>{ap.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{ap.description.slice(0, 60)}...</div>
                        </div>
                        <div style={{ fontWeight: '800', color: '#e60012', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                          {formatPrice(ap.basePrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Base Color Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Màu Áo Cơ Bản: <strong>{selectedColor.name}</strong>
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {BASE_COLORS.map((col) => (
                      <div
                        key={col.name}
                        onClick={() => setSelectedColor(col)}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: col.bg,
                          border: selectedColor.name === col.name ? '3px solid #e60012' : `1px solid ${col.border}`,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        title={col.name}
                      >
                        {selectedColor.name === col.name && (
                          <Check size={16} color={col.textColor} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Kích Thước (Size): <strong>{selectedSize}</strong>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          width: '42px',
                          height: '42px',
                          border: selectedSize === sz ? '2px solid #111' : '1px solid #ccc',
                          backgroundColor: selectedSize === sz ? '#111' : '#fff',
                          color: selectedSize === sz ? '#fff' : '#111',
                          fontWeight: '800',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: TEXT & TYPOGRAPHY ================= */}
            {activeTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Input Text Box */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Nội Dung Chữ / Tên / Slogan Cá Nhân:
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="VD: HUYNH NHU, BEO 2026, CAN THO..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.95rem',
                      fontWeight: '800',
                      border: '2px solid #111',
                      outline: 'none',
                      borderRadius: '2px'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '4px', textAlign: 'right' }}>
                    {customText.length}/30 ký tự
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Phông Chữ Nghệ Thuật:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                    {FONTS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFont(font)}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          border: selectedFont.id === font.id ? '2px solid #111' : '1px solid #ddd',
                          backgroundColor: selectedFont.id === font.id ? '#fafafa' : '#fff',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        <div style={{ fontFamily: font.fontFamily, fontWeight: '800', fontSize: '0.9rem' }}>
                          BEO Fashion
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>{font.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thread Color Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Màu Chỉ Thêu / Mực In: <strong>{selectedThread.name}</strong>
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {THREAD_COLORS.map((th) => (
                      <div
                        key={th.name}
                        onClick={() => setSelectedThread(th)}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: th.hex,
                          border: selectedThread.name === th.name ? '3px solid #e60012' : `1px solid ${th.border}`,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        title={th.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '800', marginBottom: '6px' }}>
                    <span>CỠ CHỮ: {textSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="36"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#e60012' }}
                  />
                </div>
              </div>
            )}

            {/* ================= TAB 3: BADGES & ICONS ================= */}
            {activeTab === 'badge' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  Chọn Sticker / Biểu Tượng Thêu:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px'
                }}>
                  {EMBROIDERY_ICONS.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => {
                        setSelectedBadge(badge);
                        setUploadedImage(null); // Clear custom image
                      }}
                      style={{
                        padding: '14px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        border: selectedBadge?.id === badge.id && !uploadedImage ? '2px solid #111' : '1px solid #ddd',
                        backgroundColor: selectedBadge?.id === badge.id && !uploadedImage ? '#fafafa' : '#fff',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{badge.icon}</span>
                      <span style={{ fontSize: '0.68rem', color: '#555', textAlign: 'center', lineHeight: 1.1 }}>
                        {badge.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 4: IMAGE UPLOAD ================= */}
            {activeTab === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  Tải Ảnh / Logo Cá Nhân Của Bạn:
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #ccc',
                    padding: '30px 20px',
                    textAlign: 'center',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  <Upload size={32} color="#888" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#111' }}>
                    Bấm vào đây để chọn ảnh từ máy
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                    Hỗ trợ file JPG, PNG, WEBP (Tối đa 5MB)
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                {uploadedImage && (
                  <div style={{ padding: '12px', border: '1px solid #eee', backgroundColor: '#fcfcfc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Kích thước ảnh in: {imageScale}%</span>
                      <button
                        onClick={() => setUploadedImage(null)}
                        style={{ fontSize: '0.75rem', color: '#e60012', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                      >
                        Gỡ ảnh
                      </button>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={imageScale}
                      onChange={(e) => setImageScale(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#e60012' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Position Picker Accordion */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                Vị Trí In / Thêu:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {PRINT_POSITIONS.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => {
                      setPosition(pos.id);
                      if (pos.id === 'BACK_CENTER') setViewSide('BACK');
                      else setViewSide('FRONT');
                    }}
                    style={{
                      padding: '8px 6px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      border: position === pos.id ? '2px solid #111' : '1px solid #ddd',
                      backgroundColor: position === pos.id ? '#111' : '#fff',
                      color: position === pos.id ? '#fff' : '#333',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      textAlign: 'center'
                    }}
                  >
                    <div>{pos.name}</div>
                    <div style={{ fontSize: '0.68rem', color: position === pos.id ? '#ffd700' : '#888', marginTop: '2px' }}>
                      +{formatPrice(pos.fee)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ borderTop: '2px solid #111', paddingTop: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Tổng thanh toán hoàn thiện:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#e60012' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-uq btn-uq-red"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '0.95rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={18} />
              <span>THÊM ÁO THIẾT KẾ VÀO GIỎ HÀNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
