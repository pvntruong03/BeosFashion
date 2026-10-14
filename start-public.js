const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.clear();
console.log('\x1b[36m%s\x1b[0m', '=============================================================');
console.log('\x1b[32m%s\x1b[0m', ' 🚀 BEO MODERN FASHION - PUBLIC INTERNET TUNNEL LAUNCHER 🚀');
console.log('\x1b[36m%s\x1b[0m', '=============================================================');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

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

async function startPublic() {
  // 1. Check Backend
  const isBackendUp = await checkPort(8080);
  if (isBackendUp) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Backend is running on http://localhost:8080');
  } else {
    console.log('\x1b[34m%s\x1b[0m', '🚀 Launching Spring Boot Backend (:8080)...');
    const mvnwCmd = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
    spawn(mvnwCmd, ['spring-boot:run'], {
      cwd: backendDir,
      shell: true,
      stdio: 'ignore'
    });
  }

  // 2. Launch Frontend
  console.log('\x1b[35m%s\x1b[0m', '🎨 Launching Vite Frontend (:5173)...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  spawn(npmCmd, ['run', 'dev'], {
    cwd: frontendDir,
    shell: true,
    stdio: 'ignore'
  });

  // 3. Launch Tunnel
  console.log('\x1b[33m%s\x1b[0m', '🌐 Connecting to global internet tunnel to generate public HTTPS link...\n');

  const randomSub = 'beo-store-' + Math.random().toString(36).substring(2, 7);
  const tunnelProc = spawn('npx', ['-y', 'localtunnel', '--port', '5173', '--subdomain', randomSub], {
    shell: true
  });

  tunnelProc.stdout.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/https:\/\/[^\s]+/);
    if (match) {
      const publicUrl = match[0];
      console.log('\x1b[32m%s\x1b[0m', '=============================================================');
      console.log('\x1b[32m%s\x1b[0m', ' 🎉 YOUR BEO FASHION PUBLIC LINK IS READY:');
      console.log('\x1b[33m%s\x1b[0m', ` 👉 ${publicUrl}`);
      console.log('\x1b[32m%s\x1b[0m', '=============================================================');
      console.log(' 📱 Share the link above or open on mobile to explore.');
      console.log(' 💡 Keep this terminal window open to maintain live connection (Ctrl+C to stop).\n');

      const openCmd = process.platform === 'win32' ? 'start' : 'open';
      spawn(openCmd, [publicUrl], { shell: true });
    }
  });

  tunnelProc.stderr.on('data', (data) => {
    // ignore non-fatal warnings
  });
}

startPublic();
