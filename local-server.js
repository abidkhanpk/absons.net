const http = require('http');
const { URL } = require('url');
const { handler } = require('./api/index.js');
const fs = require('fs');
const path = require('path');

// Load environment variables for local usage (override system values so .env wins).
require('dotenv').config({ path: '.env.local', override: true });
require('dotenv').config({ override: true });

// Normalize SSL cert paths to absolute paths if provided.
['MYSQL_SSL_CA', 'MYSQL_SSL_CERT', 'MYSQL_SSL_KEY'].forEach(key => {
  const val = process.env[key];
  if (val && !path.isAbsolute(val)) {
    const abs = path.resolve(process.cwd(), val);
    if (fs.existsSync(abs)) {
      process.env[key] = abs;
    }
  }
});

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  const bodyChunks = [];

  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('error', err => {
    console.error('Request error', err);
    res.statusCode = 400;
    res.end('Bad Request');
  });

  req.on('end', async () => {
    const bodyBuffer = Buffer.concat(bodyChunks);
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    try {
      const event = toApiGatewayEvent(req, url, bodyBuffer);
      const result = await handler(event, {}, () => {});
      sendResponse(res, result);
    } catch (err) {
      console.error('Handler error', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
});

function toApiGatewayEvent(req, url, bodyBuffer) {
  const queryParams = {};
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value;
  }

  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: url.pathname,
    rawQueryString: url.search ? url.search.slice(1) : '',
    rawUrl: url.toString(),
    headers: req.headers,
    requestContext: {
      http: {
        method: req.method,
        path: url.pathname,
        protocol: `HTTP/${req.httpVersion}`,
        sourceIp: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] || ''
      }
    },
    queryStringParameters: Object.keys(queryParams).length ? queryParams : null,
    cookies: req.headers.cookie ? req.headers.cookie.split(';').map(c => c.trim()) : undefined,
    isBase64Encoded: true,
    body: bodyBuffer.length ? bodyBuffer.toString('base64') : null
  };
}

function sendResponse(res, result = {}) {
  res.statusCode = result.statusCode || 200;

  const headers = result.headers || {};
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  const multiValueHeaders = result.multiValueHeaders || {};
  for (const [key, value] of Object.entries(multiValueHeaders)) {
    if (Array.isArray(value)) {
      res.setHeader(key, value);
    }
  }

  // AWS style cookies array → set-cookie header for local server.
  if (Array.isArray(result.cookies) && result.cookies.length) {
    res.setHeader('set-cookie', result.cookies);
  }

  const body = result.body || '';
  if (result.isBase64Encoded) {
    res.end(Buffer.from(body, 'base64'));
  } else {
    res.end(body);
  }
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`ServerlessWP local server listening on http://localhost:${PORT}`);
});
