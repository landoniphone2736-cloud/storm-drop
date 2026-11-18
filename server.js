// Storm Drop .io — game server
// Serves the game page and relays live player state between everyone connected.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 40;
const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
    res.end(html);
  } else if (url === '/favicon.ico') {
    res.writeHead(204); res.end();
  } else if (url === '/health') {
    res.end('ok');
  } else {
    res.writeHead(404); res.end('not found');
  }
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8 * 1024 });
const clients = new Map(); // id -> ws

function broadcast(fromId, msg) {
  const data = JSON.stringify(msg);
  for (const [id, c] of clients) if (id !== fromId && c.readyState === 1) c.send(data);
}

wss.on('connection', (ws) => {
  if (clients.size >= MAX_PLAYERS) { ws.close(1013, 'server full'); return; }
  const id = crypto.randomBytes(8).toString('hex');
  ws.id = id; ws.p = {}; ws.alive = true;
  clients.set(id, ws);
  ws.send(JSON.stringify({ t: 'hello', you: id, peers: [...clients].filter(([k]) => k !== id).map(([k, c]) => [k, c.p]) }));

  let count = 0, windowStart = Date.now();
  ws.on('message', (buf) => {
    const t = Date.now();
    if (t - windowStart > 1000) { windowStart = t; count = 0; }
    if (++count > 60) return; // rate limit: 60 messages / second
    let m; try { m = JSON.parse(buf); } catch { return; }
    if (!m || m.t !== 'p' || typeof m.d !== 'object' || m.d === null || Array.isArray(m.d)) return;
    const next = Object.assign({}, ws.p);
    for (const k in m.d) { if (m.d[k] === null) delete next[k]; else next[k] = m.d[k]; }
    if (JSON.stringify(next).length > 4096) return; // state size cap
    ws.p = next;
    broadcast(id, { t: 'p', id, d: m.d });
  });
  ws.on('pong', () => { ws.alive = true; });
  ws.on('close', () => { clients.delete(id); broadcast(id, { t: 'bye', id }); });
});

// drop dead connections
setInterval(() => {
  for (const [, c] of clients) { if (!c.alive) { c.terminate(); continue; } c.alive = false; try { c.ping(); } catch {} }
}, 15000);

server.listen(PORT, () => console.log('Storm Drop running on port ' + PORT));
