const { fetchHtml } = require('../src/utils/curlFetcher');

async function testFetchDd() {
  const q = 'Acer Nitro V15 price in bangladesh';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const html = await fetchHtml(url, { timeout: 8000 });
  console.log('HTML length:', html ? html.length : 0);
  if (!html) return;
  console.log('Snippet of html:', html.substring(0, 500));

  const titleRegex = /<h2 class="result__title">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/gi;
  const titles = [...html.matchAll(titleRegex)];
  console.log('Title regex matches count:', titles.length);

  // Check alternative regex for DuckDuckGo
  const links = [...html.matchAll(/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  console.log('Links with result__a count:', links.length);
}

testFetchDd();
