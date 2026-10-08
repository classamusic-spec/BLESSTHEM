#!/usr/bin/env node
/**
 * WCAG contrast audit for the semantic colour tokens.
 *
 * Reads src/styles/tokens.css, resolves the light and dark palettes, and checks every
 * text token against every surface it can sit on. Exits non-zero if a pairing falls
 * below its required level, so it can run in CI next to the unit tests.
 *
 *   node scripts/contrast.mjs          # summary table
 *   node scripts/contrast.mjs --all    # every pairing
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)), 'utf8');

/** Collect `--color-*: #hex` declarations from the first block that matches `selector`. */
function palette(selector) {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf('{', start);
  let depth = 0;
  let end = open;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) {
      end = i;
      break;
    }
  }
  const out = {};
  for (const m of css.slice(open, end).matchAll(/--(color-[\w-]+):\s*(#[0-9a-f]{6})\b/gi)) out[m[1]] = m[2];
  return out;
}

const light = palette(':root {');
const dark = { ...light, ...palette(":root[data-theme='dark'] {") };

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const SURFACES = ['color-bg', 'color-bg-raised', 'color-surface', 'color-surface-sunken', 'color-surface-sand', 'color-surface-sage', 'color-surface-blue', 'color-surface-gold'];

/** [foreground, backgrounds, minimum ratio, role] */
const CHECKS = [
  ['color-text', SURFACES, 7, 'Body and Scripture (AAA)'],
  ['color-text-secondary', SURFACES, 7, 'Supporting copy (AAA)'],
  ['color-text-tertiary', SURFACES, 4.5, 'Metadata only (AA)'],
  ['color-brand-text', SURFACES, 4.5, 'Links, selected labels (AA)'],
  ['color-gold-text', ['color-bg', 'color-surface', 'color-surface-gold', 'color-gold-soft'], 4.5, 'Occasion labels (AA)'],
  ['color-blue-text', ['color-bg', 'color-surface', 'color-surface-blue'], 4.5, 'Conversation labels (AA)'],
  ['color-danger', ['color-bg', 'color-surface', 'color-danger-soft'], 4.5, 'Destructive actions (AA)'],
  ['color-on-brand', ['color-brand', 'color-brand-hover', 'color-brand-pressed'], 7, 'Primary button label (AAA)'],
  ['color-focus', ['color-bg', 'color-surface'], 3, 'Focus ring (non-text, 3:1)'],
];

const all = process.argv.includes('--all');
let failures = 0;
for (const [name, theme] of [['Light', light], ['Dark', dark]]) {
  console.log(`\n${name}`);
  for (const [fg, bgs, min, role] of CHECKS) {
    const results = bgs.map((bg) => ({ bg, r: ratio(theme[fg], theme[bg]) }));
    const lo = Math.min(...results.map((x) => x.r));
    const hi = Math.max(...results.map((x) => x.r));
    const ok = lo >= min;
    if (!ok) failures++;
    console.log(`  ${ok ? '✓' : '✗'} ${fg.padEnd(22)} ${lo.toFixed(1).padStart(5)}–${hi.toFixed(1).padEnd(5)} needs ${min}:1  ${role}`);
    if (all || !ok) for (const { bg, r } of results) console.log(`      ${r < min ? '✗' : ' '} on ${bg.padEnd(22)} ${r.toFixed(2)}:1`);
  }
}
console.log(failures ? `\n${failures} pairing group(s) below target.` : '\nAll pairings meet their targets.');
process.exit(failures ? 1 : 0);
