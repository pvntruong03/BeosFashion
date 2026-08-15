// ==========================================
// BEO STORE - EXCEL & CSV EXPORTER
// UTF-8 BOM encoding for seamless Microsoft Excel compatibility
// ==========================================

export const exportOrdersToExcel = (orders = []) => {
  if (!orders || orders.length === 0) {
    alert('No order records to export!');
    return;
  }

  const headers = [
    'Order ID',
    'Customer Name',
    'Phone Number',
    'Shipping Address',
    'City / Province',
    'Fulfillment Store',
    'Order Type',
    'Payment Method',
    'Fulfillment Status',
    'Coupon Code',
    'Discount Amount (VND)',
    'Total Amount (VND)',
    'Created At'
  ];

  const rows = orders.map((ord) => [
    `"${ord.orderNumber || ''}"`,
    `"${(ord.customerName || '').replace(/"/g, '""')}"`,
    `"${ord.customerPhone || ''}"`,
    `"${(ord.shippingAddress || '').replace(/"/g, '""')}"`,
    `"${ord.shippingCity || ''}"`,
    `"${ord.storeName || 'BEO Flagship Can Tho'}"`,
    `"${ord.orderType || ''}"`,
    `"${ord.paymentMethod || 'VIETQR'}"`,
    `"${ord.status || ''}"`,
    `"${ord.couponCode || ''}"`,
    ord.discountAmount || 0,
    ord.finalAmount || 0,
    `"${ord.createdAt ? new Date(ord.createdAt).toLocaleString('en-US') : ''}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BEO_Store_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportProductsToExcel = (products = []) => {
  if (!products || products.length === 0) {
    alert('No product records to export!');
    return;
  }

  const headers = [
    'Product Code',
    'Product Name',
    'Category',
    'Collection',
    'Retail Price (VND)',
    'Stock Available',
    'Average Rating',
    'Review Count',
    'Status'
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
    p.active ? 'Active' : 'Inactive'
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BEO_Store_Products_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
