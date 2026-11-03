const { classifyCategory, getStoresForCategory } = require('../src/categoryRouter');
const { scrapeCategoryStores } = require('../src/scrapers/categoryDispatcher');

async function testQuery(q) {
  console.log(`\n========================================`);
  console.log(`Testing Query: "${q}"`);
  const cat = classifyCategory(q);
  console.log(`Detected: ${cat.icon} [${cat.nameBn}] (${cat.nameEn}) - Confidence: ${cat.confidence}`);
  
  const stores = getStoresForCategory(cat.id);
  console.log(`Available Category Stores in Database: ${stores.length}`);
  
  const items = await scrapeCategoryStores(q, cat);
  console.log(`Discovered Live Products: ${items.length}`);
  if (items.length > 0) {
    items.slice(0, 3).forEach((item, idx) => {
      console.log(`  [#${idx + 1}] ${item.source} -> ${item.title} (Price: ${item.priceDisplay}) [${item.link}]`);
    });
  }
}

(async () => {
  await testQuery('Aarong Panjabi');
  await testQuery('Napa Extra');
  await testQuery('Humayun Ahmed Boi');
  await testQuery('Hatil Dining Table');
})();
