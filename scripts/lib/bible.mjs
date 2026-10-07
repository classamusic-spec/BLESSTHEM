import { ensureSources } from './sources.mjs';
import { readUsfmDir, readVpl } from './usfm.mjs';

const cache = new Map();

/** Loads a full translation, verifying every verse against the publisher's plain text. */
export function loadTranslation(id, { verify = true } = {}) {
  if (cache.has(id)) return cache.get(id);
  const { usfmDir, vplPath } = ensureSources(id);
  const verses = readUsfmDir(usfmDir);
  const report = { checked: 0, mismatches: [] };
  if (verify) {
    const vpl = readVpl(vplPath);
    for (const [key, v] of verses) {
      const expected = vpl.get(key);
      if (expected === undefined) continue; // deuterocanon or versification gaps
      report.checked++;
      const actual = v.heading ? `${v.heading} ${v.text}` : v.text;
      if (actual !== expected && v.text !== expected) {
        report.mismatches.push({ key, expected, actual });
      }
    }
  }
  const result = { verses, report };
  cache.set(id, result);
  return result;
}
