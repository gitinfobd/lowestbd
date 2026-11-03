const { fetchHtml } = require('../src/utils/curlFetcher');

async function inspectStoreMarkup() {
  const q = 'Nitro V15';

  // 1. TechLand
  const tlHtml = await fetchHtml(`https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(q)}`, { timeout: 8000 });
  if (tlHtml) {
    const titles = [...tlHtml.matchAll(/<div class="name">[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a>/gi)];
    const prices = [...tlHtml.matchAll(/<span class="price-new">([\s\S]*?)<\/span>/gi)];
    console.log('TechLand products:', titles.length, 'Prices:', prices.length);
    for (let i = 0; i < Math.min(3, titles.length); i++) {
      console.log('  TL:', titles[i][2].replace(/<[^>]+>/g, '').trim(), '-->', prices[i] ? prices[i][1].trim() : 'N/A', '|', titles[i][1]);
    }
  }

  // 2. IT Store BD
  const itHtml = await fetchHtml(`https://itstore.com.bd/?s=${encodeURIComponent(q)}&post_type=product`, { timeout: 8000 });
  if (itHtml) {
    const itTitles = [...itHtml.matchAll(/<h[23][^>]*class="[^"]*product[^"]*"[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a>/gi)]
      || [...itHtml.matchAll(/<a[^>]+class="woocommerce-LoopProduct-link[^"]*"[^>]+href="([^"]+)">[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    console.log('IT Store titles:', itTitles.length);
  }

  // 3. Potaka IT
  const potakaHtml = await fetchHtml(`https://potakait.com/?s=${encodeURIComponent(q)}&post_type=product`, { timeout: 8000 });
  if (potakaHtml) {
    const pTitles = [...potakaHtml.matchAll(/<h[23][^>]*class="[^"]*product[^"]*"[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a>/gi)];
    console.log('Potaka IT titles:', pTitles.length);
  }
}

inspectStoreMarkup();
