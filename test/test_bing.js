const { fetchHtml } = require('../src/utils/curlFetcher');

async function testBingMarkup() {
  const q = 'Acer Nitro V15 price in bangladesh';
  const html = await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(q)}`);
  if (html) {
    const idx = html.indexOf('b_algo');
    console.log('Bing b_algo index:', idx);
    const matches = [...html.matchAll(/<li class="b_algo"[\s\S]*?<h2><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>[\s\S]*?<div class="b_caption">[\s\S]*?<p>([\s\S]*?)<\/p>/gi)];
    console.log('Matches with b_algo:', matches.length);
    if (matches.length === 0) {
      // Find what links are inside b_algo
      const algos = [...html.matchAll(/<li class="b_algo"[\s\S]*?<\/li>/gi)];
      console.log('Algos found:', algos.length);
      if (algos.length > 0) {
        console.log('First algo:', algos[0][0].substring(0, 500));
      }
    } else {
      for (const m of matches.slice(0, 5)) {
        console.log('Bing match:', m[1], '|', m[2].replace(/<[^>]+>/g, '').trim());
      }
    }
  }
}

testBingMarkup();
