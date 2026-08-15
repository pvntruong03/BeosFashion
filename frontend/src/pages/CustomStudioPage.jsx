import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Scissors,
  Truck
} from 'lucide-react';
import { ProductCustomizerStudio } from '../components/ProductCustomizerStudio';
import { useLanguage } from '../contexts/LanguageContext';

export const CustomStudioPage = ({ onNavigate }) => {
  const { lang } = useLanguage();

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Studio Banner Hero */}
      <div style={{
        backgroundColor: '#111111',
        color: '#ffffff',
        padding: '48px 24px',
        textAlign: 'center',
        borderBottom: '2px solid #e60012'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(230,0,18,0.2)',
            color: '#ff6b6b',
            padding: '6px 14px',
            borderRadius: '2px',
            fontSize: '0.8rem',
            fontWeight: '800',
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} color="#ffd700" />
            <span>{lang === 'vi' ? 'BEO CUSTOM LAB • DỊCH VỤ CÁ NHÂN HÓA CAO CẤP' : 'BEO CUSTOM LAB • BESPOKE EMBROIDERY & PRINTING'}</span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '900',
            letterSpacing: '1px',
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            {lang === 'vi' ? 'TỰ TAY THIẾT KẾ & THÊU TÊN LÊN TRANG PHỤC CỦA BẠN' : 'PERSONALIZE & EMBROIDER YOUR APPAREL'}
          </h1>

          <p style={{
            fontSize: '0.95rem',
            color: '#ccc',
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto 24px auto'
          }}>
            {lang === 'vi'
              ? 'Biến chiếc áo thun, áo polo hay túi canvas thành tác phẩm độc nhất vô nhị mang dấu ấn riêng của bạn. Công nghệ thêu vi tính Nhật Bản độ nét cao, giặt máy bền đẹp không phai màu.'
              : 'Transform essential tees, polo shirts, or canvas bags into one-of-a-kind statement pieces. High-precision Japanese digital embroidery and screen printing, engineered for everyday durability.'}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '0.85rem',
            color: '#ddd'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#00875a" />
              <span>{lang === 'vi' ? 'Chỉ thêu bền màu 100%' : 'Colorfast Thread Guarantee'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scissors size={16} color="#ffd700" />
              <span>{lang === 'vi' ? 'Gia công tỉ mỉ tại Cần Thơ' : 'Handcrafted in Can Tho'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="#0052cc" />
              <span>{lang === 'vi' ? 'Giao hàng chỉ sau 24-48h' : 'Dispatched in 24-48 Hours'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Container */}
      <div className="container" style={{ marginTop: '-24px', padding: '0 20px', maxWidth: '1200px' }}>
        <ProductCustomizerStudio onNavigate={onNavigate} />
      </div>

      {/* 3 Steps Process Explanation */}
      <div className="container" style={{ maxWidth: '1100px', marginTop: '60px', padding: '0 20px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.4rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          marginBottom: '32px'
        }}>
          {lang === 'vi' ? 'QUY TRÌNH CÁ NHÂN HÓA 3 BƯỚC ĐƠN GIẢN' : '3-STEP CUSTOMIZATION PROCESS'}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {[
            {
              step: '01',
              title: lang === 'vi' ? 'CHỌN PHÔI ÁO & MÀU SẮC' : 'SELECT GARMENT & COLOR',
              desc: lang === 'vi' ? 'Lựa chọn phôi áo thun Cotton Supima, áo Polo AIRism mát lạnh hoặc áo Hoodie nỉ bông cao cấp.' : 'Choose from Supima Cotton Crew Neck Tees, cooling AIRism Polos, or heavyweight Fleece Hoodies.'
            },
            {
              step: '02',
              title: lang === 'vi' ? 'SÁNG TẠO THIẾT KẾ CỦA BẠN' : 'CREATE YOUR UNIQUE DESIGN',
              desc: lang === 'vi' ? 'Gõ tên, slogan, chọn font chữ nghệ thuật, màu chỉ thêu hoặc tải lên hình ảnh kỷ niệm của bạn.' : 'Type custom names, slogans, select typography & thread colors, or upload memorable photos.'
            },
            {
              step: '03',
              title: lang === 'vi' ? 'XƯỞNG BEO GIA CÔNG & GIAO TẬN TAY' : 'CRAFTED & DELIVERED TO YOU',
              desc: lang === 'vi' ? 'Kỹ thuật viên xưởng thêu BEO căn chỉnh vi tính tỉ mỉ và đóng hộp sang trọng giao đến bạn.' : 'Our master tailors calibrate computer embroidery machines and package in luxury gift boxes.'
            }
          ].map((item) => (
            <div
              key={item.step}
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                border: '1px solid #e5e5e5',
                borderRadius: '2px',
                position: 'relative'
              }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#e60012',
                marginBottom: '8px',
                fontFamily: 'monospace'
              }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
