const { searchAllStores } = require('../src/aggregator');

async function test() {
  console.log('Testing Aggregator with query: "Logitech mouse" ...');
  const t0 = Date.now();
  const res = await searchAllStores('Logitech mouse');
  console.log('Execution Time:', res.executionTimeMs, 'ms');
  console.log('Total Deals Found:', res.totalFound);
  console.log('Stores Scanned:', res.scannedSourcesList.join(', '));
  console.log('Summary:', res.summary);

  console.log('\n=== TOP 3 CHEAPEST / BEST VALUE DEALS ===');
  for (const item of res.top3) {
    console.log(`${item.crown}`);
    console.log(`  Store: [${item.source}] | Price: ৳${item.price.toLocaleString()} | Discount: ${item.discount}% | InStock: ${item.inStock}`);
    console.log(`  Title: ${item.title}`);
    console.log(`  Link: ${item.link}`);
    console.log(`  Offers: ${item.offers.join(', ')}`);
  }
}

test().catch(console.error);
