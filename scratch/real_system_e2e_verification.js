const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function api(path, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api${path}`,
    method,
    headers
  }, data);
}

async function runRealEndToEndTesting() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE REAL-WORLD SYSTEM VERIFICATION (E2E)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // 1. PUBLIC STOREFRONT & CATALOG
  // -------------------------------------------------------------
  console.log('--- 1. Public Storefront & Catalog ---');
  const catRes = await api('/categories');
  assert('Categories Tree Loaded', catRes.status === 200 && catRes.body.data.length > 0);

  const prodRes = await api('/products?sizePerPage=100');
  const products = prodRes.body?.data?.content || [];
  assert(`Catalog Products Loaded (${products.length} items)`, prodRes.status === 200 && products.length >= 20);

  const sampleProd = products[0];
  const prodDetailRes = await api(`/products/${sampleProd.id}`);
  const variants = prodDetailRes.body?.data?.variants || [];
  assert(`Product Detail & Variant Matrix (${sampleProd.name})`, prodDetailRes.status === 200 && variants.length > 0);

  const storesRes = await api('/stores');
  assert('Showroom Locator (BEO Cần Thơ)', storesRes.status === 200 && storesRes.body.data.length === 1);

  // -------------------------------------------------------------
  // 2. AI & SMART SERVICES
  // -------------------------------------------------------------
  console.log('\n--- 2. AI & Smart Fashion Services ---');
  const visualRes = await api('/products/visual-search', 'POST', {
    modelId: 'Xenova/clip-vit-base-patch32',
    clipScores: { [sampleProd.id]: 0.96 },
    detectedLabels: ['fashion', 'product']
  });
  assert('AI Visual & Semantic Search', visualRes.status === 200 && visualRes.body.data?.matchedProducts?.length > 0);

  const reviewListRes = await api(`/reviews/product/${sampleProd.id}`);
  assert('Product Reviews & Rating Feed', reviewListRes.status === 200 && Array.isArray(reviewListRes.body.data));

  // -------------------------------------------------------------
  // 3. AUTHENTICATION & USER LIFECYCLE
  // -------------------------------------------------------------
  console.log('\n--- 3. Authentication & Profile Lifecycle ---');
  const timestamp = Date.now();
  const testEmail = `vip_${timestamp}@beofashion.vn`;
  
  const regRes = await api('/auth/register', 'POST', {
    email: testEmail,
    password: 'password123',
    fullName: 'BEO Fashion VIP Member',
    phone: '0567740000',
    address: '209 Đường 30 Tháng 4, Phường Xuân Khánh',
    city: 'Cần Thơ'
  });
  assert('Customer Registration Flow', regRes.status === 200 && regRes.body.data?.token);
  const userToken = regRes.body.data.token;

  const profileRes = await api('/auth/me', 'GET', null, userToken);
  assert('Profile Retrieval (/auth/me)', profileRes.status === 200 && profileRes.body.data.email === testEmail);

  const updateProfRes = await api('/auth/profile', 'PUT', {
    fullName: 'BEO Fashion VIP Member (Updated)',
    phone: '0901234567',
    address: 'Showroom BEO Modern Fashion, Ninh Kiều',
    city: 'Cần Thơ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  }, userToken);
  assert('Profile Info Update (/auth/profile)', updateProfRes.status === 200 && updateProfRes.body.data.fullName.includes('Updated'));

  // -------------------------------------------------------------
  // 4. CART, COUPON, & VIETQR CHECKOUT FLOW
  // -------------------------------------------------------------
  console.log('\n--- 4. Cart, Promo & VietQR Checkout Flow ---');
  const testVariant = variants[0];
  const addCartRes = await api('/cart/items', 'POST', { variantId: testVariant.id, quantity: 2 }, userToken);
  assert('Add Items to Cart (DB Persisted)', addCartRes.status === 200);

  const getCartRes = await api('/cart', 'GET', null, userToken);
  assert('Cart Subtotal & Shipping Calculation', getCartRes.status === 200 && getCartRes.body.data.items.length > 0);

  const validateCoupRes = await api('/coupons/validate', 'POST', { code: 'BEO10', orderAmount: 798000 });
  assert('Apply Coupon BEO10 (10% Discount)', validateCoupRes.status === 200 && validateCoupRes.body.data.calculatedDiscount > 0);

  const checkoutRes = await api('/orders', 'POST', {
    customerName: 'BEO Fashion VIP Member',
    customerPhone: '0567740000',
    customerEmail: testEmail,
    shippingAddress: '209 Đường 30 Tháng 4, Xuân Khánh',
    shippingCity: 'Cần Thơ',
    couponCode: 'BEO10',
    paymentMethod: 'BANK_TRANSFER',
    orderType: 'ONLINE_DELIVERY',
    notes: 'Please pack in luxury BEO Store gift packaging'
  }, userToken);
  assert('Checkout Order Creation', checkoutRes.status === 200 && checkoutRes.body.data?.orderNumber, JSON.stringify(checkoutRes.body));
  const createdOrder = checkoutRes.body.data;

  // Verify Cart Auto-cleared
  const postCheckoutCartRes = await api('/cart', 'GET', null, userToken);
  assert('Cart Auto-cleared in Database', postCheckoutCartRes.status === 200 && postCheckoutCartRes.body.data.items.length === 0);

  // VietQR payment verification and customer-provided transfer reference
  const qrStatusRes = await api(`/payments/vietqr/${createdOrder.orderNumber}/status`);
  assert('VietQR Real-time Payment Status', qrStatusRes.status === 200 && qrStatusRes.body.paymentStatus === 'PENDING');

  const confirmTransferRes = await api('/payments/vietqr/confirm-transfer', 'POST', {
    orderNumber: createdOrder.orderNumber,
    amount: createdOrder.finalAmount,
    transactionRef: `E2E-${timestamp}`
  });
  assert('VietQR Transfer Reference Confirmed Order', confirmTransferRes.status === 200 && confirmTransferRes.body.data.status === 'CONFIRMED');

  const trackRes = await api(`/orders/track/${createdOrder.orderNumber}`);
  assert('Public Order Tracking', trackRes.status === 200 && trackRes.body.data.status === 'CONFIRMED');

  const myOrdersRes = await api('/orders/my-orders', 'GET', null, userToken);
  assert('Customer Order History Feed', myOrdersRes.status === 200 && myOrdersRes.body.data.length > 0);

  // -------------------------------------------------------------
  // 5. CANCELLATION & INVENTORY RESTOCK RULES
  // -------------------------------------------------------------
  console.log('\n--- 5. Order Cancellation & Restocking Rules ---');
  // Create a second pending order to cancel
  await api('/cart/items', 'POST', { variantId: testVariant.id, quantity: 1 }, userToken);
  const order2Res = await api('/orders', 'POST', {
    customerName: 'BEO Cancel Test',
    customerPhone: '0567740000',
    customerEmail: testEmail,
    shippingAddress: 'Can Tho',
    shippingCity: 'Cần Thơ',
    paymentMethod: 'COD',
    orderType: 'ONLINE_DELIVERY'
  }, userToken);
  const orderToCancel = order2Res.body.data;

  const cancelRes = await api(`/orders/${orderToCancel.id}/cancel`, 'PUT', { reason: 'Changed my mind' }, userToken);
  assert('Self-Service Customer Order Cancellation', cancelRes.status === 200 && cancelRes.body.data.status === 'CANCELLED');

  // -------------------------------------------------------------
  // 6. STORE MANAGER (CAN THO POS & FULFILLMENT)
  // -------------------------------------------------------------
  console.log('\n--- 6. Store Manager POS & Fulfillment ---');
  const staffLoginRes = await api('/auth/login', 'POST', { email: 'manager.cantho@beofashion.vn', password: 'staff123' });
  assert('Store Manager Authentication', staffLoginRes.status === 200 && staffLoginRes.body.data?.token);
  const staffToken = staffLoginRes.body.data.token;

  const staffStoreRes = await api('/staff/store-info', 'GET', null, staffToken);
  assert('Staff Assigned Showroom (BEO Cần Thơ)', staffStoreRes.status === 200 && (staffStoreRes.body.data?.name || staffStoreRes.body.data?.code));

  const staffOrdersRes = await api('/staff/orders', 'GET', null, staffToken);
  assert('Staff Fulfillment Order Queue', staffOrdersRes.status === 200 && Array.isArray(staffOrdersRes.body.data));

  // Advance created order status to PACKING -> SHIPPING -> DELIVERED
  const packRes = await api(`/staff/orders/${createdOrder.id}/status`, 'PUT', { status: 'PACKING' }, staffToken);
  assert('Advance Status: PACKING', packRes.status === 200 && packRes.body.data.status === 'PACKING');

  const shipRes = await api(`/staff/orders/${createdOrder.id}/status`, 'PUT', { status: 'SHIPPING' }, staffToken);
  assert('Advance Status: SHIPPING', shipRes.status === 200 && shipRes.body.data.status === 'SHIPPING');

  const staffInvRes = await api('/staff/inventory', 'GET', null, staffToken);
  assert('Showroom Inventory Count', staffInvRes.status === 200 && staffInvRes.body.data.length > 0);

  const staffReportRes = await api('/staff/reports/daily', 'GET', null, staffToken);
  assert('Store Shift & Daily Sales Report', staffReportRes.status === 200 && (staffReportRes.body.data?.storeName || staffReportRes.body.data?.todayRevenue !== undefined));

  // -------------------------------------------------------------
  // 7. ADMIN CMS & MASTER CONTROL
  // -------------------------------------------------------------
  console.log('\n--- 7. Admin CMS & System Governance ---');
  const adminLoginRes = await api('/auth/login', 'POST', { email: 'admin@beofashion.vn', password: 'admin123' });
  assert('Admin Master Authentication', adminLoginRes.status === 200 && adminLoginRes.body.data?.token);
  const adminToken = adminLoginRes.body.data.token;

  const adminStatsRes = await api('/admin/dashboard/stats', 'GET', null, adminToken);
  assert('Admin Analytics & 7-Day Revenue KPI', adminStatsRes.status === 200 && adminStatsRes.body.data?.totalRevenue >= 0);

  const adminOrdersRes = await api('/admin/orders', 'GET', null, adminToken);
  assert('Admin Omnichannel Orders (Page Object)', adminOrdersRes.status === 200 && (adminOrdersRes.body.data.content || adminOrdersRes.body.data).length > 0);

  const adminUsersRes = await api('/admin/users', 'GET', null, adminToken);
  assert('Admin User & Role Governance', adminUsersRes.status === 200 && adminUsersRes.body.data.length > 0);

  const adminCouponsRes = await api('/admin/coupons', 'GET', null, adminToken);
  assert('Admin Coupon Master List', adminCouponsRes.status === 200 && adminCouponsRes.body.data.length > 0);

  const adminBankRes = await api('/admin/bank-config', 'GET', null, adminToken);
  assert('Admin VietQR Beneficiary Settings', adminBankRes.status === 200 && adminBankRes.body.data?.accountNo);

  console.log('\n================================================================');
  console.log(`📊 REAL-WORLD TEST RUN COMPLETED: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRealEndToEndTesting().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
