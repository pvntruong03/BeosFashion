import http from 'node:http';

const base = process.env.BEO_API_BASE ?? 'http://127.0.0.1:8080';
let passed = 0;
let failed = 0;

function request(path, method = 'GET') {
  const url = new URL(path, base);
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

function check(name, condition, evidence) {
  if (condition) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name}: ${evidence}`);
  }
}

const catalog = await request('/api/products?sizePerPage=1000');
const products = JSON.parse(catalog.body).data.content;
check('catalog endpoint returns active inventory', catalog.status === 200 && products.length >= 70, `status=${catalog.status}, count=${products.length}`);

const mismatched = products.filter((product) =>
  (product.categorySlug === 'men' && product.gender !== 'MEN') ||
  (product.categorySlug.startsWith('women') && product.gender !== 'WOMEN') ||
  (product.categorySlug === 'accessories' && product.gender !== 'UNISEX'),
);
check('catalog gender matches category', mismatched.length === 0, `${mismatched.length} mismatches: ${mismatched.map((p) => p.id).join(', ')}`);

const kids = await request('/api/products/search?q=kids');
check('no children products are searchable', JSON.parse(kids.body).data.length === 0, `matches=${JSON.parse(kids.body).data.length}`);

const protectedEndpoints = [
  '/api/admin/dashboard/stats',
  '/api/staff/orders',
  '/api/orders/my-orders',
  '/api/wishlist',
];
for (const path of protectedEndpoints) {
  const result = await request(path);
  check(`${path} rejects anonymous access`, result.status === 401, `status=${result.status}`);
}

const paymentConfig = await request('/api/payments/vietqr/config');
check('bank configuration is not public', paymentConfig.status === 401 || paymentConfig.status === 403, `status=${paymentConfig.status}`);

const transferConfirmation = await request('/api/payments/vietqr/confirm-transfer', 'POST');
check('bank transfer confirmation is not public', transferConfirmation.status === 401 || transferConfirmation.status === 403, `status=${transferConfirmation.status}`);

const malformedLogin = await request('/api/auth/login', 'POST');
check('malformed login is rejected', malformedLogin.status >= 400 && malformedLogin.status < 500, `status=${malformedLogin.status}`);

console.log(`SUMMARY passed=${passed} failed=${failed}`);
process.exitCode = failed === 0 ? 0 : 1;
