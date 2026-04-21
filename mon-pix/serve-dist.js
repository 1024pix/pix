import { createServer } from 'node:http';

import httpProxy from 'http-proxy';
import handler from 'serve-handler';

const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
});

const server = createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    return proxy.web(req, res);
  }
  return handler(req, res, { public: 'dist/', rewrites: [{ source: 'courses/**', destination: 'index.html' }] });
});

server.listen(4200);
