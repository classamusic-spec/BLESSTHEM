import type { Settings } from '@/data/models';
import { setHapticsEnabled } from './haptics';

/** Applies appearance and accessibility settings to the document. */
export function applySettings(settings: Settings) {
  const root = document.documentElement;
  if (settings.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = settings.theme;
  root.style.setProperty('--ts', String(settings.textScale));
  if (settings.motion === 'reduce') root.dataset.motion = 'reduce';
  else delete root.dataset.motion;
  const solid = settings.transparency === 'reduce' || window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  if (solid) root.dataset.transparency = 'reduce';
  else delete root.dataset.transparency;
  root.classList.toggle('dynamic-type', settings.dynamicType);
  setHapticsEnabled(settings.haptics);
  updateThemeColor();
}

export function isDark(): boolean {
  const t = document.documentElement.dataset.theme;
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function updateThemeColor() {
  const color = isDark() ? '#161412' : '#FAF7F1';
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', color);
    m.removeAttribute('media');
  });
}

export function prefersReducedMotion(settings: Settings): boolean {
  return settings.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
