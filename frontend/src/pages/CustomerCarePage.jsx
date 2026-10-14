import React from 'react';
import { LockKeyhole, RefreshCw, Ruler, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const SIZE_ROWS = [
  ['XS', '78–84', '62–68', '82–88'],
  ['S', '84–90', '68–74', '88–94'],
  ['M', '90–96', '74–80', '94–100'],
  ['L', '96–102', '80–88', '100–106'],
  ['XL', '102–110', '88–96', '106–114'],
  ['XXL', '110–118', '96–104', '114–122']
];

export const CustomerCarePage = ({ section = 'returns' }) => {
  const { lang } = useLanguage();
  const activeSection = ['returns', 'size-guide', 'privacy'].includes(section) ? section : 'returns';

  const tabs = [
    { id: 'returns', label: lang === 'vi' ? 'Đổi trả & bảo hành' : 'Returns & warranty', icon: RefreshCw },
    { id: 'size-guide', label: lang === 'vi' ? 'Bảng kích cỡ' : 'Size guide', icon: Ruler },
    { id: 'privacy', label: lang === 'vi' ? 'Quyền riêng tư' : 'Privacy', icon: LockKeyhole }
  ];

  const navigate = (id) => { window.location.hash = `#/help?section=${id}`; };

  return (
    <div className="container" style={{ padding: '48px 24px 72px', maxWidth: 1060 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: '#e60012', fontSize: '.78rem', fontWeight: 900, letterSpacing: 1.5 }}>BEO CUSTOMER CARE</div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', margin: '8px 0 10px', fontWeight: 900 }}>{lang === 'vi' ? 'Trung tâm hỗ trợ khách hàng' : 'Customer care center'}</h1>
        <p style={{ color: '#666', maxWidth: 700 }}>{lang === 'vi' ? 'Thông tin mua sắm, kích cỡ và cách BEO bảo vệ dữ liệu của bạn.' : 'Shopping policies, sizing information, and how BEO protects your data.'}</p>
      </div>

      <div role="tablist" aria-label="Customer care topics" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 28, paddingBottom: 4 }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={activeSection === id} onClick={() => navigate(id)} className={activeSection === id ? 'btn-beo btn-beo-primary' : 'btn-beo btn-beo-outline-black'} style={{ minHeight: 46, whiteSpace: 'nowrap' }}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>

      {activeSection === 'returns' && (
        <article style={{ border: '1px solid #e5e5e5', padding: 'clamp(22px, 4vw, 42px)', background: '#fff' }}>
          <RefreshCw size={34} color="#e60012" />
          <h2 style={{ margin: '14px 0', fontSize: '1.55rem' }}>{lang === 'vi' ? 'Chính sách đổi trả & bảo hành' : 'Returns & warranty policy'}</h2>
          <p style={{ lineHeight: 1.7 }}>{lang === 'vi' ? 'BEO hỗ trợ đổi sản phẩm trong 30 ngày kể từ ngày nhận hàng. Sản phẩm phải còn tem, chưa qua sử dụng và có hóa đơn hoặc mã đơn hàng.' : 'BEO accepts exchanges within 30 days of delivery. Items must be unworn, retain their tags, and include an invoice or order number.'}</p>
          <ul style={{ margin: '18px 0 0 20px', lineHeight: 1.9 }}>
            <li>{lang === 'vi' ? 'Đổi size hoặc màu miễn phí một lần tại showroom Cần Thơ.' : 'One free size or color exchange at the Can Tho showroom.'}</li>
            <li>{lang === 'vi' ? 'Sản phẩm lỗi kỹ thuật được kiểm tra và đổi mới theo tình trạng thực tế.' : 'Manufacturing defects are inspected and replaced based on their condition.'}</li>
            <li>{lang === 'vi' ? 'Đồ lót, sản phẩm cá nhân hóa và sản phẩm đã chỉnh sửa không áp dụng đổi trả.' : 'Underwear, personalized products, and altered items are excluded.'}</li>
          </ul>
        </article>
      )}

      {activeSection === 'size-guide' && (
        <article style={{ border: '1px solid #e5e5e5', padding: 'clamp(22px, 4vw, 42px)', background: '#fff' }}>
          <Ruler size={34} color="#e60012" />
          <h2 style={{ margin: '14px 0 8px', fontSize: '1.55rem' }}>{lang === 'vi' ? 'Bảng kích cỡ trang phục người lớn' : 'Adult apparel size guide'}</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>{lang === 'vi' ? 'Số đo tính bằng cm. Nếu nằm giữa hai size, chọn size lớn hơn để mặc thoải mái.' : 'Measurements are in centimeters. Choose the larger size for a relaxed fit when between sizes.'}</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead><tr style={{ background: '#111', color: '#fff' }}><th style={{ padding: 13 }}>Size</th><th>{lang === 'vi' ? 'Ngực' : 'Chest'}</th><th>{lang === 'vi' ? 'Eo' : 'Waist'}</th><th>{lang === 'vi' ? 'Hông' : 'Hip'}</th></tr></thead>
              <tbody>{SIZE_ROWS.map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={value} style={{ textAlign: 'center', padding: 13, borderBottom: '1px solid #ddd', fontWeight: index === 0 ? 800 : 400 }}>{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </article>
      )}

      {activeSection === 'privacy' && (
        <article style={{ border: '1px solid #e5e5e5', padding: 'clamp(22px, 4vw, 42px)', background: '#fff' }}>
          <ShieldCheck size={34} color="#e60012" />
          <h2 style={{ margin: '14px 0', fontSize: '1.55rem' }}>{lang === 'vi' ? 'Chính sách quyền riêng tư' : 'Privacy policy'}</h2>
          <p style={{ lineHeight: 1.7 }}>{lang === 'vi' ? 'BEO thu thập thông tin liên hệ, giao hàng và giao dịch để xử lý đơn, chăm sóc khách hàng và cải thiện dịch vụ. Dữ liệu không được bán cho bên thứ ba.' : 'BEO collects contact, shipping, and transaction data to process orders, provide support, and improve service. Personal data is not sold to third parties.'}</p>
          <h3 style={{ margin: '24px 0 8px' }}>{lang === 'vi' ? 'Quyền của bạn' : 'Your rights'}</h3>
          <p style={{ lineHeight: 1.7 }}>{lang === 'vi' ? 'Bạn có thể yêu cầu xem, cập nhật hoặc xóa dữ liệu tài khoản bằng cách liên hệ hotline 1900019199999 hoặc showroom BEO Cần Thơ.' : 'You may request access, correction, or deletion of account data through hotline 1900019199999 or the BEO Can Tho showroom.'}</p>
        </article>
      )}
    </div>
  );
};
