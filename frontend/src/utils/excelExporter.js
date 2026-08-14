// ==========================================
// BEO MODERN FASHION - EXCEL & CSV EXPORTER
// Chuẩn UTF-8 BOM hiển thị tiếng Việt hoàn hảo trên Microsoft Excel
// ==========================================

export const exportOrdersToExcel = (orders = []) => {
  if (!orders || orders.length === 0) {
    alert('Không có dữ liệu đơn hàng để xuất!');
    return;
  }

  const headers = [
    'Mã Đơn Hàng',
    'Khách Hàng',
    'Số Điện Thoại',
    'Địa Chỉ Giao Hàng',
    'Tỉnh / Thành Phố',
    'Chi Nhánh Tiếp Nhận',
    'Loại Đơn',
    'Phương Thức Thanh Toán',
    'Trạng Thái Đơn',
    'Mã Khuyến Mãi',
    'Giảm Giá (VND)',
    'Tổng Tiền Đơn Hàng (VND)',
    'Thời Gian Tạo'
  ];

  const rows = orders.map((ord) => [
    `"${ord.orderNumber || ''}"`,
    `"${(ord.customerName || '').replace(/"/g, '""')}"`,
    `"${ord.customerPhone || ''}"`,
    `"${(ord.shippingAddress || '').replace(/"/g, '""')}"`,
    `"${ord.shippingCity || ''}"`,
    `"${ord.storeName || 'BEO Flagship Cần Thơ'}"`,
    `"${ord.orderType || ''}"`,
    `"${ord.paymentMethod || 'VIETQR'}"`,
    `"${ord.status || ''}"`,
    `"${ord.couponCode || ''}"`,
    ord.discountAmount || 0,
    ord.finalAmount || 0,
    `"${ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : ''}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BEO_Fashion_DanhSachDonHang_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportProductsToExcel = (products = []) => {
  if (!products || products.length === 0) {
    alert('Không có dữ liệu sản phẩm để xuất!');
    return;
  }

  const headers = [
    'Mã Sản Phẩm',
    'Tên Sản Phẩm',
    'Danh Mục',
    'Bộ Sưu Tập',
    'Giá Gốc (VND)',
    'Số Lượng Tồn Kho',
    'Đánh Giá TB (Sao)',
    'Số Lượt Đánh Giá',
    'Trạng Thái Bán'
  ];

  const rows = products.map((p) => [
    `"BEO-${String(p.id).padStart(6, '0')}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${p.categoryName || ''}"`,
    `"${p.collection || ''}"`,
    p.basePrice || 0,
    p.totalStock !== undefined ? p.totalStock : 100,
    p.averageRating || 5.0,
    p.reviewCount || 0,
    p.active ? 'Đang kinh doanh' : 'Tạm dừng'
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BEO_Fashion_DanhSachSanPham_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
