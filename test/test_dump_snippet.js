const { fetchHtml } = require('../src/utils/curlFetcher');

async function dumpSnippet() {
  const q = 'Nitro';
  const tlHtml = await fetchHtml(`https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(q)}`, { timeout: 8000 });
  if (tlHtml) {
    const idx = tlHtml.indexOf('Nitro');
    console.log('TechLand indexOf Nitro:', idx);
    if (idx !== -1) {
      console.log('Snippet around Nitro:');
      console.log(tlHtml.substring(idx - 200, idx + 400));
    }
  }

  const itHtml = await fetchHtml(`https://itstore.com.bd/?s=${encodeURIComponent(q)}&post_type=product`, { timeout: 8000 });
  if (itHtml) {
    const idx = itHtml.indexOf('Nitro');
    console.log('IT Store indexOf Nitro:', idx);
    if (idx !== -1) {
      console.log('Snippet around Nitro in IT Store:');
      console.log(itHtml.substring(idx - 200, idx + 400));
    }
  }
}

dumpSnippet();
