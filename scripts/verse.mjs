#!/usr/bin/env node
/**
 * Look up verified Scripture text.
 *   npm run verse -- "JOS 1:9"            (BSB)
 *   npm run verse -- "PSA 23:1-4" web     (World English Bible)
 */
import { loadTranslation } from './lib/bible.mjs';
import { expandRef } from './lib/usfm.mjs';

const [ref, translation = 'bsb'] = process.argv.slice(2);
if (!ref) {
  console.error('Usage: npm run verse -- "PSA 23:1-4" [bsb|web]');
  process.exit(1);
}
const { verses } = loadTranslation(translation, { verify: false });
const keys = expandRef(ref, verses);
if (!keys.length) {
  console.error(`No verses found for ${ref}`);
  process.exit(2);
}
for (const key of keys) {
  const v = verses.get(key);
  const lines = v.segs.map(([t, indent, flags]) => `${flags & 1 ? '\n' : ''}${'  '.repeat(indent)}${t}`).join(' ');
  console.log(`${key}${v.heading ? `  [${v.heading}]` : ''}:${lines}`);
}
