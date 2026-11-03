const { fetchHtml } = require('../src/utils/curlFetcher');

async function testGoogle() {
  const q = 'Acer Nitro V15 price in bangladesh site:area51.com.bd OR site:computermania.com.bd OR site:techlandbd.com';
  const html = await fetchHtml(`https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  console.log('Google search length:', html ? html.length : 0);
  if (html) {
    const titles = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
    console.log('Google h3 count:', titles.length);
    for (const t of titles.slice(0, 5)) {
      console.log('  Google title:', t[1].replace(/<[^>]+>/g, '').trim());
    }
  }
}

testGoogle();
