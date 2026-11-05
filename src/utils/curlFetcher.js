const { execFile } = require('child_process');

/**
 * Resilient Cross-Platform HTTP/HTML Fetcher
 * Layer 1: Native Node.js fetch with realistic browser headers & AbortController timeout.
 * Layer 2: Platform-aware curl fallback (curl on Linux/macOS, curl.exe on Windows).
 * Safe against ENOENT errors on Vercel Serverless / Linux Lambda.
 * @param {string} url - Target URL
 * @param {object} options - Optional headers, method, body, timeout
 * @returns {Promise<string>}
 */
async function fetchHtml(url, options = {}) {
  const timeoutMs = options.timeout || 8000;
  const method = options.method || 'GET';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
    ...(options.headers || {})
  };

  // Layer 1: Native Node.js fetch
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const fetchOpts = {
      method,
      headers,
      signal: controller.signal
    };

    if (method === 'POST' && options.body) {
      fetchOpts.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    const res = await fetch(url, fetchOpts);
    clearTimeout(timer);

    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 50 && !text.includes('Just a moment...') && !text.includes('Attention Required!')) {
        return text;
      }
    }
  } catch (e) {
    // Fall through to curl fallback
  }

  // Layer 2: Platform-aware curl fallback
  return new Promise((resolve) => {
    try {
      const curlCmd = process.platform === 'win32' ? 'curl.exe' : 'curl';
      const args = [
        '-s',
        '-L',
        '-A', headers['User-Agent'],
        '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        '-H', 'Accept-Language: en-US,en;q=0.9,bn;q=0.8'
      ];

      if (options.headers) {
        for (const [key, val] of Object.entries(options.headers)) {
          args.push('-H', `${key}: ${val}`);
        }
      }

      if (method === 'POST') {
        args.push('-X', 'POST');
        if (options.body) {
          args.push('--data-raw', typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
      }

      args.push(url);

      execFile(curlCmd, args, {
        windowsHide: true,
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024
      }, (error, stdout) => {
        resolve(stdout || '');
      });
    } catch (err) {
      resolve('');
    }
  });
}

module.exports = { fetchHtml };
