const { fetchHtml } = require('../src/utils/curlFetcher');

async function testStores() {
  console.log('--- 1. Testing Rokomari ---');
  const rokomariHtml = await fetchHtml('https://www.rokomari.com/search?term=Humayun+Ahmed');
  if (rokomariHtml) {
    const bookRegex = /<div class="book-list-wrapper"[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<p class="book-title"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<span class="discounted-price"[^>]*>([\s\S]*?)<\/span>/gi;
    const books = [...rokomariHtml.matchAll(bookRegex)];
    console.log(`Rokomari books found: ${books.length}`);
    for (const b of books.slice(0, 3)) {
      console.log(`  - Title: ${b[2].trim()} | Price: ${b[3].trim()} | Link: https://www.rokomari.com${b[1]}`);
    }
  }

  console.log('\n--- 2. Testing Chaldal ---');
  const chaldalJson = await fetchHtml('https://chaldal.com/api/landing/searchLanding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { apiKey: 'e910243d67964b778c6e26b1cb160161', query: 'Miniket Rice' }
  });
  console.log('Chaldal response length:', chaldalJson ? chaldalJson.length : 0);

  console.log('\n--- 3. Testing Arogga ---');
  const aroggaHtml = await fetchHtml('https://www.arogga.com/api/v1/search?query=Napa');
  console.log('Arogga API response length:', aroggaHtml ? aroggaHtml.length : 0);

  console.log('\n--- 4. Testing Pickaboo ---');
  const pickabooHtml = await fetchHtml('https://www.pickaboo.com/search/result/?q=Walton+fridge');
  console.log('Pickaboo response length:', pickabooHtml ? pickabooHtml.length : 0);
}

testStores();
