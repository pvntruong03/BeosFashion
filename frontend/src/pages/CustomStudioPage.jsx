import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Scissors,
  Truck
} from 'lucide-react';
import { ProductCustomizerStudio } from '../components/ProductCustomizerStudio';

export const CustomStudioPage = ({ onNavigate }) => {
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
            <span>BEO CUSTOM LAB • DỊCH VỤ CÁ NHÂN HÓA CAO CẤP</span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '900',
            letterSpacing: '1px',
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            TỰ TAY THIẾT KẾ & THÊU TÊN LÊN TRANG PHỤC CỦA BẠN
          </h1>

          <p style={{
            fontSize: '0.95rem',
            color: '#ccc',
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto 24px auto'
          }}>
            Biến chiếc áo thun, áo polo hay túi canvas thành tác phẩm độc nhất vô nhị mang dấu ấn riêng của bạn. Công nghệ thêu vi tính Nhật Bản độ nét cao, giặt máy bền đẹp không phai màu.
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
              <span>Chỉ thêu bền màu 100%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scissors size={16} color="#ffd700" />
              <span>Gia công tỉ mỉ tại Cần Thơ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="#0052cc" />
              <span>Giao hàng chỉ sau 24-48h</span>
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
          QUY TRÌNH CÁ NHÂN HÓA 3 BƯỚC ĐƠN GIẢN
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {[
            {
              step: '01',
              title: 'CHỌN PHÔI ÁO & MÀU SẮC',
              desc: 'Lựa chọn phôi áo thun Cotton Supima, áo Polo AIRism mát lạnh hoặc áo Hoodie nỉ bông cao cấp.'
            },
            {
              step: '02',
              title: 'SÁNG TẠO THIẾT KẾ CỦA BẠN',
              desc: 'Gõ tên, slogan, chọn font chữ nghệ thuật, màu chỉ thêu hoặc tải lên hình ảnh kỷ niệm của bạn.'
            },
            {
              step: '03',
              title: 'XƯỞNG BEO GIA CÔNG & GIAO TẬN TAY',
              desc: 'Kỹ thuật viên xưởng thêu BEO căn chỉnh vi tính tỉ mỉ và đóng hộp sang trọng giao đến bạn.'
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
