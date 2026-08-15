import React, { useState, useRef, useEffect } from 'react';
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
  ChevronRight,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Compass,
  CornerDownRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

// Base Apparel Types
const APPAREL_TYPES = [
  {
    id: 'tshirt',
    name: 'Supima Cotton Crew Neck T-Shirt',
    basePrice: 299000,
    frontImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    description: '100% Supima Cotton extra-fine weave, ultra-smooth surface engineered for high-precision printing & embroidery.'
  },
  {
    id: 'polo',
    name: 'AIRism Pique Short Sleeve Polo',
    basePrice: 399000,
    frontImage: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    description: 'Breathable AIRism pique knit with instant cool touch, structured collar ideal for subtle chest embroidery.'
  },
  {
    id: 'hoodie',
    name: 'Heavyweight Fleece Pullover Hoodie',
    basePrice: 549000,
    frontImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    description: 'Relaxed oversized streetwear fit with double-layered hood and brushed fleece interior for superior warmth.'
  },
  {
    id: 'tote',
    name: '12oz Heavy Canvas Utility Tote Bag',
    basePrice: 199000,
    frontImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    backImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    description: 'Durable heavyweight raw cotton canvas with reinforced shoulder straps, customized slogan typography.'
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
  { name: 'Gold Thread', hex: '#D4AF37', border: '#b8941f' },
  { name: 'Pure White', hex: '#FFFFFF', border: '#ddd' },
  { name: 'Stealth Black', hex: '#111111', border: '#000' },
  { name: 'BEO Crimson Red', hex: '#E60012', border: '#b3000e' },
  { name: 'Royal Blue', hex: '#0052CC', border: '#003d99' },
  { name: 'Emerald Moss', hex: '#2E7D32', border: '#1b5e20' },
  { name: 'Silver Thread', hex: '#C0C0C0', border: '#999' }
];

// Typography Fonts
const FONTS = [
  { id: 'sans', name: 'Modern Sans-Serif', fontFamily: "'Inter', sans-serif", style: 'Clean & Minimal' },
  { id: 'serif', name: 'Classic Serif', fontFamily: "'Playfair Display', Georgia, serif", style: 'Luxury & Elegant' },
  { id: 'mono', name: 'Tech Monospace', fontFamily: "'JetBrains Mono', monospace", style: 'Tech & Streetwear' },
  { id: 'bold', name: 'Bold Impact', fontFamily: "'Oswald', Impact, sans-serif", style: 'Bold & Sporty' },
  { id: 'cursive', name: 'Handwritten Script', fontFamily: "'Dancing Script', cursive, serif", style: 'Signature & Chic' }
];

// Position Presets
const POSITION_PRESETS = [
  { id: 'CHEST_LEFT', name: 'Left Chest', x: 38, y: 32, side: 'FRONT', fee: 50000 },
  { id: 'CHEST_CENTER', name: 'Chest Center', x: 50, y: 38, side: 'FRONT', fee: 70000 },
  { id: 'CHEST_RIGHT', name: 'Right Chest', x: 62, y: 32, side: 'FRONT', fee: 50000 },
  { id: 'HEM_BOTTOM', name: 'Bottom Hem', x: 65, y: 72, side: 'FRONT', fee: 50000 },
  { id: 'BACK_CENTER', name: 'Back Big Print', x: 50, y: 35, side: 'BACK', fee: 90000 }
];

// Badges & Embroidery Icons
const EMBROIDERY_ICONS = [
  { id: 'beo-logo', name: 'BEO Crown', icon: '👑' },
  { id: 'heart', name: 'Minimal Heart', icon: '❤️' },
  { id: 'star', name: 'Lucky Star', icon: '⭐' },
  { id: 'sparkle', name: 'Diamond Sparkle', icon: '✨' },
  { id: 'cantho-wave', name: 'Can Tho Waves', icon: '🌊' },
  { id: 'coffee', name: 'Morning Espresso', icon: '☕' },
  { id: 'fire', name: 'Passion Flame', icon: '🔥' },
  { id: 'clover', name: 'Four-Leaf Clover', icon: '🍀' },
  { id: 'cat', name: 'Energy Neko', icon: '🐱' },
  { id: 'smile', name: 'Happy Mood', icon: '😊' },
  { id: 'music', name: 'Chill Vibes', icon: '🎵' },
  { id: 'plane', name: 'Traveler Aero', icon: '✈️' }
];

export const ProductCustomizerStudio = ({ initialProduct, onClose, onNavigate }) => {
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { formatPrice, lang } = useLanguage();

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Studio Selection States
  const [selectedApparel, setSelectedApparel] = useState(APPAREL_TYPES[0]);
  const [selectedColor, setSelectedColor] = useState(BASE_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [viewSide, setViewSide] = useState('FRONT');
  const [activeTab, setActiveTab] = useState('text');

  // Customization Content States
  const [customText, setCustomText] = useState('BEO 2026');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedThread, setSelectedThread] = useState(THREAD_COLORS[3]);
  const [textSize, setTextSize] = useState(20);
  const [selectedBadge, setSelectedBadge] = useState(EMBROIDERY_ICONS[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageScale, setImageScale] = useState(100);
  const [badgeSize, setBadgeSize] = useState(32);

  // Free Dragging & Coordinate Positioning States (Percentages 0-100)
  const [positionConfig, setPositionConfig] = useState({
    frontX: 38,
    frontY: 32,
    backX: 50,
    backY: 35,
    rotation: 0
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Current Coordinates based on View Side
  const currentX = viewSide === 'FRONT' ? positionConfig.frontX : positionConfig.backX;
  const currentY = viewSide === 'FRONT' ? positionConfig.frontY : positionConfig.backY;

  // Custom fee calculation based on placement
  const customFee = viewSide === 'BACK' || (currentX > 40 && currentX < 60 && currentY < 50) ? 70000 : 50000;
  const totalPrice = selectedApparel.basePrice + customFee;

  // Update coordinate helper
  const updateCurrentCoords = (newX, newY) => {
    const clampedX = Math.max(18, Math.min(82, Number(newX.toFixed(1))));
    const clampedY = Math.max(18, Math.min(82, Number(newY.toFixed(1))));

    setPositionConfig((prev) => ({
      ...prev,
      [viewSide === 'FRONT' ? 'frontX' : 'backX']: clampedX,
      [viewSide === 'FRONT' ? 'frontY' : 'backY']: clampedY
    }));
  };

  // Preset Selection
  const applyPreset = (preset) => {
    if (preset.side !== viewSide) {
      setViewSide(preset.side);
    }
    setPositionConfig((prev) => ({
      ...prev,
      [preset.side === 'FRONT' ? 'frontX' : 'backX']: preset.x,
      [preset.side === 'FRONT' ? 'frontY' : 'backY']: preset.y,
      rotation: 0
    }));
  };

  // Nudge Helpers (Move by D-Pad)
  const nudge = (dx, dy) => {
    updateCurrentCoords(currentX + dx, currentY + dy);
  };

  // ================= DRAG & DROP HANDLERS (MOUSE & TOUCH) =================
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging || !canvasRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = canvasRef.current.getBoundingClientRect();
      const xPercent = ((clientX - rect.left) / rect.width) * 100;
      const yPercent = ((clientY - rect.top) / rect.height) * 100;

      updateCurrentCoords(xPercent, yPercent);
    };

    const handleDragEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, viewSide]);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showError(lang === 'vi' ? 'Dung lượng ảnh tối đa 5MB' : 'Max image size is 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setActiveTab('image');
      showSuccess(lang === 'vi' ? 'Đã tải ảnh lên canvas thành công!' : 'Image uploaded to canvas successfully!');
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
      position: `X:${Math.round(currentX)}%, Y:${Math.round(currentY)}% (${viewSide === 'FRONT' ? 'Front' : 'Back'})`,
      text: customText.trim() || null,
      font: selectedFont.name,
      threadColor: selectedThread.name,
      badge: selectedBadge ? selectedBadge.name : null,
      hasUploadedImage: !!uploadedImage
    };

    const customizedProduct = {
      id: 21,
      name: `[Custom Lab] ${selectedApparel.name} - ${customText || 'Customized'}`,
      code: `BEO-CUSTOM-${Date.now().toString().slice(-4)}`,
      primaryImageUrl: selectedApparel.frontImage,
      basePrice: totalPrice,
      salePrice: null,
      customDetails
    };

    const customizedVariant = {
      id: 999,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      totalStock: 99,
      priceAdjustment: customFee
    };

    addToCart(customizedProduct, customizedVariant, 1);
    showSuccess(lang === 'vi' ? `Đã thêm áo thiết kế riêng "${customText || selectedApparel.name}" vào giỏ hàng!` : `Added custom design "${customText || selectedApparel.name}" to cart!`);
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
              {lang === 'vi' ? 'BEO CUSTOM LAB: XƯỞNG THIẾT KẾ & THÊU ÁO CÁ NHÂN HÓA' : 'BEO CUSTOM LAB: INTERACTIVE BESPOKE DESIGN STUDIO'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#aaa' }}>
              {lang === 'vi' ? 'Tự do kéo thả chữ & sticker đến bất kỳ vị trí nào trên áo với độ chính xác cao' : 'Freely position custom text, digital embroidery & photo badges with pixel precision'}
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
        gridTemplateColumns: 'minmax(340px, 1.25fr) minmax(360px, 1fr)',
        gap: '0',
        minHeight: '640px'
      }}>
        {/* ================= LEFT: INTERACTIVE LIVE CANVAS WITH FREE DRAGGING ================= */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          borderRight: '1px solid #e5e5e5',
          userSelect: 'none'
        }}>
          {/* Top Canvas Controls: Front/Back view & Coordinate Pill */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            marginBottom: '10px'
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
                {lang === 'vi' ? 'MẶT TRƯỚC' : 'FRONT VIEW'}
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
                {lang === 'vi' ? 'MẶT SAU (LƯNG)' : 'BACK VIEW'}
              </button>
            </div>

            {/* Coordinate Status Pill */}
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              backgroundColor: isDragging ? '#e60012' : '#111',
              color: '#fff',
              padding: '5px 12px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s ease'
            }}>
              <Move size={12} />
              <span>X: {Math.round(currentX)}% | Y: {Math.round(currentY)}%</span>
            </div>
          </div>

          {/* Interactive Garment Canvas Area */}
          <div
            ref={canvasRef}
            style={{
              position: 'relative',
              width: '380px',
              maxWidth: '100%',
              height: '420px',
              margin: '10px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none'
            }}
          >
            {/* Garment Base Photo */}
            <img
              src={viewSide === 'FRONT' ? selectedApparel.frontImage : selectedApparel.backImage}
              alt="Custom Apparel"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
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

            {/* Crosshair guidelines when actively dragging */}
            {isDragging && (
              <>
                <div style={{
                  position: 'absolute',
                  top: `${currentY}%`,
                  left: 0,
                  right: 0,
                  height: '1px',
                  borderTop: '1px dashed #e60012',
                  opacity: 0.6,
                  pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute',
                  left: `${currentX}%`,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  borderLeft: '1px dashed #e60012',
                  opacity: 0.6,
                  pointerEvents: 'none'
                }} />
              </>
            )}

            {/* FREE DRAGGABLE DESIGN ELEMENT ON CANVAS */}
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              style={{
                position: 'absolute',
                top: `${currentY}%`,
                left: `${currentX}%`,
                transform: `translate(-50%, -50%) rotate(${positionConfig.rotation}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab',
                textAlign: 'center',
                padding: '8px 12px',
                border: isDragging ? '2px solid #e60012' : '1.5px dashed rgba(230,0,18,0.7)',
                borderRadius: '4px',
                backgroundColor: isDragging ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(2px)',
                boxShadow: isDragging ? '0 4px 16px rgba(230,0,18,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
                transition: isDragging ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease',
                zIndex: 20,
                maxWidth: '240px'
              }}
              title={lang === 'vi' ? 'Bấm giữ và kéo chuột để di chuyển tự do!' : 'Click and drag to reposition freely!'}
            >
              {/* Move Handle Top Badge */}
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: isDragging ? '#e60012' : '#111',
                color: '#fff',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '0.65rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}>
                <Move size={10} />
                <span>{lang === 'vi' ? 'KÉO THẢ' : 'DRAG ME'}</span>
              </div>

              {/* Uploaded User Photo if any */}
              {uploadedImage && (
                <div style={{ marginBottom: '4px' }}>
                  <img
                    src={uploadedImage}
                    alt="Uploaded badge"
                    draggable={false}
                    style={{
                      width: `${Math.round(40 * (imageScale / 100))}px`,
                      height: 'auto',
                      borderRadius: '4px',
                      display: 'block',
                      margin: '0 auto',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              )}

              {/* Badge / Sticker Icon */}
              {selectedBadge && !uploadedImage && (
                <div style={{
                  fontSize: `${badgeSize}px`,
                  lineHeight: 1,
                  marginBottom: '4px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  pointerEvents: 'none'
                }}>
                  {selectedBadge.icon}
                </div>
              )}

              {/* Custom Text with chosen Font & Thread color */}
              {customText && (
                <div style={{
                  fontFamily: selectedFont.fontFamily,
                  color: selectedThread.hex,
                  fontSize: `${textSize}px`,
                  fontWeight: '900',
                  letterSpacing: selectedFont.id === 'mono' ? '2px' : '1px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  pointerEvents: 'none'
                }}>
                  {customText}
                </div>
              )}
            </div>
          </div>

          {/* Quick Helper Tip below Canvas */}
          <div style={{
            fontSize: '0.75rem',
            color: '#666',
            backgroundColor: '#ffffff',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px'
          }}>
            <Sparkles size={13} color="#e60012" />
            <span><strong>Tip:</strong> {lang === 'vi' ? 'Bấm và kéo trực tiếp khung chữ/sticker trên áo để đặt vào vị trí ưng ý!' : 'Click and drag text or stickers on the garment canvas to customize position!'}</span>
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
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{lang === 'vi' ? 'GIÁ PHÔI ÁO + CÔNG THÊU IN:' : 'TOTAL (GARMENT + EMBROIDERY):'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#e60012' }}>
                {formatPrice(totalPrice)}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#555' }}>
              <div>{lang === 'vi' ? 'Phôi:' : 'Item:'} <strong>{selectedApparel.name}</strong></div>
              <div>{lang === 'vi' ? 'Màu:' : 'Color:'} <strong>{selectedColor.name}</strong> | Size: <strong>{selectedSize}</strong></div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: STUDIO CONTROLS & TOOLBOX ================= */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          overflowY: 'auto'
        }}>
          <div>
            {/* Toolbox Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              marginBottom: '16px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px'
            }}>
              {[
                { id: 'text', label: lang === 'vi' ? 'Chữ In' : 'Text', icon: <Type size={14} /> },
                { id: 'badge', label: 'Sticker', icon: <Smile size={14} /> },
                { id: 'image', label: lang === 'vi' ? 'Tải Ảnh' : 'Photo', icon: <Upload size={14} /> },
                { id: 'position', label: lang === 'vi' ? 'Vị Trí' : 'Position', icon: <Move size={14} /> },
                { id: 'garment', label: lang === 'vi' ? 'Phôi Áo' : 'Garment', icon: <Layers size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '8px 2px',
                    fontSize: '0.76rem',
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

            {/* ================= TAB: TEXT & TYPOGRAPHY ================= */}
            {activeTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Input Text Box */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Nội Dung Chữ / Tên / Slogan Cá Nhân:' : 'Custom Text / Name / Slogan:'}
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. BEO 2026, TOKYO, CAN THO..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                      fontWeight: '800',
                      border: '2px solid #111',
                      outline: 'none',
                      borderRadius: '2px'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '4px', textAlign: 'right' }}>
                    {customText.length}/30 characters
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Phông Chữ Nghệ Thuật:' : 'Typography & Style:'}
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
                        <div style={{ fontFamily: font.fontFamily, fontWeight: '800', fontSize: '0.88rem' }}>
                          BEO Fashion
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#666' }}>{font.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thread Color Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Màu Chỉ Thêu / Mực In:' : 'Embroidery Thread Color:'} <strong>{selectedThread.name}</strong>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', marginBottom: '4px' }}>
                    <span>{lang === 'vi' ? 'CỠ CHỮ:' : 'FONT SIZE:'} {textSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="44"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#e60012' }}
                  />
                </div>
              </div>
            )}

            {/* ================= TAB: BADGES & ICONS ================= */}
            {activeTab === 'badge' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Chọn Sticker / Biểu Tượng Thêu:' : 'Select Embroidery Badge / Icon:'}
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  {EMBROIDERY_ICONS.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => {
                        setSelectedBadge(badge);
                        setUploadedImage(null);
                      }}
                      style={{
                        padding: '12px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        border: selectedBadge?.id === badge.id && !uploadedImage ? '2px solid #111' : '1px solid #ddd',
                        backgroundColor: selectedBadge?.id === badge.id && !uploadedImage ? '#fafafa' : '#fff',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{badge.icon}</span>
                      <span style={{ fontSize: '0.65rem', color: '#555', textAlign: 'center', lineHeight: 1.1 }}>
                        {badge.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sticker Size Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', marginBottom: '4px' }}>
                    <span>{lang === 'vi' ? 'KÍCH THƯỚC STICKER:' : 'BADGE SIZE:'} {badgeSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="64"
                    value={badgeSize}
                    onChange={(e) => setBadgeSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#e60012' }}
                  />
                </div>
              </div>
            )}

            {/* ================= TAB: IMAGE UPLOAD ================= */}
            {activeTab === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Tải Ảnh / Logo Cá Nhân Của Bạn:' : 'Upload Your Personal Photo / Artwork:'}
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #ccc',
                    padding: '24px 16px',
                    textAlign: 'center',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  <Upload size={28} color="#888" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#111' }}>
                    {lang === 'vi' ? 'Bấm vào đây để chọn ảnh từ máy' : 'Click to select photo from device'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '4px' }}>
                    JPG, PNG, WEBP (Max 5MB)
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
                      <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{lang === 'vi' ? 'Kích thước ảnh:' : 'Photo Scale:'} {imageScale}%</span>
                      <button
                        onClick={() => setUploadedImage(null)}
                        style={{ fontSize: '0.75rem', color: '#e60012', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                      >
                        {lang === 'vi' ? 'Gỡ ảnh' : 'Remove'}
                      </button>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      value={imageScale}
                      onChange={(e) => setImageScale(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#e60012' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB: POSITION & D-PAD CONTROLLER ================= */}
            {activeTab === 'position' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Presets Grid */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Cài Đặt Vị Trí Mẫu Nhanh:' : 'Quick Placement Presets:'}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '6px' }}>
                    {POSITION_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        style={{
                          padding: '8px 6px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          border: '1px solid #ddd',
                          backgroundColor: '#f8f8f8',
                          color: '#111',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          textAlign: 'center'
                        }}
                      >
                        <div>{preset.name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#e60012', marginTop: '2px' }}>
                          +{formatPrice(preset.fee)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* D-Pad Fine Tuning Controls */}
                <div style={{
                  backgroundColor: '#f9f9f9',
                  padding: '14px',
                  border: '1px solid #eee',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Bàn Phím Điều Hướng Căn Chỉnh Tinh Tế:' : 'Precision Directional Controls:'}
                  </div>

                  {/* D-Pad Buttons */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 40px)',
                    gridTemplateRows: 'repeat(3, 40px)',
                    gap: '4px',
                    justifyContent: 'center',
                    marginBottom: '10px'
                  }}>
                    <div />
                    <button
                      onClick={() => nudge(0, -3)}
                      className="btn-uq"
                      style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <div />

                    <button
                      onClick={() => nudge(-3, 0)}
                      className="btn-uq"
                      style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Move Left"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      onClick={() => updateCurrentCoords(50, 38)}
                      className="btn-uq"
                      style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '900' }}
                      title="Center Position"
                    >
                      CENTER
                    </button>
                    <button
                      onClick={() => nudge(3, 0)}
                      className="btn-uq"
                      style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Move Right"
                    >
                      <ArrowRight size={16} />
                    </button>

                    <div />
                    <button
                      onClick={() => nudge(0, 3)}
                      className="btn-uq"
                      style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Move Down"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <div />
                  </div>

                  {/* Rotation Slider */}
                  <div style={{ width: '100%', marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>
                      <span>{lang === 'vi' ? 'XOAY GÓC:' : 'ROTATION ANGLE:'} {positionConfig.rotation}°</span>
                      <button
                        onClick={() => setPositionConfig((p) => ({ ...p, rotation: 0 }))}
                        style={{ background: 'transparent', border: 'none', color: '#e60012', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '700' }}
                      >
                        Reset 0°
                      </button>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={positionConfig.rotation}
                      onChange={(e) => setPositionConfig((p) => ({ ...p, rotation: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#e60012' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB: GARMENT SELECTION ================= */}
            {activeTab === 'garment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Chọn Loại Phôi Trang Phục:' : 'Select Base Garment:'}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {APPAREL_TYPES.map((ap) => (
                      <div
                        key={ap.id}
                        onClick={() => setSelectedApparel(ap)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          border: selectedApparel.id === ap.id ? '2px solid #111' : '1px solid #ddd',
                          backgroundColor: selectedApparel.id === ap.id ? '#fafafa' : '#fff',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.85rem' }}>{ap.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#666' }}>{ap.description.slice(0, 50)}...</div>
                        </div>
                        <div style={{ fontWeight: '800', color: '#e60012', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                          {formatPrice(ap.basePrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Base Color Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Màu Áo:' : 'Garment Color:'} <strong>{selectedColor.name}</strong>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {BASE_COLORS.map((col) => (
                      <div
                        key={col.name}
                        onClick={() => setSelectedColor(col)}
                        style={{
                          width: '32px',
                          height: '32px',
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
                          <Check size={14} color={col.textColor} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {lang === 'vi' ? 'Kích Thước:' : 'Size:'} <strong>{selectedSize}</strong>
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          width: '38px',
                          height: '38px',
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
          </div>

          {/* Action Buttons */}
          <div style={{ borderTop: '2px solid #111', paddingTop: '14px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#666' }}>{lang === 'vi' ? 'Tổng thanh toán hoàn thiện:' : 'Total Price:'}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#e60012' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-uq btn-uq-red"
              style={{
                width: '100%',
                height: '46px',
                fontSize: '0.92rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={18} />
              <span>{lang === 'vi' ? 'THÊM ÁO THIẾT KẾ VÀO GIỎ HÀNG' : 'ADD BESPOKE ITEM TO CART'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
