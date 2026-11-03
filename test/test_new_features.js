const { searchAllStores } = require('../src/aggregator');

async function run() {
  console.log('--- TEST 1: DIRECT URL ---');
  const res1 = await searchAllStores('https://area51.com.bd/acer-nitro-v15-anv15-rtx-4060-gaming-laptop/');
  console.log('Distilled Query:', res1.distilledQuery);
  console.log('Inspected Product:', res1.inspectedProduct);
  console.log('Total Found:', res1.totalFound);
  console.log('Top 3:');
  res1.top3.forEach(t => console.log(' ', t.crown, t.source, '৳' + t.price.toLocaleString(), t.title.substring(0, 50)));

  console.log('\n--- TEST 2: FULL DETAILED TITLE ---');
  const fullTitle = 'Acer Nitro V15 ANV15 15.6” FHD 144Hz Display 2024 Model ( R7-7735HS, 16GB RAM, 1TB SSD, RTX4060 8GB )';
  const res2 = await searchAllStores(fullTitle);
  console.log('Distilled Query:', res2.distilledQuery);
  console.log('Total Found:', res2.totalFound);
  console.log('Top 3:');
  res2.top3.forEach(t => console.log(' ', t.crown, t.source, '৳' + t.price.toLocaleString(), t.title.substring(0, 50)));
}

run().catch(console.error);
