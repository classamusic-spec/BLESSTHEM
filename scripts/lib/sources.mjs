/**
 * Downloads and caches the public-domain source texts from eBible.org.
 * Sources live in /scripture-src (git-ignored); the app ships only the
 * extracted, verified subset in src/content/scripture/*.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SRC_DIR = path.join(ROOT, 'scripture-src');

export const TRANSLATIONS = {
  bsb: {
    id: 'bsb',
    name: 'Berean Standard Bible',
    abbreviation: 'BSB',
    license: 'Public Domain',
    publisher: 'BSB Publishing, LLC',
    url: 'https://berean.bible',
    usfm: 'engbsb_usfm.zip',
    vpl: 'engbsb_vpl.zip',
    vplFile: 'engbsb_vpl.txt',
  },
  web: {
    id: 'web',
    name: 'World English Bible',
    abbreviation: 'WEB',
    license: 'Public Domain',
    publisher: 'eBible.org',
    url: 'https://worldenglish.bible',
    usfm: 'eng-web_usfm.zip',
    vpl: 'eng-web_vpl.zip',
    vplFile: 'eng-web_vpl.txt',
  },
};

function download(file) {
  const dest = path.join(SRC_DIR, file);
  if (fs.existsSync(dest)) return dest;
  fs.mkdirSync(SRC_DIR, { recursive: true });
  console.log(`Downloading ${file} from eBible.org…`);
  execFileSync('curl', ['-sSfL', '-o', dest, `https://ebible.org/Scriptures/${file}`], { stdio: 'inherit' });
  return dest;
}

function unzip(zip, dir) {
  if (fs.existsSync(dir) && fs.readdirSync(dir).length) return dir;
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('unzip', ['-o', '-q', zip, '-d', dir]);
  return dir;
}

export function ensureSources(id) {
  const t = TRANSLATIONS[id];
  const usfmDir = unzip(download(t.usfm), path.join(SRC_DIR, `${id}_usfm`));
  const vplDir = unzip(download(t.vpl), path.join(SRC_DIR, `${id}_vpl`));
  return { usfmDir, vplPath: path.join(vplDir, t.vplFile) };
}
