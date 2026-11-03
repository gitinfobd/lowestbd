const { fetchHtml } = require('../src/utils/curlFetcher');

const urls = [
  'https://dazzle.com.bd/product/apple-mac-mini-m6-chip-with-12core-cpu-and-12-core-gpu-price-in-bangladesh',
  'https://dazzle.com.bd/apple-mac-mini-m6-chip-with-12core-cpu-and-12-core-gpu-price-in-bangladesh',
  'https://applegadgetsbd.com/product/apple-mac-mini-m6-12-core-cpu-12-core-gpu',
  'https://www.startech.com.bd/apple-mac-mini-m6',
  'https://www.ryans.com/apple-mac-mini-apple-m6-chip-mini-pc',
  'https://www.skyland.com.bd/bijoy-ekattor-for-mac-bangla-software'
];

async function checkUrls() {
  for (const u of urls) {
    const html = await fetchHtml(u, { timeout: 6000 });
    const is404 = !html || html.includes('404') || html.includes('Page Not Found') || html.includes('Not Found') || html.includes('An Error Occurred');
    const titleMatch = html ? html.match(/<title>([^<]+)<\/title>/i) : null;
    console.log(`URL: ${u}`);
    console.log(`  Length: ${html ? html.length : 0} | 404?: ${is404} | Title: ${titleMatch ? titleMatch[1].trim() : 'NO TITLE'}\n`);
  }
}

checkUrls();
