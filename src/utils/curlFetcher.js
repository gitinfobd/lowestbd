const { spawn } = require('child_process');

/**
 * Executes curl.exe asynchronously to bypass bot-detection / Cloudflare TLS fingerprints
 * @param {string} url - Target URL
 * @param {object} options - Optional headers, method, data, timeout
 * @returns {Promise<string>}
 */
function fetchHtml(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeoutMs = options.timeout || 12000;
    const args = [
      '-s',
      '-L',
      '--compressed',
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
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

    const child = spawn('curl.exe', args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch (e) {}
      resolve(''); // Return empty on timeout rather than crashing the whole scan
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve('');
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve(stdout);
    });
  });
}

module.exports = { fetchHtml };
