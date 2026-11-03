const { fetchHtml } = require('../src/utils/curlFetcher');

(async () => {
  const q = 'Aarong Panjabi price in bangladesh';
  const html = await fetchHtml(`https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en`);
  if (html) {
    const links = [...html.matchAll(/href="(https:\/\/[^"]+)"/gi)];
    console.log('Total https links in Google HTML:', links.length);
    for (let l of links.slice(0, 15)) {
      if (!l[1].includes('google.com')) {
        console.log('Non-google link:', l[1]);
      }
    }
  }
})();
