const { fetchHtml } = require('../src/utils/curlFetcher');

(async () => {
  const q = 'Napa Extra price in bangladesh';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const html = await fetchHtml(url);
  console.log('HTML length:', html ? html.length : 0);
  if (html) {
    const titleRegex = /<h2 class="result__title">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/gi;
    const matches = [...html.matchAll(titleRegex)];
    console.log('Found matches:', matches.length);
    for (let m of matches.slice(0, 5)) {
      console.log('Raw href:', m[1]);
      console.log('Title:', m[2].replace(/<[^>]+>/g, ''));
    }
  }
})();
