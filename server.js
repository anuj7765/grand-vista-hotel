const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const ROOT = __dirname;

// Load env
try {
  const envFile = fs.readFileSync(path.join(ROOT, '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

// API handlers
const routes = {};
function loadRoute(method, urlPath, handler) {
  routes[`${method} ${urlPath.replace(/\/+$/, '') || '/api'}`] = handler;
}

loadRoute('GET', '/api', require('./api/__init__.js'));
loadRoute('POST', '/api/create-order', require('./api/create-order.js'));
loadRoute('POST', '/api/verify-payment', require('./api/verify-payment.js'));
loadRoute('GET', '/api/bookings', require('./api/bookings.js'));
loadRoute('POST', '/api/bookings', require('./api/bookings.js'));
loadRoute('POST', '/api/contact', require('./api/contact.js'));

function parseBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  // API routes
  const key = `${req.method} ${pathname}`;
  const handler = routes[key];
  if (handler) {
    req.body = await parseBody(req);
    req.query = Object.fromEntries(url.searchParams);
    const sr = {
      status: c => ({ json: d => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(d)); } }),
      json: d => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(d)); },
    };
    try { await handler(req, sr); } catch (e) { console.error(e); res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Internal server error' })); }
    return;
  }

  // Static files
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);

  if (!ext) {
    const tryIndex = path.join(filePath, 'index.html');
    if (fs.existsSync(tryIndex)) filePath = tryIndex;
  }

  const mime = MIME[path.extname(filePath)] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n  The Grand Vista - Local Server`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Frontend: http://localhost:${PORT}`);
  console.log(`  API:      http://localhost:${PORT}/api\n`);
});
