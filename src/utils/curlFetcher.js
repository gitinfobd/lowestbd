const { execFile } = require('child_process');

/**
 * Executes curl.exe asynchronously to bypass bot-detection / Cloudflare TLS fingerprints
 * @param {string} url - Target URL
 * @param {object} options - Optional headers, method, data, timeout
 * @returns {Promise<string>}
 */
function fetchHtml(url, options = {}) {
  return new Promise((resolve) => {
    const timeoutMs = options.timeout || 10000;
    const args = [
      '-s',
      '-L',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      '-H', 'Accept-Language: en-US,en;q=0.9,bn;q=0.8'
    ];

    if (options.headers) {
      for (const [key, val] of Object.entries(options.headers)) {
        args.push('-H', `${key}: ${val}`);
      }
    }

    if (options.method === 'POST') {
      args.push('-X', 'POST');
      if (options.body) {
        args.push('--data-raw', typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
    }

    args.push(url);

    execFile('curl.exe', args, {
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error && !stdout) {
        resolve('');
      } else {
        resolve(stdout || '');
      }
    });
  });
}

module.exports = { fetchHtml };
