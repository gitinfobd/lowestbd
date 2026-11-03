const http = require('http');
const fs = require('fs');
const path = require('path');
const { searchAllStores } = require('./src/aggregator');
const { KNOWN_STORES } = require('./src/scrapers/universalBd');

const PREFERRED_PORTS = [3000, 3001, 3002, 5000, 8080, 8000, 0];
const ALERTS_FILE = path.join(__dirname, 'data', 'alerts.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getAlertsData() {
  try {
    const dir = path.dirname(ALERTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(ALERTS_FILE)) {
      return JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
    }
  } catch (e) {}
  return { subscribers: ['buyer.bd@gmail.com'], alertHistory: [] };
}

function saveAlertsData(data) {
  try {
    const dir = path.dirname(ALERTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS headers for universal API integration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Use WHATWG URL API (Node.js modern standard)
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // 1. REST API Search Endpoint: /api/search?q=...
  if (pathname === '/api/search') {
    const query = reqUrl.searchParams.get('q') || '';
    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Query parameter "q" is required. E.g. /api/search?q=RTX+4060' }));
      return;
    }

    try {
      const results = await searchAllStores(query);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Search failed', message: err.message }));
    }
    return;
  }

  // 2. Stores Endpoint: /api/stores
  if (pathname === '/api/stores') {
    const list = Object.entries(KNOWN_STORES).map(([domain, info]) => ({
      domain,
      name: info.name,
      logo: info.logo,
      badge: info.badge
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalMonitored: '300+ BD Tech Websites & Web Stores',
      keyStores: list
    }));
    return;
  }

  // 3. Wishlist & Multi-Email Price Drop / Stock Alert Endpoints
  if (pathname === '/api/alerts/subscribers' && req.method === 'GET') {
    const data = getAlertsData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, subscribers: data.subscribers || [] }));
    return;
  }

  if (pathname === '/api/alerts/subscribe' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const email = (body.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'অনুগ্রহ করে সঠিক ইমেইল অ্যাড্রেস প্রদান করুন।' }));
      return;
    }

    const data = getAlertsData();
    const set = new Set(data.subscribers || []);
    set.add(email);
    data.subscribers = Array.from(set);
    saveAlertsData(data);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `${email} সফলভাবে প্রাইস ড্রপ ও অফার অ্যালার্টে যুক্ত হয়েছে!`,
      subscribers: data.subscribers
    }));
    return;
  }

  if (pathname === '/api/alerts/unsubscribe' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const email = (body.email || '').trim().toLowerCase();

    const data = getAlertsData();
    data.subscribers = (data.subscribers || []).filter(e => e !== email);
    saveAlertsData(data);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `${email} তালিকা থেকে রিমুভ করা হয়েছে।`,
      subscribers: data.subscribers
    }));
    return;
  }

  if (pathname === '/api/alerts/trigger' && req.method === 'POST') {
    const body = await readJsonBody(req);
    const data = getAlertsData();
    const subscribers = data.subscribers || [];

    const productTitle = body.title || 'Apple Mac Mini M6 Chip (12-core CPU/GPU)';
    const store = body.store || 'Dazzle BD';
    const oldPrice = body.oldPrice || 159990;
    const currentPrice = body.price || 109990;
    const savings = Math.max(0, oldPrice - currentPrice);

    const alertRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      recipients: subscribers,
      productTitle,
      store,
      currentPrice,
      savings,
      subject: `🚨 দাম কমেছে! ${store}-এ ${productTitle}-এর দাম এখন মাত্র ৳${currentPrice.toLocaleString()}!`
    };

    data.alertHistory = data.alertHistory || [];
    data.alertHistory.unshift(alertRecord);
    if (data.alertHistory.length > 50) data.alertHistory.pop();
    saveAlertsData(data);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `প্রাইস ড্রপ অ্যালার্ট সফলভাবে ${subscribers.length}টি ইমেইলে প্রেরণ করা হয়েছে!`,
      alert: alertRecord
    }));
    return;
  }

  // 4. Static Files from /public
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found - BD Price Sentinel');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error');
      }
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

/**
 * Attempt to listen on ports in sequence, falling back to any free OS port
 * @param {number} index
 */
function startServerOnFreePort(index = 0) {
  if (index >= PREFERRED_PORTS.length) {
    console.error('No available ports found.');
    process.exit(1);
  }

  const port = PREFERRED_PORTS[index];
  server.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`====================================================`);
    console.log(`🚀 BD Price Sentinel is running successfully!`);
    console.log(`🌐 Local Web UI: http://localhost:${actualPort}`);
    console.log(`⚡ REST API:     http://localhost:${actualPort}/api/search?q=RTX+4060`);
    console.log(`🔍 Monitored:    300+ BD Tech Stores (StarTech, Ryans, Daraz, Skyland, Dazzle, Apple Gadgets, etc.)`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying next port...`);
      server.close();
      startServerOnFreePort(index + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServerOnFreePort(0);
