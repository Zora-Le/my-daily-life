const CACHE_VERSION = 'my-daily-v1';
const PRECACHE_NAME = `${CACHE_VERSION}-precache`;
const RUNTIME_NAME = `${CACHE_VERSION}-runtime`;
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/pwa-cat-192.png',
  '/icons/pwa-cat-512.png',
];

const isCacheableResponse = response =>
  response.ok && response.status === 200 && response.type !== 'opaque';

const isSensitivePath = pathname =>
  /^\/(api|auth|login|logout|oauth|sso)(\/|$)/i.test(pathname);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then(async cache => {
      await Promise.allSettled(
        PRECACHE_URLS.map(async url => {
          const response = await fetch(url, { credentials: 'same-origin' });
          const responseUrl = new URL(response.url);
          if (
            responseUrl.origin === self.location.origin &&
            isCacheableResponse(response)
          ) {
            await cache.put(url, response);
          }
        }),
      );
      await self.skipWaiting();
    }),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(
              key =>
                key.startsWith('my-daily-') &&
                key !== PRECACHE_NAME &&
                key !== RUNTIME_NAME,
            )
            .map(key => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const networkFirstNavigation = async request => {
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(RUNTIME_NAME);
      await cache.put(request, response.clone());
      await cache.put('/', response.clone());
    }
    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match('/')) ||
      new Response('当前处于离线状态，请恢复网络后重试。', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    );
  }
};

const staleWhileRevalidate = async request => {
  const cached = await caches.match(request);
  const update = fetch(request)
    .then(async response => {
      if (isCacheableResponse(response)) {
        const cache = await caches.open(RUNTIME_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await update) || Response.error();
};

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isSensitivePath(url.pathname)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    ['style', 'script', 'image', 'font', 'manifest'].includes(
      request.destination,
    ) ||
    /\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|ico|woff2?|json)$/i.test(
      url.pathname,
    )
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
