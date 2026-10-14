import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CalendarDays, Download, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#2563eb',
  PACKING: '#7c3aed',
  SHIPPING: '#0891b2',
  DELIVERED: '#16a34a',
  COMPLETED: '#15803d'
};

const isRecognizedRevenueOrder = (order) => {
  if (['CANCELLED', 'RETURNED'].includes(order.status)) return false;
  return order.payment?.paymentStatus === 'SUCCESS' || ['DELIVERED', 'COMPLETED'].includes(order.status);
};

const revenueTimestamp = (order) => order.payment?.paymentTime || order.createdAt;

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RevenueAnalyticsPanel = ({ orders = [], stats }) => {
  const { formatPrice, lang } = useLanguage();
  const { showSuccess, showError } = useToast();
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 29);
    return toIsoDate(date);
  }, [today]);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(toIsoDate(today));
  const [exporting, setExporting] = useState('');

  const filteredOrders = useMemo(() => {
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59.999`) : null;
    return orders.filter((order) => {
      const timestamp = revenueTimestamp(order);
      if (!isRecognizedRevenueOrder(order) || !timestamp) return false;
      const recognizedAt = new Date(timestamp);
      return (!start || recognizedAt >= start) && (!end || recognizedAt <= end);
    });
  }, [orders, from, to]);

  const dailyData = useMemo(() => {
    const grouped = new Map();
    filteredOrders.forEach((order) => {
      const key = String(revenueTimestamp(order)).slice(0, 10);
      const current = grouped.get(key) || { date: key, revenue: 0, orders: 0 };
      current.revenue += Number(order.finalAmount || 0);
      current.orders += 1;
      grouped.set(key, current);
    });
    return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  const statusData = useMemo(() => {
    const grouped = new Map();
    filteredOrders.forEach((order) => grouped.set(order.status, (grouped.get(order.status) || 0) + 1));
    return [...grouped.entries()].map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.finalAmount || 0), 0);
  const averageOrderValue = filteredOrders.length ? Math.round(totalRevenue / filteredOrders.length) : 0;
  const bestDay = dailyData.reduce((best, day) => day.revenue > (best?.revenue || 0) ? day : best, null);

  const downloadReport = async (type) => {
    setExporting(type);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const blob = await api.get(`/admin/reports/revenue.${type}?${params.toString()}`, { responseType: 'blob' });
      const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `BEO_Revenue_${from || 'all'}_${to || 'today'}.${type}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showSuccess(type === 'xlsx'
        ? (lang === 'vi' ? 'Đã xuất báo cáo Excel thành công.' : 'Excel report exported successfully.')
        : (lang === 'vi' ? 'Đã xuất báo cáo PDF thành công.' : 'PDF report exported successfully.'));
    } catch (error) {
      showError(error.message || (lang === 'vi' ? 'Không thể xuất báo cáo.' : 'Unable to export report.'));
    } finally {
      setExporting('');
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#111', color: '#fff', padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b73', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em' }}>
            <TrendingUp size={16} /> BEO BUSINESS INTELLIGENCE
          </div>
          <h2 style={{ margin: '6px 0 4px', fontSize: '1.35rem' }}>{lang === 'vi' ? 'Báo cáo doanh thu chuyên sâu' : 'Advanced Revenue Analytics'}</h2>
          <p style={{ margin: 0, color: '#bbb', fontSize: '0.84rem' }}>
            {lang === 'vi' ? 'Lọc theo thời gian, phân tích xu hướng và xuất báo cáo quản trị.' : 'Filter by date, inspect trends, and export management reports.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => downloadReport('xlsx')} disabled={!!exporting} className="btn-beo" style={{ background: '#16803a', color: '#fff', minHeight: '44px', padding: '0 15px', display: 'flex', gap: '7px', alignItems: 'center' }}>
            <FileSpreadsheet size={17} /> {exporting === 'xlsx' ? 'Exporting...' : 'Excel (.xlsx)'}
          </button>
          <button onClick={() => downloadReport('pdf')} disabled={!!exporting} className="btn-beo btn-beo-red" style={{ minHeight: '44px', padding: '0 15px', display: 'flex', gap: '7px', alignItems: 'center' }}>
            <FileText size={17} /> {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '16px', display: 'flex', alignItems: 'end', gap: '14px', flexWrap: 'wrap' }}>
        <CalendarDays size={22} color="#e60012" style={{ marginBottom: '8px' }} />
        <label style={{ fontSize: '0.78rem', fontWeight: 800 }}>
          {lang === 'vi' ? 'TỪ NGÀY' : 'FROM'}
          <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} style={{ display: 'block', minHeight: '44px', marginTop: '5px', padding: '0 10px', border: '1px solid #bbb' }} />
        </label>
        <label style={{ fontSize: '0.78rem', fontWeight: 800 }}>
          {lang === 'vi' ? 'ĐẾN NGÀY' : 'TO'}
          <input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} style={{ display: 'block', minHeight: '44px', marginTop: '5px', padding: '0 10px', border: '1px solid #bbb' }} />
        </label>
        <button onClick={() => { setFrom(defaultFrom); setTo(toIsoDate(today)); }} className="btn-beo btn-beo-outline-black" style={{ minHeight: '44px' }}>
          {lang === 'vi' ? '30 ngày gần nhất' : 'Last 30 days'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        {[
          [lang === 'vi' ? 'Doanh thu kỳ chọn' : 'Selected revenue', formatPrice(totalRevenue), '#e60012'],
          [lang === 'vi' ? 'Đơn đã ghi nhận' : 'Recognized orders', filteredOrders.length, '#111'],
          [lang === 'vi' ? 'Giá trị đơn trung bình' : 'Average order value', formatPrice(averageOrderValue), '#2563eb'],
          [lang === 'vi' ? 'Ngày doanh thu cao nhất' : 'Best revenue day', bestDay ? `${bestDay.date} • ${formatPrice(bestDay.revenue)}` : '—', '#16803a']
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e1e1e1', padding: '18px' }}>
            <div style={{ color: '#777', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ color, fontSize: '1.35rem', fontWeight: 900, marginTop: '6px' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '18px' }} className="revenue-report-grid">
        <div style={{ background: '#fff', border: '1px solid #ddd', padding: '18px', minHeight: '390px' }}>
          <div style={{ fontWeight: 850, marginBottom: '16px' }}>{lang === 'vi' ? 'Xu hướng doanh thu và số đơn' : 'Revenue and order trend'}</div>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={dailyData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="revenue" tickFormatter={(value) => `${Math.round(value / 1000000)}M`} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="orders" orientation="right" allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => name === 'revenue' ? formatPrice(value) : value} />
              <Legend />
              <Bar yAxisId="revenue" dataKey="revenue" name={lang === 'vi' ? 'Doanh thu' : 'Revenue'} fill="#e60012" radius={[3, 3, 0, 0]} />
              <Line yAxisId="orders" type="monotone" dataKey="orders" name={lang === 'vi' ? 'Số đơn' : 'Orders'} stroke="#111" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', border: '1px solid #ddd', padding: '18px', minHeight: '390px' }}>
          <div style={{ fontWeight: 850, marginBottom: '8px' }}>{lang === 'vi' ? 'Cơ cấu trạng thái đơn' : 'Order status distribution'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={2}>
                {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#64748b'} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', fontSize: '0.78rem', color: '#666' }}>
            <Download size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
            {lang === 'vi' ? 'Excel gồm 3 sheet: Tổng quan, theo ngày và chi tiết đơn.' : 'Excel includes Summary, Daily Revenue, and Orders sheets.'}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
          <thead><tr style={{ background: '#111', color: '#fff' }}>
            {[lang === 'vi' ? 'Ngày' : 'Date', lang === 'vi' ? 'Số đơn' : 'Orders', lang === 'vi' ? 'Doanh thu' : 'Revenue', lang === 'vi' ? 'Giá trị TB/đơn' : 'Average/order'].map((header) => <th key={header} style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem' }}>{header}</th>)}
          </tr></thead>
          <tbody>
            {dailyData.slice().reverse().map((day) => <tr key={day.date} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '11px 12px', fontWeight: 700 }}>{day.date}</td>
              <td style={{ padding: '11px 12px' }}>{day.orders}</td>
              <td style={{ padding: '11px 12px', color: '#e60012', fontWeight: 800 }}>{formatPrice(day.revenue)}</td>
              <td style={{ padding: '11px 12px' }}>{formatPrice(Math.round(day.revenue / day.orders))}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#777' }}>
        {lang === 'vi'
          ? `Dữ liệu hệ thống: ${stats?.paidOrdersCount ?? 0} đơn đã ghi nhận doanh thu. Đơn hủy, hoàn trả và chưa thanh toán không được tính.`
          : `System data: ${stats?.paidOrdersCount ?? 0} revenue-recognized orders. Cancelled, returned, and unpaid orders are excluded.`}
      </div>
    </section>
  );
};
