// Local-only static preview. No request bodies, form endpoints or data storage.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 4174);
http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== path.join(root, 'index.html')) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(resolved, (error, data) => {
    if (error) { res.writeHead(404); res.end('Not found'); return; }
    const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' }[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; media-src 'self'; frame-src https://rutube.ru https://kinescope.io; style-src 'self'; script-src 'self'; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'" });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(port, '127.0.0.1', () => console.log(`Local preview: http://127.0.0.1:${port}`));
