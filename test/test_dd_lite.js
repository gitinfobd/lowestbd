const { fetchHtml } = require('../src/utils/curlFetcher');

async function testDdLite() {
  const q = 'Acer Nitro V15 price in bangladesh';
  const url = 'https://lite.duckduckgo.com/lite/';
  const html = await fetchHtml(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    },
    body: `q=${encodeURIComponent(q)}`
  });
  console.log('Lite DDG HTML length:', html ? html.length : 0);
  if (html) {
    const titles = [...html.matchAll(/<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    console.log('Lite matches:', titles.length);
    for (const t of titles.slice(0, 5)) {
      console.log('  URL:', t[1]);
      console.log('  Title:', t[2].replace(/<[^>]+>/g, '').trim());
    }
  }
}

testDdLite();
