const { fetchHtml } = require('../src/utils/curlFetcher');

(async () => {
  const q = 'Aarong Panjabi price in bangladesh';
  const html = await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(q)}`);
  console.log('Bing HTML length:', html ? html.length : 0);
  if (html) {
    const titleRegex = /<h2><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/gi;
    const matches = [...html.matchAll(titleRegex)];
    console.log('Matches count:', matches.length);
    for (let m of matches.slice(0, 5)) {
      console.log('Link:', m[1]);
      console.log('Title:', m[2].replace(/<[^>]+>/g, '').trim());
    }
  }
})();
