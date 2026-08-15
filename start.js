const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.clear();
console.log('\x1b[36m%s\x1b[0m', '=============================================================');
console.log('\x1b[32m%s\x1b[0m', ' ✨ BEO MODERN FASHION - ONE-CLICK FULLSTACK LAUNCHER ✨');
console.log('\x1b[36m%s\x1b[0m', '=============================================================');
console.log(' 🌐 Storefront:       \x1b[33mhttp://localhost:5173\x1b[0m');
console.log(' 🛡️  Admin CMS:        \x1b[33mhttp://localhost:5173/#/admin\x1b[0m (admin@uniqlo.com / admin123)');
console.log(' 🏪 Store Manager POS:\x1b[33mhttp://localhost:5173/#/staff\x1b[0m (manager.cantho@uniqlo.com / staff123)');
console.log(' 🔌 Backend API:      \x1b[33mhttp://localhost:8080\x1b[0m (Swagger: /swagger-ui.html)');
console.log('\x1b[36m%s\x1b[0m', '=============================================================\n');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// 1. Check if backend is already running
function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/categories`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function start() {
  const isBackendUp = await checkPort(8080);

  if (isBackendUp) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Backend is already running on http://localhost:8080');
  } else {
    console.log('\x1b[34m%s\x1b[0m', '🚀 Launching Spring Boot Backend (:8080)...');
    const mvnwCmd = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
    const backendProc = spawn(mvnwCmd, ['spring-boot:run'], {
      cwd: backendDir,
      shell: true,
      stdio: 'inherit'
    });

    backendProc.on('error', (err) => {
      console.error('Failed to start backend:', err);
    });
  }

  console.log('\x1b[35m%s\x1b[0m', '🎨 Launching Vite Frontend (:5173)...\n');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const frontendProc = spawn(npmCmd, ['run', 'dev'], {
    cwd: frontendDir,
    shell: true,
    stdio: 'inherit'
  });

  frontendProc.on('error', (err) => {
    console.error('Failed to start frontend:', err);
  });

  // Open browser after 3 seconds
  setTimeout(() => {
    const openCmd = process.platform === 'win32' ? 'start' : 'open';
    spawn(openCmd, ['http://localhost:5173'], { shell: true });
  }, 3000);
}

start();
