const { fetchHtml } = require('../src/utils/curlFetcher');

function decodeBingUrl(url) {
  const m = url.match(/[?&]u=a1([A-Za-z0-9+/=_-]+)/);
  if (m) {
    try {
      let b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return Buffer.from(b64, 'base64').toString('utf8');
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function testBingBd() {
  const queries = [
    'Acer Nitro V15 price in bangladesh',
    'Acer Nitro V15 site:area51.com.bd'
  ];

  for (const q of queries) {
    console.log(`\nQuery: ${q}`);
    const html = await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(q)}`);
    if (!html) continue;

    const algos = [...html.matchAll(/<li class="b_algo"[^>]*>([\s\S]*?)<\/li>/gi)];
    console.log(`Found ${algos.length} algos:`);
    for (const a of algos) {
      const linkMatch = a[1].match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      const snippetMatch = a[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (linkMatch) {
        const decoded = decodeBingUrl(linkMatch[1]) || linkMatch[1];
        const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        console.log(`  - Title: ${title}`);
        console.log(`    Decoded: ${decoded}`);
        console.log(`    Snippet: ${snippet.substring(0, 100)}...`);
      }
    }
  }
}

testBingBd();
