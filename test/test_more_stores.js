const { fetchHtml } = require('../src/utils/curlFetcher');

async function testStores() {
  const q = 'Nitro V15';

  // Pickaboo
  console.log('Testing Pickaboo...');
  const pbHtml = await fetchHtml(`https://api.pickaboo.com/api/v1/search/autocomplete?search=${encodeURIComponent(q)}`, { timeout: 6000 });
  console.log('Pickaboo API length:', pbHtml ? pbHtml.length : 0);
  if (pbHtml) console.log('PB response:', pbHtml.substring(0, 200));

  // BDShop
  console.log('Testing BDShop...');
  const bdshopHtml = await fetchHtml(`https://www.bdshop.com/catalogsearch/result/?q=${encodeURIComponent(q)}`, { timeout: 6000 });
  console.log('BDShop length:', bdshopHtml ? bdshopHtml.length : 0);

  // Gadget & Gear
  console.log('Testing Gadget & Gear...');
  const ggHtml = await fetchHtml(`https://gadgetandgear.com/api/v1/search?query=${encodeURIComponent(q)}`, { timeout: 6000 });
  console.log('G&G length:', ggHtml ? ggHtml.length : 0);

  // Custom Mac BD
  console.log('Testing Custom Mac BD...');
  const cmbHtml = await fetchHtml(`https://custommacbd.com/search?q=${encodeURIComponent(q)}`, { timeout: 6000 });
  console.log('Custom Mac BD length:', cmbHtml ? cmbHtml.length : 0);

  // Sumash Tech
  console.log('Testing Sumash Tech...');
  const stHtml = await fetchHtml(`https://sumashtech.com/search?q=${encodeURIComponent(q)}`, { timeout: 6000 });
  console.log('Sumash Tech length:', stHtml ? stHtml.length : 0);
}

testStores();
