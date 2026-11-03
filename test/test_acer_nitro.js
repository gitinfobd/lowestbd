const { searchAllStores } = require('../src/aggregator');

async function testAcerNitro() {
  console.log('Testing searchAllStores("Acer Nitro V15")...');
  const res = await searchAllStores('Acer Nitro V15');
  console.log('Total Found:', res.totalFound);
  console.log('Execution Time:', res.executionTimeMs, 'ms');
  console.log('Top 3:');
  for (const t of res.top3) {
    console.log(`  [${t.crown}] ${t.source} - ৳${t.price.toLocaleString()} (${t.title})`);
    console.log(`    Link: ${t.link} | Active: ${t.isLinkActive} | Status: ${t.linkStatus}`);
  }
  console.log('\nAll deals sources:');
  for (const d of res.allDeals) {
    console.log(`  - ${d.source}: ৳${d.price.toLocaleString()} | ${d.title.substring(0, 50)}... | Link: ${d.link}`);
  }
}

testAcerNitro();
