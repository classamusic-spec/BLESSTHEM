import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource-variable/figtree/wght.css';
import './styles/tokens.css';
import './styles/base.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { registerServiceWorker } from './services/sw-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();

// Development-only hook for end-to-end tests and screenshots.
if (import.meta.env.DEV) {
  void Promise.all([import('./data/store'), import('./content/blessings')]).then(([store, content]) => {
    (window as unknown as { __bt: unknown }).__bt = { store: store.useStore, entries: content.ENTRIES };
  });
}
