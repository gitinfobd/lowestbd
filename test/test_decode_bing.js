const { cleanMerchantUrl } = require('../src/utils/linkVerifier');

const bingUrl = 'https://www.bing.com/ck/a?!&&p=e54977bab7a2dcef13118fb88d864536d2f4c8f6ab5ad90f7ec4ebd321b9bc70JmltdHM9MTc5MzY2NDAwMA&ptn=3&ver=2&hsh=4&fclid=238dedeb-a63c-6cb0-2cd2-f5eda7c76dbf&u=a1aHR0cHM6Ly93d3cuZ2Vla3Nmb3JnZWVrcy5vcmcvY29tcHV0ZXItdmlzaW9uL2NvbXB1dGVyLXZpc2lvbi1wcm9qZWN0cy8&ntb=1';

function decodeBingUrl(url) {
  const m = url.match(/[?&]u=a1([A-Za-z0-9+/=_-]+)/);
  if (m) {
    try {
      let b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return Buffer.from(b64, 'base64').toString('utf8');
    } catch (e) {
      return null;
    }
  }
  return null;
}

console.log('Decoded Bing URL:', decodeBingUrl(bingUrl));
