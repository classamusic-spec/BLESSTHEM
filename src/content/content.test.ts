import { beforeAll, describe, expect, it } from 'vitest';
import { ENTRIES, ENTRY_BY_ID } from './blessings';
import { JOURNEYS } from './journeys';
import { getPassage, loadTranslation } from './scripture';
import { OCCASIONS, TOPICS, TOPIC_BY_ID } from './taxonomy';
import { journeyPlan } from '@/engine/journeys';
import type { Person } from '@/data/models';

/**
 * Content integrity: the curated library is the product’s theological backbone.
 * These checks run in CI so no entry can ship with a broken reference, a stray
 * template token, or language that crosses Bless Them’s guardrails.
 */

beforeAll(async () => {
  await loadTranslation('web');
});

const TEXT_FIELDS = (e: (typeof ENTRIES)[number]) => [e.contextNote, e.reflection, e.blessing, e.prayer, ...Object.values(e.talk)];

describe('curated content', () => {
  it('has a substantial library', () => {
    expect(ENTRIES.length).toBeGreaterThanOrEqual(150);
  });

  it('uses unique, well-formed ids', () => {
    expect(new Set(ENTRIES.map((e) => e.id)).size).toBe(ENTRIES.length);
    for (const e of ENTRIES) expect(e.id).toMatch(/^[a-z-]+-[1-3a-z]{3}-\d+-\d+$/);
  });

  it('only uses topics, ages and occasions from the taxonomy', () => {
    const occasionIds = new Set(OCCASIONS.map((o) => o.id));
    for (const e of ENTRIES) {
      expect(TOPIC_BY_ID[e.topic], e.id).toBeDefined();
      expect(e.ages.length, e.id).toBeGreaterThan(0);
      for (const o of e.occasions ?? []) expect(occasionIds.has(o), `${e.id} ${o}`).toBe(true);
    }
  });

  it('resolves every passage and its context in both translations', () => {
    for (const e of ENTRIES) {
      for (const t of ['bsb', 'web'] as const) {
        expect(getPassage(e.ref, t), `${e.id} ${e.ref} (${t})`).not.toBeNull();
        expect(getPassage(e.contextRef, t), `${e.id} ${e.contextRef} (${t})`).not.toBeNull();
      }
    }
  });

  it('only uses the supported template tokens (never {they})', () => {
    const allowed = new Set(['{name}', '{Name}', '{them}', '{Them}', '{their}', '{Their}', '{theirs}', '{themselves}']);
    for (const e of ENTRIES) for (const text of TEXT_FIELDS(e)) for (const tok of text?.match(/\{[^}]*\}/g) ?? []) expect(allowed.has(tok), `${e.id}: ${tok}`).toBe(true);
  });

  it('never speaks for God, guarantees outcomes, or uses prosperity framing', () => {
    const forbidden = [
      /god (told|tells) (me|you|us)/i,
      /the lord (revealed|told)/i,
      /god promises (that )?(you|he|she|they) will/i,
      /\bguarantee/i,
      /you will (be healed|pass|win|never)/i,
      /nothing bad (will|can) (ever )?happen/i,
      /everything happens for a reason/i,
      /\b(wealth|wealthy|prosperity|manifest)\b/i,
      /if (you|they) had (more|enough) faith/i,
    ];
    for (const e of ENTRIES) for (const text of TEXT_FIELDS(e)) for (const re of forbidden) expect(re.test(text ?? ''), `${e.id}: ${re}`).toBe(false);
  });

  it('keeps prayers addressed to God, personal, and complete', () => {
    for (const e of ENTRIES) {
      expect(e.prayer, e.id).toMatch(/\{name\}|\{Name\}/);
      expect(e.prayer.trim(), e.id).toMatch(/Amen\.$/);
    }
  });

  it('covers every topic in the taxonomy with at least three passages', () => {
    for (const t of TOPICS) {
      const n = ENTRIES.filter((e) => e.topic === t.id).length;
      expect(n, `${t.id} has ${n}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('offers something for little ones in the core topics', () => {
    for (const topic of ['faith', 'fear', 'sleep', 'protection', 'kindness'] as const) {
      expect(ENTRIES.some((e) => e.topic === topic && e.ages.includes('baby') && e.talk.little), topic).toBe(true);
    }
  });
});

describe('prayer journeys', () => {
  const child = (age: Person['ageGroup'], relationship: Person['relationship'] = 'son'): Person => ({
    id: `p-${age}-${relationship}`,
    name: 'Gabriel',
    relationship,
    ageGroup: age,
    pronouns: 'he',
    focusTopics: [],
    hue: 'sage',
    order: 0,
    createdAt: new Date().toISOString(),
  });

  it('resolves a passage for every day, without repeats, for the people each journey is for', () => {
    const people = [child('elementary'), child('teen'), child('young-adult'), child('adult', 'wife'), child('preschool')];
    for (const j of JOURNEYS) {
      for (const p of people) {
        if (j.relationships && !j.relationships.includes(p.relationship === 'wife' ? 'spouse' : 'child')) continue;
        if (j.ages && p.ageGroup && !j.ages.includes(p.ageGroup)) continue;
        const plan = journeyPlan(j, p);
        expect(plan.every((d) => d.entry), `${j.id} for ${p.ageGroup}`).toBe(true);
        const ids = plan.map((d) => d.entry!.id);
        expect(new Set(ids).size, `${j.id} repeats for ${p.ageGroup}`).toBe(ids.length);
      }
    }
  });

  it('references real entries', () => {
    for (const j of JOURNEYS) for (const d of j.days) expect(TOPIC_BY_ID[d.topic], `${j.id}: ${d.topic}`).toBeDefined();
    expect(ENTRY_BY_ID.size).toBe(ENTRIES.length);
  });
});
