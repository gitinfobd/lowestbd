const { scrapeUniversalBd } = require('../src/scrapers/universalBd');

async function testUniversal() {
  const items = await scrapeUniversalBd('Acer Nitro V15');
  console.log('Universal items count:', items.length);
  const area51 = items.filter(i => i.source.includes('Area 51') || (i.link && i.link.includes('area51')));
  console.log('Area 51 items found:', area51.length);
  for (const a of area51) {
    console.log(a);
  }
}

testUniversal();
