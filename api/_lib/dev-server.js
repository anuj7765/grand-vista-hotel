const http = require('http');
const { URL } = require('url');

const routes = {
  'GET /api': require('../index.js'),
  'POST /api/create-order': require('../create-order.js'),
  'POST /api/verify-payment': require('../verify-payment.js'),
  'GET /api/bookings': require('../bookings.js'),
  'POST /api/bookings': require('../bookings.js'),
  'POST /api/contact': require('../contact.js'),
  'POST /api/auth/login': require('../auth/login.js'),
  'POST /api/auth/register': require('../auth/register.js'),
  'GET /api/auth/me': require('../auth/me.js'),
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/\/+$/, '') || '/api';
  const key = `${req.method} ${path}`;

  const handler = routes[key];

  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  req.body = await parseBody(req);
  req.query = Object.fromEntries(url.searchParams);

  res.json = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const mockRes = {
    status: (code) => ({
      json: (data) => res.json(code, data),
    }),
    json: (data) => res.json(200, data),
  };

  try {
    await handler(req, mockRes);
  } catch (err) {
    console.error(err);
    res.json(500, { error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
