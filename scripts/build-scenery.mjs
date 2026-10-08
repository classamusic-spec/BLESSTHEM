#!/usr/bin/env node
/**
 * Scenery: hand-picked nature photography, every image public domain, CC0 or CC BY
 * (credited in Settings › About › Photography).
 *
 *   node scripts/build-scenery.mjs           # build what is missing or out of date
 *   node scripts/build-scenery.mjs --force   # re-encode everything
 *
 * Sources, licences and credits live in src/content/scenery/sources.json. Originals are
 * cached in /scenery-src (git-ignored) and downloaded when missing. Each photo gets the
 * same gentle grade so the set feels like one family, then is written as AVIF (with a WebP
 * fallback) at a few widths to public/scenery/, with a tiny blurred placeholder and average
 * colour in the generated src/content/scenery/scenes.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from '../node_modules/sharp/dist/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = path.join(ROOT, 'src/content/scenery/sources.json');
const CACHE = path.join(ROOT, 'scenery-src');
const OUT = path.join(ROOT, 'public/scenery');
const GENERATED = path.join(ROOT, 'src/content/scenery/scenes.ts');

const WIDTHS = { hero: [640, 1200, 1800], card: [480, 800, 1200] };
const FORMATS = ['avif', 'webp'];
const GRADES = {
  // Lift the blacks a touch, ease the saturation, and lay a soft warm light over it.
  warm: { lift: 14, saturation: 0.88, wash: { r: 255, g: 197, b: 138, alpha: 0.22 } },
  cool: { lift: 10, saturation: 0.92, wash: { r: 255, g: 214, b: 170, alpha: 0.1 } },
  night: { lift: 5, saturation: 0.96, wash: null },
};

const FORCE = process.argv.includes('--force');
const sources = JSON.parse(fs.readFileSync(SOURCES, 'utf8'));
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

async function original(id, s) {
  const file = path.join(CACHE, `${id}.jpg`);
  if (!fs.existsSync(file)) {
    console.log(`Downloading ${id} from ${s.image}`);
    const res = await fetch(s.image);
    if (!res.ok) throw new Error(`${id}: ${res.status} ${s.image}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

async function graded(file, gradeName) {
  const g = GRADES[gradeName];
  const { data, info } = await sharp(file)
    .rotate()
    .modulate({ saturation: g.saturation })
    .linear((255 - g.lift) / 255, g.lift)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let img = sharp(data, { raw: info });
  if (g.wash) {
    const wash = await sharp({ create: { width: info.width, height: info.height, channels: 4, background: g.wash } }).png().toBuffer();
    img = img.composite([{ input: wash, blend: 'soft-light' }]);
  }
  return { buffer: await img.png().toBuffer(), width: info.width, height: info.height };
}

const hex = (n) => Math.round(n).toString(16).padStart(2, '0');
const scenes = {};
let bytes = 0;
for (const [id, s] of Object.entries(sources)) {
  const file = await original(id, s);
  const { buffer, width, height } = await graded(file, s.grade);
  const widths = WIDTHS[s.role].filter((w) => w <= width);
  for (const w of widths) {
    for (const format of FORMATS) {
      const out = path.join(OUT, `${id}-${w}.${format}`);
      if (!FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(SOURCES).mtimeMs) {
        if (format === 'avif') bytes += fs.statSync(out).size;
        continue;
      }
      const resized = sharp(buffer).resize({ width: w });
      // Dense grass and leaves are mostly noise to an encoder; a whisper of softening halves the
      // WebP fallback without changing how the photo reads. AVIF keeps that detail cheaply.
      if (format === 'avif') await resized.avif({ quality: 46, effort: 6 }).toFile(out);
      else await (s.detail === 'high' ? resized.blur(0.45) : resized).webp({ quality: 68, effort: 6 }).toFile(out);
      if (format === 'avif') bytes += fs.statSync(out).size;
    }
  }
  const lqip = await sharp(buffer).resize({ width: 24 }).webp({ quality: 50 }).toBuffer();
  const { channels } = await sharp(buffer).resize({ width: 64 }).stats();
  // The darkest and brightest tenth of the blurred image: what text over this scene's wash
  // could meet. scripts/contrast.mjs checks every text colour against both.
  const tiny = await sharp(buffer).resize({ width: 24 }).blur(1.5).removeAlpha().raw().toBuffer();
  const px = [];
  for (let i = 0; i < tiny.length; i += 3) px.push([tiny[i], tiny[i + 1], tiny[i + 2]]);
  const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  px.sort((a, b) => lum(a) - lum(b));
  const toHex = (p) => `#${p.map(hex).join('')}`;
  scenes[id] = {
    id,
    widths,
    aspect: Number((width / height).toFixed(4)),
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    color: `#${hex(channels[0].mean)}${hex(channels[1].mean)}${hex(channels[2].mean)}`,
    extremes: { dark: toHex(px[Math.floor(px.length * 0.1)]), light: toHex(px[Math.floor(px.length * 0.9)]) },
    focus: s.focus,
    description: s.description,
    credit: { title: s.title, creator: s.creator, creatorUrl: s.creatorUrl, license: s.license, licenseUrl: s.licenseUrl, page: s.page },
  };
  console.log(`✓ ${id.padEnd(20)} ${widths.join('/')}`);
}

const ids = Object.keys(scenes);
fs.writeFileSync(
  GENERATED,
  `// Generated by scripts/build-scenery.mjs from sources.json. Do not edit by hand.\n\n` +
    `export type SceneId =\n${ids.map((id) => `  | '${id}'`).join('\n')};\n\n` +
    `export interface SceneCredit {\n  title: string;\n  creator: string;\n  creatorUrl: string;\n  license: string;\n  licenseUrl: string;\n  page: string;\n}\n\n` +
    `export interface Scene {\n  id: SceneId;\n  /** Available widths in /scenery/<id>-<width>.avif (and .webp) */\n  widths: number[];\n  /** width / height of the original */\n  aspect: number;\n  /** A tiny blurred WebP, shown instantly and offline */\n  lqip: string;\n  /** Average colour, for placeholders and tints */\n  color: string;\n  /** Darkest and brightest tenth of the blurred image (for the contrast audit) */\n  extremes: { dark: string; light: string };\n  /** CSS object-position that keeps the subject in frame */\n  focus: string;\n  description: string;\n  credit: SceneCredit;\n}\n\n` +
    `export const SCENES: Record<SceneId, Scene> = ${JSON.stringify(scenes, null, 2)};\n`,
);
console.log(`\n${ids.length} scenes, ${(bytes / 1024 / 1024).toFixed(2)} MB of AVIF (plus WebP fallbacks) in public/scenery`);
