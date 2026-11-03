const { fetchHtml } = require('../src/utils/curlFetcher');

(async () => {
  const html = await fetchHtml('https://www.aarong.com/catalogsearch/result/?q=panjabi');
  if (html) {
    console.log(html.substring(0, 1000));
  }
})();
