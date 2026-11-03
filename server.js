const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { searchAllStores } = require('./src/aggregator');
const { KNOWN_STORES } = require('./src/scrapers/universalBd');

const PREFERRED_PORTS = [3000, 3001, 3002, 5000, 8080, 8000, 0];

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

const server = http.createServer(async (req, res) => {
  // CORS headers for free API access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. REST API Search Endpoint: /api/search?q=...
  if (pathname === '/api/search') {
    const query = parsedUrl.query.q || '';
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

  // 3. Static Files from /public
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
    return;
  }

  const port = PREFERRED_PORTS[index];

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying next port...`);
      startServerOnFreePort(index + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    const boundPort = server.address().port;
    console.log(`====================================================`);
    console.log(`🚀 BD Price Sentinel is running successfully!`);
    console.log(`🌐 Local Web UI: http://localhost:${boundPort}`);
    console.log(`⚡ REST API:     http://localhost:${boundPort}/api/search?q=RTX+4060`);
    console.log(`🔍 Monitored:    300+ BD Tech Stores (StarTech, Ryans, Daraz, TechLand, etc.)`);
    console.log(`====================================================`);
  });
}

// Start the server
if (require.main === module) {
  startServerOnFreePort();
}

module.exports = { server, startServerOnFreePort };
