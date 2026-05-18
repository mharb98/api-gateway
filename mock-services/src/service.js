'use strict';

const express = require('express');
const os = require('os');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const SERVICE_NAME  = process.env.SERVICE_NAME  || 'mock';
const INSTANCE_NAME = process.env.INSTANCE_NAME || os.hostname();
const PORT          = parseInt(process.env.PORT  || '3000', 10);

// ── Request logger ────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const reqId = req.headers['x-request-id'] || '-';
    console.log(
      `${new Date().toISOString()} | ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms | req-id=${reqId}`
    );
  });
  next();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const base = (extra = {}) => ({
  service:   SERVICE_NAME,
  instance:  INSTANCE_NAME,
  hostname:  os.hostname(),
  timestamp: new Date().toISOString(),
  ...extra,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Core endpoints ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json(base({ status: 'healthy' }));
});

app.get('/info', (_req, res) => {
  res.json(base({
    pid:    process.pid,
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    node:   process.version,
    env:    process.env.NODE_ENV || 'development',
  }));
});

// ── Failure-simulation endpoints ──────────────────────────────────────────────

// GET /slow?delay=2000
app.get('/slow', async (req, res) => {
  const delay = Math.min(parseInt(req.query.delay || '2000', 10), 30_000);
  await sleep(delay);
  res.json(base({ delay_ms: delay, message: `Responded after ${delay}ms` }));
});

// GET /error
app.get('/error', (_req, res) => {
  res.status(500).json(base({ error: 'Intentional server error', code: 'MOCK_ERROR' }));
});

// GET /random-failure?rate=0.5
app.get('/random-failure', (req, res) => {
  const rate = Math.min(parseFloat(req.query.rate || '0.5'), 1);
  if (Math.random() < rate) {
    return res.status(500).json(base({ error: 'Random failure triggered', code: 'RANDOM_FAILURE', rate }));
  }
  res.json(base({ message: 'No failure this time', rate }));
});

// GET /headers  — echo every incoming header back (useful for JWT / tracing tests)
app.get('/headers', (req, res) => {
  res.json(base({ headers: req.headers }));
});

// ALL /echo  — echoes method, query, headers, body
app.all('/echo', (req, res) => {
  res.json(base({
    method:  req.method,
    path:    req.path,
    query:   req.query,
    headers: req.headers,
    body:    req.body,
  }));
});

// ── Resource endpoint ─────────────────────────────────────────────────────────
// Must be last — two-segment path won't shadow any of the routes above.

app.get('/:resource/:id', (req, res) => {
  const { resource, id } = req.params;
  res.json(base({ data: mockRecord(SERVICE_NAME, resource, id) }));
});

// ── Mock data factory ─────────────────────────────────────────────────────────

function mockRecord(service, resource, id) {
  const common = {
    id,
    resource,
    createdAt: new Date(Date.now() - Math.random() * 86_400_000 * 30).toISOString(),
  };

  switch (service) {
    case 'users':
      return {
        ...common,
        username: `user_${id}`,
        email:    `user${id}@example.com`,
        role:     'member',
        active:   true,
      };

    case 'orders':
      return {
        ...common,
        userId:   `u_${Math.floor(Math.random() * 1000)}`,
        status:   ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        total:    parseFloat((Math.random() * 500).toFixed(2)),
        currency: 'USD',
        items:    Math.floor(Math.random() * 5) + 1,
      };

    case 'payments':
      return {
        ...common,
        orderId:  `o_${Math.floor(Math.random() * 1000)}`,
        amount:   parseFloat((Math.random() * 500).toFixed(2)),
        currency: 'USD',
        status:   ['pending', 'captured', 'refunded'][Math.floor(Math.random() * 3)],
        method:   'card',
      };

    default:
      return common;
  }
}

// ── Server lifecycle ──────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}/${INSTANCE_NAME}] listening on :${PORT}`);
});

const shutdown = (signal) => {
  console.log(`[${SERVICE_NAME}/${INSTANCE_NAME}] ${signal} — shutting down gracefully`);
  server.close(() => {
    console.log(`[${SERVICE_NAME}/${INSTANCE_NAME}] closed`);
    process.exit(0);
  });
  // Force-kill if close takes too long
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
