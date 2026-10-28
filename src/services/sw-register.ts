import { isNative } from './platform';

/**
 * Registers the service worker in production builds: offline app shell, cached
 * fonts and Scripture, and notification taps that open the exact blessing.
 */
export function registerServiceWorker() {
  // The native app already ships every file on the device, and its reminders are native.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || isNative()) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      /* the app works without it; offline support is a progressive enhancement */
    });
  });
}

/** Messages from the service worker (e.g. a notification was tapped while the app was open). */
export function onServiceWorkerMessage(handler: (data: { type: string; url?: string }) => void): () => void {
  if (!('serviceWorker' in navigator)) return () => undefined;
  const listener = (e: MessageEvent) => handler(e.data ?? {});
  navigator.serviceWorker.addEventListener('message', listener);
  return () => navigator.serviceWorker.removeEventListener('message', listener);
}
