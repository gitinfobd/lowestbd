const { fetchHtml } = require('../src/utils/curlFetcher');

async function debugArea51() {
  const url = 'https://area51.com.bd/acer-nitro-v15-anv15-rtx-4060-gaming-laptop/';
  const html = await fetchHtml(url, { timeout: 10000 });
  console.log('Single product HTML length:', html ? html.length : 0);
  if (html) {
    const title = html.match(/<title>([^<]+)<\/title>/i);
    console.log('Title:', title ? title[1] : 'none');
    const price = html.match(/class="[^"]*price[^"]*"[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/i);
    console.log('Price:', price ? price[1] : 'none');
  }
}

debugArea51();
