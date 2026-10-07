/**
 * Minimal, strict USFM reader for Bless Them's Scripture pipeline.
 *
 * Produces, for every verse:
 *   - text:  the verse's words exactly as published (whitespace normalised)
 *   - segs:  display segments [text, indent, flags] preserving poetry lines
 *            indent 0 = prose, 1..3 = poetry level; flags 1 = starts a new line,
 *            2 = stanza / paragraph break before this line
 *   - heading: psalm superscription (\d) when it precedes the verse
 *
 * Footnotes, cross references, Strong's tags and section headings are dropped.
 * The words themselves are never altered; build-scripture.mjs cross-checks every
 * verse against the publisher's plain-text (VPL) edition.
 */
import fs from 'node:fs';
import path from 'node:path';

const CHAR_STYLES = [
  'wj', 'add', 'nd', 'qs', 'it', 'bd', 'sc', 'em', 'bdit', 'no', 'sls', 'tl', 'pn', 'k', 'qt',
  'ord', 'sig', 'qac', 'dc', 'png', 'addpn', 'fig', 'rq', 'bk', 'sup', 'tl', 'wa', 'wg', 'wh', 'ior',
];
const PARAGRAPH_MARKERS = new Set([
  'm', 'p', 'pi', 'pi1', 'pi2', 'pi3', 'nb', 'pc', 'pm', 'pmo', 'pmc', 'pmr', 'pr', 'mi',
  'li', 'li1', 'li2', 'li3', 'li4', 'cls', 'lit', 'ph', 'ph1', 'ph2',
]);
const POETRY = { q: 1, q1: 1, q2: 2, q3: 3, q4: 3, qm: 1, qm1: 1, qm2: 2, qm3: 3, qr: 1, qc: 1, qd: 1 };
// Markers whose payload is not Scripture text for our purposes.
const SKIP_PAYLOAD = new Set([
  'id', 'ide', 'h', 'toc1', 'toc2', 'toc3', 'toca1', 'toca2', 'toca3', 'mt', 'mt1', 'mt2',
  'mt3', 'mt4', 'mte', 'mte1', 'ms', 'ms1', 'ms2', 'ms3', 'mr', 's', 's1', 's2', 's3', 's4',
  'sr', 'r', 'sp', 'cl', 'cp', 'cd', 'rem', 'sts', 'restore', 'usfm', 'qa', 'iex', 'ie',
  'is', 'is1', 'is2', 'ip', 'ipr', 'iot', 'io', 'io1', 'io2', 'imt', 'imt1', 'imt2', 'ili',
  'ili1', 'ili2', 'im', 'ipi', 'imq', 'ipq', 'iq', 'iq1', 'iq2', 'ib', 'ior', 'periph',
]);

export function cleanInline(source) {
  let s = source;
  s = s.replace(/\\f\s[\s\S]*?\\f\*/g, '');
  s = s.replace(/\\fe\s[\s\S]*?\\fe\*/g, '');
  s = s.replace(/\\x\s[\s\S]*?\\x\*/g, '');
  // \w word|strong="H1234"\w*   and nested \+w ...\+w*
  s = s.replace(/\\\+?w\s([^|\\]*?)(?:\|[^\\]*?)?\\\+?w\*/g, '$1');
  const styles = CHAR_STYLES.join('|');
  s = s.replace(new RegExp(`\\\\\\+?(?:${styles})\\*`, 'g'), '');
  s = s.replace(new RegExp(`\\\\\\+?(?:${styles})\\s`, 'g'), '');
  return s;
}

const norm = (t) => t.replace(/\s+/g, ' ').trim();

export function parseBook(rawContent, bookId) {
  const content = cleanInline(rawContent);
  const tokens = [];
  const re = /\\([a-z]+[0-9]*)\*?(?=\s|$)/g;
  let match;
  let last = null;
  while ((match = re.exec(content))) {
    if (last) last.payload = content.slice(last.end, match.index);
    last = { marker: match[1], end: re.lastIndex, payload: '' };
    tokens.push(last);
  }
  if (last) last.payload = content.slice(last.end);

  const verses = new Map();
  let chapter = 0;
  let verse = null; // current verse record
  let pendingHeading = null;
  let lineIndent = 0;
  let lineFresh = true; // no text written on the current line yet
  let pendingStanza = false;

  const startLine = (indent) => {
    lineIndent = indent;
    lineFresh = true;
  };

  const write = (text) => {
    const t = text.replace(/\s+/g, ' ');
    if (!t.trim()) return;
    if (!verse) return; // text outside a verse (titles etc.)
    const last = verse.segs[verse.segs.length - 1];
    if (last && !lineFresh) {
      last[0] = last[0] + t;
    } else {
      let flags = lineFresh ? 1 : 0;
      if (pendingStanza && lineFresh) flags |= 2;
      verse.segs.push([t.replace(/^\s+/, ''), lineIndent, flags]);
      pendingStanza = false;
    }
    lineFresh = false;
  };

  for (const tok of tokens) {
    const { marker } = tok;
    let payload = tok.payload;
    if (marker === 'c') {
      chapter = parseInt(payload.trim(), 10);
      verse = null;
      pendingHeading = null;
      continue;
    }
    if (marker === 'd') {
      pendingHeading = norm(payload);
      continue;
    }
    if (marker === 'v') {
      const vm = payload.match(/^\s*(\d+)(?:-(\d+))?[a-z]?\s?([\s\S]*)$/);
      if (!vm) throw new Error(`Bad verse marker in ${bookId} ${chapter}: ${payload.slice(0, 40)}`);
      const key = `${bookId}.${chapter}.${parseInt(vm[1], 10)}`;
      verse = { key, segs: [], heading: pendingHeading ?? undefined };
      if (vm[2]) verse.through = parseInt(vm[2], 10);
      pendingHeading = null;
      verses.set(key, verse);
      // A verse that begins mid-line continues the current line's segment context.
      if (!lineFresh) {
        // start a new segment for this verse on the same line (inline continuation)
        verse.segs.push(['', lineIndent, 0]);
        lineFresh = false;
      }
      write(vm[3]);
      continue;
    }
    if (marker in POETRY) {
      startLine(POETRY[marker]);
      write(payload);
      continue;
    }
    if (PARAGRAPH_MARKERS.has(marker)) {
      startLine(0);
      pendingStanza = true;
      write(payload);
      continue;
    }
    if (marker === 'b') {
      pendingStanza = true;
      startLine(lineIndent);
      continue;
    }
    if (SKIP_PAYLOAD.has(marker)) {
      // a heading interrupts the flow: the next text starts a new line/paragraph
      if (marker.startsWith('s') || marker === 'r' || marker.startsWith('ms') || marker === 'mr' || marker === 'sp') {
        pendingStanza = true;
        lineFresh = true;
      }
      continue;
    }
    // Unknown marker: keep its text so nothing is silently lost.
    write(payload);
  }

  for (const v of verses.values()) {
    v.segs = v.segs
      .map(([t, indent, flags]) => [norm(t), indent, flags])
      .filter(([t]) => t.length > 0);
    v.text = norm(v.segs.map(([t]) => t).join(' '));
  }
  return verses;
}

export function readUsfmDir(dir) {
  const all = new Map();
  for (const file of fs.readdirSync(dir).sort()) {
    const m = file.match(/^\d+-([1-3A-Z]{3})/);
    if (!m || !file.endsWith('.usfm')) continue;
    const bookId = m[1];
    if (bookId === 'FRT' || bookId === 'GLO') continue;
    const verses = parseBook(fs.readFileSync(path.join(dir, file), 'utf8'), bookId);
    for (const [k, v] of verses) all.set(k, v);
  }
  return all;
}

// eBible's VPL files use BibleWorks book codes for a handful of books.
const VPL_TO_USFM = {
  SOL: 'SNG', EZE: 'EZK', JOE: 'JOL', NAH: 'NAM', MAR: 'MRK', JOH: 'JHN', PHI: 'PHP',
  JAM: 'JAS', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN',
};

export function readVpl(file) {
  const map = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([1-3A-Z]{3}) (\d+):(\d+) (.*)$/);
    if (!m) continue;
    const book = VPL_TO_USFM[m[1]] ?? m[1];
    map.set(`${book}.${parseInt(m[2], 10)}.${parseInt(m[3], 10)}`, norm(m[4]));
  }
  return map;
}

/** Parse "PSA 23:1-3" or "PSA 23:1" or "JHN 3:16-4:2" into verse keys. */
export function parseRef(ref) {
  const m = ref.trim().match(/^([1-3]?[A-Z]{2,3})\s+(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/);
  if (!m) throw new Error(`Unrecognised reference "${ref}"`);
  const [, book, c1, v1, c2, v2] = m;
  return {
    book,
    startChapter: parseInt(c1, 10),
    startVerse: parseInt(v1, 10),
    endChapter: c2 ? parseInt(c2, 10) : parseInt(c1, 10),
    endVerse: v2 ? parseInt(v2, 10) : parseInt(v1, 10),
  };
}

export function expandRef(ref, verseMap) {
  const r = parseRef(ref);
  const keys = [];
  for (let c = r.startChapter; c <= r.endChapter; c++) {
    const from = c === r.startChapter ? r.startVerse : 1;
    const to = c === r.endChapter ? r.endVerse : 200;
    for (let v = from; v <= to; v++) {
      const key = `${r.book}.${c}.${v}`;
      if (verseMap.has(key)) keys.push(key);
      else if (c !== r.endChapter) break; // ran past end of chapter
      else if (v <= r.endVerse && c === r.endChapter && c === r.startChapter) {
        // missing verse inside an explicit range (e.g. omitted in critical text) — skip quietly
      }
    }
  }
  return keys;
}
