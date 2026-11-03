const { fetchHtml } = require('../src/utils/curlFetcher');

(async () => {
  const html = await fetchHtml('https://www.pickaboo.com/search/result/?q=walton');
  if (html) {
    const hrefs = [...html.matchAll(/href="([^"]+)"/gi)];
    console.log('Pickaboo total hrefs:', hrefs.length);
    for (let h of hrefs.slice(20, 35)) {
      console.log('href:', h[1]);
    }
  }
})();
