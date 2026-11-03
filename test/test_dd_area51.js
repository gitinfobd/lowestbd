const { fetchHtml } = require('../src/utils/curlFetcher');

async function testDdArea51() {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:area51.com.bd "Acer Nitro V15"')}`;
  const html = await fetchHtml(url);
  console.log('DDG search length:', html ? html.length : 0);
  const titles = [...(html || '').matchAll(/<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/gi)];
  const snippets = [...(html || '').matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)];
  console.log('Matches found:', titles.length);
  for (let i = 0; i < titles.length; i++) {
    console.log('URL:', titles[i][1]);
    console.log('Title:', titles[i][2].replace(/<[^>]+>/g, '').trim());
    console.log('Snippet:', snippets[i] ? snippets[i][1].replace(/<[^>]+>/g, '').trim() : '');
  }
}

testDdArea51();
