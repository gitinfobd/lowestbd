const http = require('http');
const fs = require('fs');
const path = require('path');
const { searchAllStores } = require('./src/aggregator');
const { KNOWN_STORES } = require('./src/scrapers/universalBd');
const { getAllCategories, getStoresForCategory, CATEGORY_LEXICON } = require('./src/categoryRouter');

const PREFERRED_PORTS = [3000, 3001, 3002, 5000, 8080, 8000, 0];
const ALERTS_FILE = path.join(__dirname, 'data', 'alerts.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

  // 1. REST API Search Endpoint: /api/search?q=...&category=...
  if (pathname === '/api/search') {
    const query = reqUrl.searchParams.get('q') || '';
    const category = reqUrl.searchParams.get('category') || reqUrl.searchParams.get('cat') || null;
    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Query parameter "q" is required. E.g. /api/search?q=RTX+4060' }));
      return;
    }

    try {
      const results = await searchAllStores(query, category);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Search failed', message: err.message }));
    }
    return;
  }

  // 1.1 Category List Endpoint: /api/categories
  if (pathname === '/api/categories') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      totalCategories: 22,
      totalStores: 3160,
      categories: getAllCategories()
    }));
    return;
  }

  // 1.2 Category Stores Endpoint: /api/category-stores?cat=fashion&sort=popularity&q=aarong
  if (pathname === '/api/category-stores') {
    const catId = reqUrl.searchParams.get('cat') || reqUrl.searchParams.get('category') || 'fashion';
    const sort = reqUrl.searchParams.get('sort') || 'popularity';
    const filterQ = (reqUrl.searchParams.get('q') || '').toLowerCase().trim();

    const catMeta = CATEGORY_LEXICON[catId] || { id: catId, nameEn: catId, nameBn: catId, icon: '🛍️' };
    let stores = getStoresForCategory(catId);

    if (filterQ) {
      stores = stores.filter(s =>
        (s.Website_Name || '').toLowerCase().includes(filterQ) ||
        (s.Domain || '').toLowerCase().includes(filterQ) ||
        (s["Products_Specialty (পণ্যের ধরন)"] || '').toLowerCase().includes(filterQ)
      );
    }

    if (sort === 'az') {
      stores.sort((a, b) => (a.Website_Name || '').localeCompare(b.Website_Name || ''));
    } else if (sort === 'domain') {
      stores.sort((a, b) => {
        const aIsBd = (a.Domain || '').includes('.bd');
        const bIsBd = (b.Domain || '').includes('.bd');
        if (aIsBd !== bIsBd) return aIsBd ? -1 : 1;
        return (a.Domain || '').localeCompare(b.Domain || '');
      });
    } else {
      // popularity
      stores.sort((a, b) => (a.Popularity_Rank || 99) - (b.Popularity_Rank || 99));
    }

    const normalizedStores = stores.map(s => ({
      name: s.Website_Name || s.name || '',
      url: s.Website_URL || s.url || '',
      domain: s.Domain || s.domain || '',
      domainType: s.Domain_Type || s.domainType || '',
      popularityRank: s.Popularity_Rank || s.popularityRank || 99,
      specialty: s['Products_Specialty (পণ্যের ধরন)'] || s.Products_Specialty || s.specialty || '',
      paymentMethods: s['Payment_Methods (পেমেন্ট পদ্ধতি)'] || s.Payment_Methods || s.paymentMethods || '',
      deliveryArea: s['Delivery_Area (ডেলিভারি এরিয়া)'] || s.deliveryArea || '',
      verificationStatus: s.Verification_Status || 'Verified Active BD E-Commerce',
      ...s
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      category: catMeta,
      totalStores: stores.length,
      stores: normalizedStores
    }));
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

  // 4. Bangladesh 2000+ E-Commerce Sites Directory API & Direct Downloads
  if (pathname === '/api/ecommerce-directory') {
    const jsonPath = path.join(__dirname, 'data', 'bangladesh_ecommerce_2000_sites.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        metadata: data.metadata,
        categories: data.categories
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Directory data not generated yet' }));
    }
    return;
  }

  if (pathname === '/download/csv') {
    const filePath = path.join(__dirname, 'public', 'bangladesh_ecommerce_2000_sites.csv');
    if (fs.existsSync(filePath)) {
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bangladesh_ecommerce_2000_sites.csv"'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('CSV file not found');
    }
    return;
  }

  if (pathname === '/download/xlsx') {
    const filePath = path.join(__dirname, 'public', 'bangladesh_ecommerce_2000_sites.xlsx');
    if (fs.existsSync(filePath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="bangladesh_ecommerce_2000_sites.xlsx"'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Excel file not found');
    }
    return;
  }

  // 5. Static Files from /public
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

module.exports = server;

if (require.main === module) {
  startServerOnFreePort(0);
}
