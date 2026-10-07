#!/usr/bin/env node
/**
 * Generates favicon, PWA icons, apple-touch-icon and the web manifest from the
 * Bless Them mark ("the cradle": two leaves holding a small light).
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
