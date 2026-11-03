const { fetchHtml } = require('../src/utils/curlFetcher');

async function testDdWithReferer() {
  const q = 'Acer Nitro V15 area51';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const html = await fetchHtml(url, {
    headers: {
      'Referer': 'https://duckduckgo.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1'
    }
  });
  console.log('DDG with referer length:', html ? html.length : 0);
  const titles = [...(html || '').matchAll(/<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/gi)];
  console.log('DDG with referer titles:', titles.length);
  for (const t of titles.slice(0, 3)) {
    console.log('  ', t[1], '-->', t[2].replace(/<[^>]+>/g, '').trim());
  }
}

testDdWithReferer();
