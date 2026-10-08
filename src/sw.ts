/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// App shell, fonts, icons and verified Scripture are precached: the app opens
// instantly and today’s blessing is available without a connection.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// Scenery photographs are cached the first time they are seen, at the size this screen
// needs, rather than precached in every size. Until then, each scene's tiny blurred
// placeholder (bundled with the app) stands in, so nothing ever looks broken offline.
registerRoute(
  ({ url, request }) => url.origin === self.location.origin && url.pathname.startsWith('/scenery/') && request.destination === 'image',
  new CacheFirst({
    cacheName: 'scenery-v1',
    plugins: [new ExpirationPlugin({ maxEntries: 90, maxAgeSeconds: 60 * 60 * 24 * 365, purgeOnQuotaError: true })],
  }),
);

self.addEventListener('install', () => {
  void self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Tapping a reminder opens the exact blessing (Flow G).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | null)?.url ?? '/today';
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
        existing.postMessage({ type: 'navigate', url });
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});

// Remote push (production): the server sends { title, body, url, tag }.
self.addEventListener('push', (event) => {
  const data = (() => {
    try {
      return event.data?.json() ?? {};
    } catch {
      return {};
    }
  })() as { title?: string; body?: string; url?: string; tag?: string };
  if (!data.title) return;
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url ?? '/today' },
    }),
  );
});
