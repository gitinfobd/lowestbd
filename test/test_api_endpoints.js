const http = require('http');

function fetchApi(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Parse error', raw: data.substring(0, 200) });
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  console.log('--- 1. Testing /api/categories ---');
  const catData = await fetchApi('http://localhost:3000/api/categories');
  console.log('Categories Count:', catData.totalCategories, 'Total Stores:', catData.totalStores);

  console.log('\n--- 2. Testing Fashion Search: "Aarong Panjabi" ---');
  const fashionData = await fetchApi('http://localhost:3000/api/search?q=Aarong+Panjabi');
  console.log('Category:', fashionData.category?.nameBn, '| Scanned Stores:', fashionData.categoryStoresCount);
  console.log('Total Found:', fashionData.totalFound, '| Top 3 Count:', fashionData.top3?.length);
  if (fashionData.top3?.length > 0) {
    fashionData.top3.forEach((t, i) => console.log(`  #${i+1} [${t.source}] ${t.title} -> ৳${t.price} (${t.link})`));
  }

  console.log('\n--- 3. Testing Books Search: "Humayun Ahmed" ---');
  const bookData = await fetchApi('http://localhost:3000/api/search?q=Humayun+Ahmed');
  console.log('Category:', bookData.category?.nameBn, '| Scanned Stores:', bookData.categoryStoresCount);
  console.log('Total Found:', bookData.totalFound, '| Top 3 Count:', bookData.top3?.length);
  if (bookData.top3?.length > 0) {
    bookData.top3.forEach((t, i) => console.log(`  #${i+1} [${t.source}] ${t.title} -> ৳${t.price} (${t.link})`));
  }

  console.log('\n--- 4. Testing Tech Search: "Acer Nitro V15" ---');
  const techData = await fetchApi('http://localhost:3000/api/search?q=Acer+Nitro+V15');
  console.log('Category:', techData.category?.nameBn, '| Scanned Stores:', techData.categoryStoresCount);
  console.log('Total Found:', techData.totalFound, '| Top 3 Count:', techData.top3?.length);
  if (techData.top3?.length > 0) {
    techData.top3.forEach((t, i) => console.log(`  #${i+1} [${t.source}] ${t.title} -> ৳${t.price} (${t.link})`));
  }
})();
