/* Service worker do Treino: guarda o app no cache do navegador para abrir sem internet.
 * Estratégias:
 *  - Páginas (HTML) e dados de navegação (RSC): rede primeiro; sem internet, usa a cópia salva.
 *  - /_next/static/* (arquivos com hash, nunca mudam): cache primeiro.
 *  - Demais arquivos do próprio site (ícone, manifest): usa o cache e atualiza em segundo plano.
 *  - Outros domínios (YouTube etc.) não passam pelo cache.
 * Para forçar todo mundo a baixar tudo de novo, aumente VERSION.
 */
const VERSION = 'v4';
const PAGES = `treino-pages-${VERSION}`;
const STATIC = `treino-static-${VERSION}`;
const CORE = ['/', '/semana', '/pomodoro', '/exercicios', '/progresso', '/ajuda', '/manifest.webmanifest', '/icon.svg'];
const NET_TIMEOUT_MS = 4000;

const assetsIn = (html) => [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || [])];

// Baixa uma página, guarda e também guarda os arquivos JS/CSS que ela usa.
async function cachePage(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) return;
  const pages = await caches.open(PAGES);
  await pages.put(url, res.clone());
  if (!(res.headers.get('content-type') || '').includes('text/html')) return;
  const html = await res.text();
  const stat = await caches.open(STATIC);
  await Promise.all(assetsIn(html).map(async (a) => {
    if (await stat.match(a)) return;
    try { const r = await fetch(a); if (r.ok) await stat.put(a, r); } catch {}
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.allSettled(CORE.map(cachePage)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [PAGES, STATIC];
    for (const k of await caches.keys()) if (k.startsWith('treino-') && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

// O app pede para guardar as páginas dos exercícios (lista vem de lib/data.ts).
self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type === 'precache' && Array.isArray(d.urls)) {
    event.waitUntil((async () => {
      const pages = await caches.open(PAGES);
      for (const u of d.urls) {
        if (typeof u !== 'string' || !u.startsWith('/')) continue;
        if (await pages.match(u)) continue;
        try { await cachePage(u); } catch {}
      }
    })());
  }
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function networkFirst(req, cacheName, key) {
  const cache = await caches.open(cacheName);
  try {
    const res = await withTimeout(fetch(req), NET_TIMEOUT_MS);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch {
    const hit = (await cache.match(key)) || (req.mode === 'navigate' ? await cache.match('/') : undefined);
    return hit || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(PAGES);
  const hit = await cache.match(req);
  const fresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit || Response.error());
  return hit || fresh;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // YouTube e afins: direto na rede
  if (url.pathname === '/sw.js') return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, PAGES, url.pathname));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req));
  } else if (req.headers.get('RSC') === '1' || url.searchParams.has('_rsc')) {
    // Navegação interna do Next. Sem internet e sem cópia, o Next recarrega a página (que vem do cache).
    event.respondWith(networkFirst(req, PAGES, req.url));
  } else {
    event.respondWith(staleWhileRevalidate(req));
  }
});
