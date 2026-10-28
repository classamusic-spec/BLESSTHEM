#!/usr/bin/env node
/**
 * Generates favicon, PWA icons, apple-touch-icon and the web manifest from the
 * Bless Them mark ("the cradle": two leaves holding a small light), and, when the native
 * projects exist (`npx cap add ios|android`), their app icons, splash images and the
 * Android status-bar icon for reminders.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT } from './lib/sources.mjs';

const MARK = ({ leafA, leafB, light }) => `
  <circle cx="32" cy="33" r="6.4" fill="${light}"/>
  <path d="M30.8 56.6C16.2 55 7 43.4 9.4 26.6c.6-4.2 1.9-8.4 3.8-12.4 10 7.4 16.6 21 17.6 42.4Z" fill="${leafA}"/>
  <path d="M33.2 56.6C47.8 55 57 43.4 54.6 26.6c-.6-4.2-1.9-8.4-3.8-12.4-10 7.4-16.6 21-17.6 42.4Z" fill="${leafB}"/>`;

const ON_SAGE = MARK({ leafA: '#F6F0E4', leafB: '#CCDAC7', light: '#E9C783' });

const BG = `<defs>
  <radialGradient id="bg" cx=".28" cy=".08" r="1.05">
    <stop offset="0" stop-color="#5B7C63"/>
    <stop offset=".55" stop-color="#3F5D49"/>
    <stop offset="1" stop-color="#2F483A"/>
  </radialGradient>
  <radialGradient id="glow" cx=".5" cy=".52" r=".32">
    <stop offset="0" stop-color="#F3D9A0" stop-opacity=".28"/>
    <stop offset="1" stop-color="#F3D9A0" stop-opacity="0"/>
  </radialGradient>
</defs>`;

/** Square icon. `inset` is the mark's scale inside the tile; `rx` rounds corners. */
const icon = ({ size, scale = 0.66, rx = 0 }) => {
  const offset = (64 - 64 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
    ${BG}
    <rect width="64" height="64" rx="${rx}" fill="url(#bg)"/>
    <rect width="64" height="64" rx="${rx}" fill="url(#glow)"/>
    <g transform="translate(${offset} ${offset - 0.6}) scale(${scale})">${ON_SAGE}</g>
  </svg>`;
};

const out = (p) => path.join(ROOT, 'public', p);
const png = (svg, file) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out(file));

await png(icon({ size: 192, rx: 0 }), 'icons/icon-192.png');
await png(icon({ size: 512, rx: 0 }), 'icons/icon-512.png');
await png(icon({ size: 512, scale: 0.52 }), 'icons/maskable-512.png');
await png(icon({ size: 180, scale: 0.62 }), 'icons/apple-touch-icon.png');
fs.writeFileSync(out('favicon.svg'), icon({ size: 64, rx: 14.5, scale: 0.7 }).replace(/\n\s*/g, ' ').trim() + '\n');
fs.writeFileSync(out('mark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${MARK({ leafA: '#3E5B47', leafB: '#6E8F76', light: '#C99A46' })}</svg>\n`);

const manifest = {
  name: 'Bless Them',
  short_name: 'Bless Them',
  description: 'Speak Scripture over the people you love.',
  id: '/',
  start_url: '/today?source=pwa',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#FAF7F1',
  theme_color: '#FAF7F1',
  categories: ['lifestyle', 'books', 'education'],
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  shortcuts: [
    { name: 'Today’s blessing', url: '/today?source=shortcut', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    { name: 'Journal', url: '/journal?source=shortcut', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
  ],
};
fs.writeFileSync(out('manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Icons and manifest written to public/.');

/* ── Native apps ─────────────────────────────────────────────────── */
const IVORY = '#FAF7F1';
const SAGE = '#3F5D49';
const at = (...p) => path.join(ROOT, ...p);
const write = async (svg, file, opts = {}) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let img = sharp(Buffer.from(svg));
  if (opts.flatten) img = img.flatten({ background: opts.flatten });
  await img.png({ compressionLevel: 9 }).toFile(file);
};
/** The mark alone on a transparent square, at `scale` of the canvas. */
const markOnly = ({ size, scale, colors = ON_SAGE }) => {
  const offset = (64 - 64 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
    <g transform="translate(${offset} ${offset - 0.6}) scale(${scale})">${colors}</g></svg>`;
};
/** The mark centred on ivory, for launch screens of any shape. */
const splash = (w, h) => {
  const m = Math.min(w, h) * 0.22;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${IVORY}"/>
    <g transform="translate(${(w - m) / 2} ${(h - m) / 2}) scale(${m / 64})">${MARK({ leafA: '#3E5B47', leafB: '#6E8F76', light: '#C99A46' })}</g></svg>`;
};

if (fs.existsSync(at('ios/App/App/Assets.xcassets'))) {
  // App Store icons must be opaque; iOS rounds the corners itself.
  await write(icon({ size: 1024, scale: 0.62 }), at('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'), { flatten: SAGE });
  const splashDir = at('ios/App/App/Assets.xcassets/Splash.imageset');
  for (const f of fs.existsSync(splashDir) ? fs.readdirSync(splashDir).filter((f) => f.endsWith('.png')) : []) {
    const { width, height } = await sharp(path.join(splashDir, f)).metadata();
    await write(splash(width, height), path.join(splashDir, f));
  }
  console.log('iOS app icon and launch images written.');
}

const res = at('android/app/src/main/res');
if (fs.existsSync(res)) {
  const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(densities)) {
    await write(icon({ size: 48 * k, scale: 0.62, rx: 10 }), path.join(res, `mipmap-${d}/ic_launcher.png`));
    await write(icon({ size: 48 * k, scale: 0.62, rx: 32 }), path.join(res, `mipmap-${d}/ic_launcher_round.png`));
    // Adaptive foreground: 108dp canvas, the mark inside the 66dp safe zone.
    await write(markOnly({ size: 108 * k, scale: 0.4 }), path.join(res, `mipmap-${d}/ic_launcher_foreground.png`));
    // Status-bar icon: a white silhouette (Android tints it with the notification colour).
    await write(markOnly({ size: 24 * k, scale: 0.84, colors: MARK({ leafA: '#FFF', leafB: '#FFF', light: '#FFF' }) }), path.join(res, `drawable-${d}/ic_stat_blessthem.png`));
  }
  fs.writeFileSync(path.join(res, 'values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${SAGE}</color>\n</resources>\n`);
  for (const dir of fs.readdirSync(res).filter((d) => d.startsWith('drawable'))) {
    const file = path.join(res, dir, 'splash.png');
    if (!fs.existsSync(file)) continue;
    const { width, height } = await sharp(file).metadata();
    await write(splash(width, height), file);
  }
  console.log('Android launcher, status-bar and splash images written.');
}
