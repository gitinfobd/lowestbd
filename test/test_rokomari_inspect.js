const { fetchHtml } = require('../src/utils/curlFetcher');

(async () => {
  const html = await fetchHtml('https://www.rokomari.com/search?term=Humayun+Ahmed');
  if (html) {
    const idx = html.indexOf('/book/1196');
    console.log(html.substring(idx + 2500, idx + 3300));
  }
})();
