function decodeBingUrl(rawUrl) {
  if (!rawUrl) return null;
  const unescaped = rawUrl.replace(/&amp;/g, '&');
  const m = unescaped.match(/[?&]u=a1([A-Za-z0-9+/=_-]+)/);
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

const sample = 'https://www.bing.com/ck/a?!&amp;&amp;p=1f7329e2f8b09c344f564b39224d0480d8706b0438aa0a6c4591bc6cea165f73JmltdHM9MTc5MzY2NDAwMA&amp;ptn=3&amp;ver=2&amp;hsh=4&amp;fclid=3b25140c-672b-682a-1219-0c0a66a86986&amp;u=a1aHR0cHM6Ly93d3cucXVlZW5zdG93bm56LmNvLm56L3BsYW4v&amp;ntb=1';
console.log('Decoded:', decodeBingUrl(sample));
