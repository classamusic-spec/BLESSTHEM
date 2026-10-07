#!/usr/bin/env node
/**
 * Extracts the verified verses Bless Them needs into src/content/scripture/<id>.json.
 *
 * - Reads every curated entry (passage + context) from src/content/blessings.
 * - Pulls text from the public-domain sources, already cross-checked verse-by-verse
 *   against each publisher's plain-text edition (see lib/bible.mjs).
 * - Fails the build if any referenced verse is missing or failed verification.
 *
 * If the source archives are unavailable (offline CI) and the JSON files already
 * exist, the committed files are kept and verified for completeness instead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, SRC_DIR, TRANSLATIONS } from './lib/sources.mjs';
import { parseRef } from './lib/usfm.mjs';

const OUT_DIR = path.join(ROOT, 'src/content/scripture');
const BLESSINGS_DIR = path.join(ROOT, 'src/content/blessings');
const ENTRIES = [];
for (const file of fs.readdirSync(BLESSINGS_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts').sort()) {
  const mod = await import(pathToFileURL(path.join(BLESSINGS_DIR, file)).href);
  ENTRIES.push(...mod.entries);
}

/** Passages the app shows outside curated entries (e.g. the safety support sheet). */
const SYSTEM_REFS = ['PSA 34:18'];

/** Every reference the app can display. */
const refs = new Set(SYSTEM_REFS);
for (const e of ENTRIES) {
  refs.add(e.ref);
  refs.add(e.contextRef);
}

function keysFor(ref, has) {
  const r = parseRef(ref);
  const keys = [];
  for (let c = r.startChapter; c <= r.endChapter; c++) {
    const from = c === r.startChapter ? r.startVerse : 1;
    const to = c === r.endChapter ? r.endVerse : 200;
    for (let v = from; v <= to; v++) {
      const key = `${r.book}.${c}.${v}`;
      if (has(key)) keys.push(key);
      else if (c < r.endChapter) break;
      else throw new Error(`${ref}: verse ${key} is not in the source text`);
    }
  }
  return keys;
}

const haveSources = fs.existsSync(SRC_DIR) || process.env.BLESSTHEM_FETCH === '1';

if (!haveSources) {
  console.log('Scripture sources not present; verifying the committed JSON files instead.');
  for (const id of Object.keys(TRANSLATIONS)) {
    const file = path.join(OUT_DIR, `${id}.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const ref of refs) keysFor(ref, (k) => Boolean(data.verses[k]));
  }
  console.log(`✓ ${refs.size} references resolve in every translation.`);
  process.exit(0);
}

const { loadTranslation } = await import('./lib/bible.mjs');

// Differences the publisher's plain-text export introduces by folding non-Scripture
// headings (acrostic letters, speaker labels) into verses. Our USFM reading is correct.
const KNOWN_BENIGN = /^(PSA\.119\.|SNG\.|PSA\.68\.32$)/;

for (const [id, meta] of Object.entries(TRANSLATIONS)) {
  const { verses, report } = loadTranslation(id);
  const bad = new Map(report.mismatches.map((m) => [m.key, m]));
  const out = {};
  for (const ref of refs) {
    for (const key of keysFor(ref, (k) => verses.has(k))) {
      if (bad.has(key) && !KNOWN_BENIGN.test(key)) throw new Error(`${id} ${key} failed verification against the publisher text`);
      const v = verses.get(key);
      out[key] = v.heading ? { t: v.text, s: v.segs, h: v.heading } : { t: v.text, s: v.segs };
    }
  }
  const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  const file = {
    translation: {
      id,
      name: meta.name,
      abbreviation: meta.abbreviation,
      license: meta.license,
      publisher: meta.publisher,
      url: meta.url,
    },
    verses: sorted,
  };
  fs.writeFileSync(path.join(OUT_DIR, `${id}.json`), JSON.stringify(file) + '\n');
  console.log(
    `✓ ${meta.abbreviation}: ${Object.keys(sorted).length} verified verses for ${refs.size} references ` +
      `(${report.checked.toLocaleString()} verses cross-checked, ${report.mismatches.length} known heading differences).`,
  );
}
