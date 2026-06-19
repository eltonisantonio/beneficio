// ============================================================================
// service-worker.js — PWA
// Estratégia simples e segura para um app que depende do Firebase:
//   - Faz cache só da "casca" (HTML/CSS/JS/ícones) → abre rápido e offline.
//   - Dados (Firestore) são SEMPRE buscados online; nada de dados em cache.
//   - Sem internet: a interface abre e mostra mensagem amigável de erro.
// Suba a versão do cache (CACHE) sempre que publicar mudanças nos arquivos.
// ============================================================================
const CACHE = 'raguife-v1';

const SHELL = [
  './',
  './index.html',
  './css/base.css',
  './css/employee.css',
  './js/firebase.js',
  './js/helpers.js',
  './js/db.js',
  './js/employee.js',
  './assets/logo.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Nunca interceptar chamadas ao Firebase/Google: sempre rede.
  if (/firebase|googleapis|gstatic|firestore/.test(url.hostname)) return;
  if (e.request.method !== 'GET') return;

  // Casca: cache-first com atualização em segundo plano (stale-while-revalidate).
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(res => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
