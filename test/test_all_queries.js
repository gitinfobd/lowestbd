const { searchAllStores } = require('../src/aggregator');

async function testAll5() {
  const queries = [
    'Team Elite 8GB DDR5',
    'MSI PRO B650M-B',
    'Lexar NM620 512GB',
    'Ryzen 5 7600',
    'Acer Nitro V15'
  ];

  for (const q of queries) {
    console.log(`\n========================================`);
    console.log(`TESTING SEARCH: "${q}"`);
    console.log(`========================================`);
    const res = await searchAllStores(q);
    console.log(`Execution time: ${res.executionTimeMs}ms`);
    console.log(`Total found: ${res.totalFound}`);
    console.log(`Top 3 Deals:`);
    for (const t of res.top3) {
      console.log(`  [Rank ${t.rank}] ৳${t.price} | Store: ${t.source} | Title: ${t.title}`);
    }
  }
}

testAll5();
