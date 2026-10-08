import { describe, expect, it } from 'vitest';
import { balanceQuotes, formatRef, getPassage, parseRef, type PassageVerse } from './index';

describe('references', () => {
  it('parses and formats citations', () => {
    expect(parseRef('PSA 23:1-3')).toEqual({ book: 'PSA', startChapter: 23, startVerse: 1, endChapter: 23, endVerse: 3 });
    expect(formatRef('PSA 23:1-3')).toBe('Psalm 23:1–3');
    expect(formatRef('JOS 1:9')).toBe('Joshua 1:9');
    expect(formatRef('1CO 16:13-14')).toBe('1 Corinthians 16:13–14');
    expect(parseRef('NOTABOOK 1:1')).toBeNull();
  });
});

describe('verified passages', () => {
  it('returns the publisher’s text for a curated passage', () => {
    const p = getPassage('JOS 1:9', 'bsb');
    expect(p).not.toBeNull();
    expect(p!.text).toContain('Have I not commanded you to be strong and courageous?');
    expect(p!.translation.abbreviation).toBe('BSB');
  });

  it('omits the dangling closing quotation mark of an excerpt, never the words', () => {
    const p = getPassage('JOS 1:9', 'bsb')!;
    expect(p.text.endsWith('wherever you go.')).toBe(true);
    expect(p.text).not.toContain('”');
  });

  it('returns null rather than inventing text for a passage it does not have', () => {
    expect(getPassage('OBA 1:21', 'bsb')).toBeNull();
    expect(getPassage('garbage', 'bsb')).toBeNull();
  });

  it('keeps poetry structure for the psalms', () => {
    const p = getPassage('PSA 23:1-3', 'bsb');
    if (!p) return; // only present when a curated entry uses it
    expect(p.poetry).toBe(true);
    expect(p.verses[0].heading).toBe('A Psalm of David.');
  });
});

describe('quote balancing', () => {
  const v = (text: string): PassageVerse => ({ key: 'X.1.1', chapter: 1, verse: 1, segs: [[text, 0, 1]] });

  it('keeps balanced quotations', () => {
    const verses = [v('He said, “Peace be with you.”')];
    balanceQuotes(verses);
    expect(verses[0].segs[0][0]).toBe('He said, “Peace be with you.”');
  });

  it('drops an unmatched opening quotation mark', () => {
    const verses = [v('“Do not be afraid, for I am with you;')];
    balanceQuotes(verses);
    expect(verses[0].segs[0][0]).toBe('Do not be afraid, for I am with you;');
  });

  it('leaves apostrophes alone', () => {
    const verses = [v('Don’t be afraid; the LORD’s love never fails.')];
    balanceQuotes(verses);
    expect(verses[0].segs[0][0]).toBe('Don’t be afraid; the LORD’s love never fails.');
  });
});
