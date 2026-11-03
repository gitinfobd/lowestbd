const { fetchHtml } = require('../src/utils/curlFetcher');

async function checkGoogleBody() {
  const html = await fetchHtml(`https://www.google.com/search?q=Acer+Nitro+V15+bd&hl=en`);
  if (html) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log('Google Title:', titleMatch ? titleMatch[1] : 'none');
    // find links
    const links = [...html.matchAll(/<a[^>]+href="\/url\?q=([^"&]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi)];
    console.log('Google /url?q= links found:', links.length);
    for (const l of links.slice(0, 5)) {
      console.log('  URL:', decodeURIComponent(l[1]));
      console.log('  Text:', l[2].replace(/<[^>]+>/g, '').trim());
    }
  }
}

checkGoogleBody();
