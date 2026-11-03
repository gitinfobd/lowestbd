const { fetchHtml } = require('../src/utils/curlFetcher');

async function checkBody() {
  const html = await fetchHtml('https://html.duckduckgo.com/html/?q=test');
  console.log('Body extract:\n', html ? html.substring(1000, 3000) : 'null');
}

checkBody();
