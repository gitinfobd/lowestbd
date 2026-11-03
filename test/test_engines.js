const { fetchHtml } = require('../src/utils/curlFetcher');

async function testSearchEngines() {
  const q = 'Nitro V15 price in bd';
  
  // Test 1: Bing HTML
  console.log('Testing Bing...');
  const bingHtml = await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, { timeout: 8000 });
  console.log('Bing HTML length:', bingHtml ? bingHtml.length : 0);
  if (bingHtml) {
    const titles = [...bingHtml.matchAll(/<h2><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/gi)];
    console.log('Bing results found:', titles.length);
    for (const t of titles.slice(0, 3)) {
      console.log('  ', t[1], '-->', t[2].replace(/<[^>]+>/g, '').trim());
    }
  }

  // Test 2: Yahoo HTML
  console.log('Testing Yahoo...');
  const yahooHtml = await fetchHtml(`https://search.yahoo.com/search?p=${encodeURIComponent(q)}`, { timeout: 8000 });
  console.log('Yahoo HTML length:', yahooHtml ? yahooHtml.length : 0);
  if (yahooHtml) {
    const yTitles = [...yahooHtml.matchAll(/<h3[^>]*><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h3>/gi)];
    console.log('Yahoo results found:', yTitles.length);
    for (const t of yTitles.slice(0, 3)) {
      console.log('  ', t[1], '-->', t[2].replace(/<[^>]+>/g, '').trim());
    }
  }
}

testSearchEngines();
