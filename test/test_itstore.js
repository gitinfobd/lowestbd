const { fetchHtml } = require('../src/utils/curlFetcher');

async function dumpItStore() {
  const itHtml = await fetchHtml(`https://itstore.com.bd/?s=Nitro&post_type=product`, { timeout: 8000 });
  if (itHtml) {
    const secondIdx = itHtml.indexOf('Nitro', 1000);
    console.log('Second indexOf Nitro:', secondIdx);
    if (secondIdx !== -1) {
      console.log(itHtml.substring(secondIdx - 100, secondIdx + 500));
    }
  }
}

dumpItStore();
