/**
 * Mock Git API Server
 *
 * Proporciona datos simulados de git log para probar el
 * changelog generator sin depender de un repositorio Git real.
 *
 * Endpoints:
 *   GET /api/git-log?from=<ref>&to=<ref>  →  commits simulados
 *   GET /api/tags                          →  tags simulados
 *   GET /api/health                        →  health check
 */

import http from 'node:http';

const PORT = Number(process.env.PORT) || 3099;

const MOCK_COMMITS = [
  'feat(auth): implement OAuth2 login flow',
  'feat(api): add rate limiting middleware',
  'fix(api): correct status code for unauthorized requests',
  'fix(ui): resolve button alignment in Safari',
  'chore(deps): update dependencies to latest versions',
  'refactor(core): extract validation logic to separate module',
  'feat! : migrate to new database schema',
  'docs(readme): update installation instructions',
  'test(api): add integration tests for auth endpoints',
  'perf(parser): optimize regex for large commit bodies',
  'ci: add GitHub Actions workflow for CI/CD',
  'build: configure esbuild for faster builds',
  'feat(cli): add --format flag for JSON output',
  'fix(cli): handle empty git log gracefully',
  'style: format code with Prettier',
];

const MOCK_TAGS = ['v0.1.0', 'v0.2.0', 'v1.0.0', 'v1.1.0', 'v2.0.0'];

function generateMockCommits(from, to) {
  let count = MOCK_COMMITS.length;
  if (from || to) {
    count = Math.min(count, 5);
  }
  return MOCK_COMMITS.slice(0, count).map((subject, i) => ({
    hash: `abc${String(i + 1).padStart(6, '0')}`,
    subject,
    author: 'developer@example.com',
    date: new Date(Date.now() - i * 86400000).toISOString(),
    body: i === 5 ? 'BREAKING CHANGE: new database schema requires migration\n\nMigration script: npm run migrate' : '',
  }));
}

function parseBody(body) {
  if (!body) return '';
  return body;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (path === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'mock-git-api' }));
    return;
  }

  if (path === '/api/tags') {
    res.writeHead(200);
    res.end(JSON.stringify({ tags: MOCK_TAGS }));
    return;
  }

  if (path === '/api/git-log') {
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const commits = generateMockCommits(from, to);

    res.writeHead(200);
    res.end(JSON.stringify({ commits, count: commits.length, range: { from, to } }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Mock Git API running on http://localhost:${PORT}`);
  console.log(`Endpoints:
  GET /api/health  → health check
  GET /api/tags    → list tags
  GET /api/git-log → get commits (query: from, to)`);
});
