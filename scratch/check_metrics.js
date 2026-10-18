const http = require('http');

async function verifyRealData() {
  const loginRes = await new Promise(r => {
    const req = http.request('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => r(JSON.parse(d)));
    });
    req.write(JSON.stringify({ email: 'admin@beofashion.vn', password: 'admin123' }));
    req.end();
  });

  const token = loginRes?.data?.token;
  console.log('Admin Token Auth Success:', !!token);

  const getWithAuth = (path) => new Promise(r => {
    http.get('http://localhost:8080' + path, {
      headers: { 'Authorization': 'Bearer ' + token }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => r(JSON.parse(d)));
    });
  });

  const stats = await getWithAuth('/api/admin/stats');
  console.log('\n================ ADMIN DASHBOARD METRICS ================');
  console.log('Total Revenue:           ', Number(stats?.data?.totalRevenue).toLocaleString('vi-VN') + ' đ');
  console.log('Total Orders:            ', stats?.data?.totalOrders);
  console.log('Total Customers / Users: ', stats?.data?.totalCustomers);
  console.log('Total Products:          ', stats?.data?.totalProducts);
  console.log('Pending Orders:          ', stats?.data?.pendingOrdersCount);
  console.log('Low Stock Items Alert:   ', stats?.data?.lowStockItemsCount);

  console.log('\n--- 7-Day Revenue Trend ---');
  stats?.data?.revenueLast7Days?.forEach(d => {
    console.log(`  📅 Ngày ${d.date}: ${Number(d.revenue).toLocaleString('vi-VN').padStart(14, ' ')} đ | ${d.orderCount} đơn`);
  });

  console.log('\n--- Top 5 Best Selling Products ---');
  stats?.data?.topSellingProducts?.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.code}] ${p.name.padEnd(45, ' ')} | Đã bán: ${String(p.totalSold).padStart(3, ' ')} sp | Doanh thu: ${Number(p.totalRevenue).toLocaleString('vi-VN')} đ`);
  });

  const staffReport = await getWithAuth('/api/staff/reports/daily');
  console.log('\n============ SHOWROOM CAN THO POS DAILY REPORT ============');
  console.log('Showroom:                ', staffReport?.data?.storeName);
  console.log('Today Revenue:           ', Number(staffReport?.data?.todayRevenue).toLocaleString('vi-VN') + ' đ');
  console.log('Total Orders Today:      ', staffReport?.data?.totalOrdersToday);
  console.log('POS In-Store Orders:     ', staffReport?.data?.posOrdersCount);
  console.log('Online Fulfillment Today:', staffReport?.data?.onlineFulfillmentCount);
  console.log('Pending Pickups:         ', staffReport?.data?.pendingPickupOrders);
}

verifyRealData();
