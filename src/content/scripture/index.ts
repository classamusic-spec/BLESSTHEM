import { BOOKS } from './books.ts';
import bsbData from './bsb.json';

/**
 * Verified Scripture at runtime.
 *
 * Text comes only from the generated, verified JSON (see scripts/build-scripture.mjs).
 * If any verse of a passage is missing, getPassage returns null and the UI shows an
 * honest error — Bless Them never substitutes or generates verse text.
 */

export type TranslationId = 'bsb' | 'web';
/** [text, indent (0 prose, 1–3 poetry), flags (1 new line, 2 stanza/paragraph break)] */
export type Seg = [string, number, number];

export interface VerseRecord {
  t: string;
  s: Seg[];
  h?: string;
}

export interface TranslationMeta {
  id: TranslationId;
  name: string;
  abbreviation: string;
  license: string;
  publisher: string;
  url: string;
  edition?: string;
}

export interface TranslationFile {
  translation: TranslationMeta;
  verses: Record<string, VerseRecord>;
}

export const TRANSLATIONS: Array<{ id: TranslationId; name: string; abbreviation: string; note: string }> = [
  { id: 'bsb', name: 'Berean Standard Bible', abbreviation: 'BSB', note: 'Modern and readable. Uses “the LORD.”' },
  { id: 'web', name: 'World English Bible', abbreviation: 'WEB', note: 'Classic and literal. Uses the name “Yahweh.”' },
];

const loaded: Partial<Record<TranslationId, TranslationFile>> = { bsb: bsbData as TranslationFile };
const pending: Partial<Record<TranslationId, Promise<TranslationFile>>> = {};

export function isTranslationLoaded(id: TranslationId): boolean {
  return Boolean(loaded[id]);
}

export function loadTranslation(id: TranslationId): Promise<TranslationFile> {
  const ready = loaded[id];
  if (ready) return Promise.resolve(ready);
  if (!pending[id]) {
    pending[id] = (id === 'web' ? import('./web.json') : import('./bsb.json')).then((mod) => {
      const file = mod.default as TranslationFile;
      loaded[id] = file;
      return file;
    });
  }
  return pending[id]!;
}

export function translationMeta(id: TranslationId): TranslationMeta {
  return (loaded[id] ?? loaded.bsb!).translation;
}

export interface ParsedRef {
  book: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
}

export function parseRef(ref: string): ParsedRef | null {
  const m = ref.trim().match(/^([1-3]?[A-Z]{2,3})\s+(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/);
  if (!m || !BOOKS[m[1]]) return null;
  const [, book, c1, v1, c2, v2] = m;
  return {
    book,
    startChapter: Number(c1),
    startVerse: Number(v1),
    endChapter: c2 ? Number(c2) : Number(c1),
    endVerse: v2 ? Number(v2) : Number(v1),
  };
}

/** "PSA 23:1-3" → "Psalm 23:1–3" */
export function formatRef(ref: string): string {
  const r = parseRef(ref);
  if (!r) return ref;
  const book = BOOKS[r.book];
  const single = r.startChapter === r.endChapter && r.startVerse === r.endVerse;
  const name = r.startChapter === r.endChapter ? book.citeName : book.name;
  if (single) return `${name} ${r.startChapter}:${r.startVerse}`;
  if (r.startChapter === r.endChapter) return `${name} ${r.startChapter}:${r.startVerse}–${r.endVerse}`;
  return `${name} ${r.startChapter}:${r.startVerse}–${r.endChapter}:${r.endVerse}`;
}

export function bookName(ref: string): string {
  const r = parseRef(ref);
  return r ? BOOKS[r.book].name : '';
}

/** Expands a reference into verse keys present in the data ("JOS.1.9"). */
export function verseKeys(ref: string, verses: Record<string, VerseRecord>): string[] | null {
  const r = parseRef(ref);
  if (!r) return null;
  const keys: string[] = [];
  for (let c = r.startChapter; c <= r.endChapter; c++) {
    const from = c === r.startChapter ? r.startVerse : 1;
    const to = c === r.endChapter ? r.endVerse : 200;
    for (let v = from; v <= to; v++) {
      const key = `${r.book}.${c}.${v}`;
      if (verses[key]) keys.push(key);
      else if (c < r.endChapter) break;
      else return null; // a verse inside the requested range is missing — never paper over it
    }
  }
  return keys;
}

export interface PassageVerse {
  key: string;
  chapter: number;
  verse: number;
  segs: Seg[];
  heading?: string;
}

export interface Passage {
  ref: string;
  display: string;
  translation: TranslationMeta;
  verses: PassageVerse[];
  /** Plain text for speech, sharing and copying (quotation marks balanced for the excerpt). */
  text: string;
  poetry: boolean;
}

export function getPassage(ref: string, translation: TranslationId = 'bsb'): Passage | null {
  const file = loaded[translation];
  if (!file) return null;
  const keys = verseKeys(ref, file.verses);
  if (!keys || !keys.length) return null;
  const verses: PassageVerse[] = keys.map((key, i) => {
    const [, c, v] = key.split('.');
    const rec = file.verses[key];
    return {
      key,
      chapter: Number(c),
      verse: Number(v),
      segs: rec.s.map((s) => [...s] as Seg),
      // Psalm superscriptions only belong at the top of a passage.
      heading: i === 0 ? rec.h : undefined,
    };
  });
  balanceQuotes(verses);
  const text = verses
    .map((v) => v.segs.map((s) => s[0]).join(' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    ref,
    display: formatRef(ref),
    translation: file.translation,
    verses,
    text,
    poetry: verses.some((v) => v.segs.some((s) => s[1] > 0)),
  };
}

/**
 * An excerpt often begins or ends inside a quotation that opens or closes in a
 * neighbouring verse. Dangling double quotation marks (and an unmatched leading
 * single quote) are omitted for display. Words are never altered.
 */
export function balanceQuotes(verses: PassageVerse[]): void {
  const segs = verses.flatMap((v) => v.segs);
  const opens: Array<{ seg: number; index: number }> = [];
  const removals = new Map<number, number[]>();
  const mark = (seg: number, index: number) => removals.set(seg, [...(removals.get(seg) ?? []), index]);

  segs.forEach((s, si) => {
    for (let i = 0; i < s[0].length; i++) {
      const ch = s[0][i];
      if (ch === '“') opens.push({ seg: si, index: i });
      else if (ch === '”') {
        if (opens.length) opens.pop();
        else mark(si, i);
      }
    }
  });
  for (const o of opens) mark(o.seg, o.index);

  removals.forEach((indexes, si) => {
    // UTF-16 indexes are safe here: curly quotation marks are single code units.
    const text = segs[si][0];
    let out = '';
    for (let i = 0; i < text.length; i++) if (!indexes.includes(i)) out += text[i];
    segs[si][0] = out.replace(/\s{2,}/g, ' ').trim();
  });

  // Single quotes double as apostrophes, so only handle the clear cases at the edges.
  const first = segs[0];
  const last = segs[segs.length - 1];
  const all = segs.map((s) => s[0]).join(' ');
  if (first && first[0].startsWith('‘') && !/[.,;:!?—]’/.test(all)) first[0] = first[0].slice(1);
  if (last && /[.,;:!?—]’$/.test(last[0]) && !all.includes('‘')) last[0] = last[0].slice(0, -1);
}
