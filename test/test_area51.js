const { fetchHtml } = require('../src/utils/curlFetcher');

async function testArea51() {
  const q = 'Acer Nitro V15';
  const url = `https://area51.com.bd/?s=${encodeURIComponent(q)}&post_type=product`;
  console.log('Fetching:', url);
  const html = await fetchHtml(url, { timeout: 10000 });
  console.log('HTML length:', html ? html.length : 0);
  if (!html) return;

  // Check title or products
  const productCardRegex = /<li[^>]*class="[^"]*product[^"]*"[\s\S]*?<\/li>/gi;
  const cards = html.match(productCardRegex) || [];
  console.log('Product cards found:', cards.length);

  for (const card of cards.slice(0, 5)) {
    const titleMatch = card.match(/<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i)
      || card.match(/<a[^>]+href="([^"]+)"[^>]*title="([^"]+)"/i)
      || card.match(/<h[23][^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const linkMatch = card.match(/<a[^>]+href="([^"]+)"/i);
    const priceMatch = card.match(/<span[^>]*class="[^"]*woocommerce-Price-amount amount[^"]*"[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/i)
      || card.match(/<span[^>]*class="price"[^>]*>([\s\S]*?)<\/span>/i);
    const imgMatch = card.match(/<img[^>]+src="([^"]+)"/i);

    console.log('Card:');
    console.log('  Link:', linkMatch ? linkMatch[1] : 'N/A');
    console.log('  Title:', titleMatch ? (titleMatch[2] || titleMatch[1]).replace(/<[^>]+>/g, '').trim() : 'N/A');
    console.log('  Price:', priceMatch ? priceMatch[1].replace(/<[^>]+>/g, '').trim() : 'N/A');
  }
}

testArea51();
