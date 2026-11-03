const { fetchHtml } = require('../src/utils/curlFetcher');

async function checkBingAlgo() {
  const q = 'Acer Nitro V15 price in bangladesh';
  const html = await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(q)}`);
  if (html) {
    const algos = [...html.matchAll(/<li class="b_algo"[^>]*>([\s\S]*?)<\/li>/gi)];
    for (const a of algos.slice(0, 5)) {
      const linkMatch = a[1].match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      const snippetMatch = a[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (linkMatch) {
        console.log('Bing Link:', linkMatch[1]);
        console.log('Bing Title:', linkMatch[2].replace(/<[^>]+>/g, '').trim());
        console.log('Bing Snippet:', snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '');
        console.log('---');
      }
    }
  }
}

checkBingAlgo();
