const { fetchHtml } = require('../src/utils/curlFetcher');

(async () => {
  const data = await fetchHtml('https://www.arogga.com/api/v1/search?query=Napa');
  const json = JSON.parse(data);
  console.log('Arogga success status:', json.status);
  console.log('Keys:', Object.keys(json));
  const products = json.data || [];
  console.log('Total products returned:', products.length);
  for (let p of products.slice(0, 3)) {
    console.log(`- Name: ${p.name || p.pv_name || p.brand_name} | Price: ৳${p.price || p.pv_price} | Link: https://www.arogga.com/product/${p.pv_id || p.id}`);
  }
})();
