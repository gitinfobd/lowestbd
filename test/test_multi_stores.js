const { fetchHtml } = require('../src/utils/curlFetcher');

async function testStores() {
  const q = 'Nitro V15';
  
  // 1. Computer Mania
  console.log('Testing Computer Mania...');
  const cmHtml = await fetchHtml(`https://computermania.com.bd/?s=${encodeURIComponent(q)}&post_type=product`, { timeout: 8000 });
  console.log('  Computer Mania length:', cmHtml ? cmHtml.length : 0);
  if (cmHtml && !cmHtml.includes('Just a moment')) {
    const products = cmHtml.match(/class="[^"]*product[^"]*"[\s\S]*?<\/div>/gi) || [];
    console.log('  CM products found:', products.length);
  }

  // 2. Techland
  console.log('Testing TechLand...');
  const tlHtml = await fetchHtml(`https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(q)}`, { timeout: 8000 });
  console.log('  TechLand length:', tlHtml ? tlHtml.length : 0);
  if (tlHtml && !tlHtml.includes('Just a moment')) {
    const tlProducts = tlHtml.match(/class="product-thumb[\s\S]*?<\/div>/gi) || [];
    console.log('  TL products found:', tlProducts.length);
  }

  // 3. IT Store BD
  console.log('Testing IT Store BD...');
  const itHtml = await fetchHtml(`https://itstore.com.bd/?s=${encodeURIComponent(q)}&post_type=product`, { timeout: 8000 });
  console.log('  IT Store length:', itHtml ? itHtml.length : 0);

  // 4. Potaka IT
  console.log('Testing Potaka IT...');
  const potakaHtml = await fetchHtml(`https://potakait.com/?s=${encodeURIComponent(q)}&post_type=product`, { timeout: 8000 });
  console.log('  Potaka IT length:', potakaHtml ? potakaHtml.length : 0);

  // 5. Trust Tech BD
  console.log('Testing Trust Tech BD...');
  const trustHtml = await fetchHtml(`https://trusttechbd.com/index.php?route=product/search&search=${encodeURIComponent(q)}`, { timeout: 8000 });
  console.log('  Trust Tech length:', trustHtml ? trustHtml.length : 0);
}

testStores();
