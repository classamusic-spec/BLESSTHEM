import { describe, expect, it } from 'vitest';
import { ENTRY_BY_ID } from '@/content/blessings';
import type { Blessing, Person } from '@/data/models';
import { addDays } from '@/lib/dates';
import { composeBlessing, fillTemplate, headingName, prayerName, talkStage } from './compose';
import { chooseDaily, defaultTopicsFor, entrySuits, topicSuits } from './personalize';
import { monthRhythm, rhythmLine } from './rhythm';
import { checkSafety } from './safety';
import { classifyTopics, detectAge, search } from './search';

const person = (patch: Partial<Person> = {}): Person => ({
  id: 'p1',
  name: 'Noah',
  relationship: 'son',
  ageGroup: 'elementary',
  pronouns: 'he',
  focusTopics: ['courage', 'friendship', 'kindness'],
  hue: 'sage',
  order: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...patch,
});

describe('composition', () => {
  const template = 'Father, give {name} courage. Remind {them} that {their} worth is not earned. {Name}’s heart is yours. Amen.';

  it('fills names and pronouns', () => {
    expect(fillTemplate(template, person())).toBe('Father, give Noah courage. Remind him that his worth is not earned. Noah’s heart is yours. Amen.');
    expect(fillTemplate(template, person({ name: 'Ella', pronouns: 'she', relationship: 'daughter' }))).toContain('Remind her that her worth');
    expect(fillTemplate(template, person({ name: 'Sam', pronouns: 'they', relationship: 'child' }))).toContain('Remind them that their worth');
  });

  it('prays for a family as “our family”, capitalized at sentence start', () => {
    const family = person({ name: 'The Millers', relationship: 'family', pronouns: 'they', ageGroup: undefined });
    expect(prayerName(family)).toBe('our family');
    expect(headingName(family)).toBe('your family');
    const filled = fillTemplate(template, family);
    expect(filled).toContain('give our family courage');
    expect(filled).toContain('Our family’s heart');
    expect(filled).toContain('Remind them');
  });

  it('chooses an age-appropriate conversation prompt', () => {
    expect(talkStage(person({ ageGroup: 'baby' }))).toBe('little');
    expect(talkStage(person({ ageGroup: 'tween' }))).toBe('child');
    expect(talkStage(person({ ageGroup: 'teen' }))).toBe('teen');
    expect(talkStage(person({ relationship: 'wife', ageGroup: undefined }))).toBe('adult');
  });

  it('composes a full blessing with verified Scripture', () => {
    const entry = [...ENTRY_BY_ID.values()][0];
    const c = composeBlessing(entry, person());
    expect(c.passage).not.toBeNull();
    expect(c.prayer).not.toMatch(/\{|\}/);
    expect(c.blessing).not.toMatch(/\{|\}/);
    expect(c.speakHeading).toBe('Speak this over Noah');
    expect(c.shareLine).toMatch(/^Today I’m praying .+ over Noah\.$/);
  });
});

describe('personalization', () => {
  it('is stable for a person on a given day', () => {
    const a = chooseDaily({ person: person(), date: '2026-10-07', history: [], hour: 8 });
    const b = chooseDaily({ person: person(), date: '2026-10-07', history: [], hour: 8 });
    expect(a?.entry.id).toBe(b?.entry.id);
  });

  it('only chooses passages that suit the person’s age and relationship', () => {
    for (const ageGroup of ['baby', 'preschool', 'teen', 'adult'] as const) {
      const p = person({ ageGroup, focusTopics: [] });
      for (let d = 0; d < 20; d++) {
        const choice = chooseDaily({ person: p, date: addDays('2026-10-01', d), history: [] });
        expect(choice, ageGroup).not.toBeNull();
        expect(entrySuits(choice!.entry, p), `${ageGroup} got ${choice!.entry.id}`).toBe(true);
      }
    }
  });

  it('does not repeat a passage within a week', () => {
    const p = person();
    const history: Blessing[] = [];
    for (let d = 0; d < 14; d++) {
      const date = addDays('2026-10-01', d);
      const choice = chooseDaily({ person: p, date, history })!;
      const lastWeek = history.filter((b) => b.date >= addDays(date, -7)).map((b) => b.entryId);
      expect(lastWeek).not.toContain(choice.entry.id);
      history.push({ id: `b${d}`, personId: p.id, date, entryId: choice.entry.id, topicId: choice.topicId, source: 'daily', createdAt: date });
    }
  });

  it('honours a chosen focus', () => {
    const choice = chooseDaily({ person: person(), date: '2026-10-07', history: [], topic: 'kindness' });
    expect(choice?.topicId).toBe('kindness');
  });

  it('prepares an occasion blessing for special moments when enabled', () => {
    const p = person({ ageGroup: 'preschool' });
    const special = [{ id: 's1', personId: p.id, occasion: 'birthday' as const, date: '2020-10-08', yearly: true, createdAt: '' }];
    const on = chooseDaily({ person: p, date: '2026-10-07', history: [], specialDates: special, occasionsEnabled: true });
    expect(on?.occasionId).toBe('birthday');
    const off = chooseDaily({ person: p, date: '2026-10-07', history: [], specialDates: special, occasionsEnabled: false });
    expect(off?.occasionId).toBeUndefined();
  });

  it('never offers dating or work topics for a baby', () => {
    const baby = person({ ageGroup: 'baby' });
    expect(topicSuits('dating', baby)).toBe(false);
    expect(topicSuits('work', baby)).toBe(false);
    expect(defaultTopicsFor(baby).every((t) => topicSuits(t, baby))).toBe(true);
  });
});

describe('natural-language search', () => {
  const topics = (q: string) => classifyTopics(q).map((t) => t.topic);

  it('understands what parents actually type', () => {
    expect(topics('My daughter is afraid of starting middle school').slice(0, 4)).toEqual(expect.arrayContaining(['fear', 'school']));
    expect(topics('Prayer for my son who is being bullied')[0]).toBe('bullying');
    expect(topics('Scripture for my teenager making bad choices')).toEqual(expect.arrayContaining(['temptation', 'wisdom']));
    expect(topics('Prayer before an exam')[0]).toBe('exams');
    expect(topics('she can’t sleep, nightmares every night')).toContain('sleep');
  });

  it('notices age hints', () => {
    expect(detectAge('my teenager')).toBe('teen');
    expect(detectAge('our toddler')).toBe('preschool');
    expect(detectAge('starting middle school')).toBe('tween');
  });

  it('returns passages to pray with', () => {
    const r = search('friendship rejection');
    expect(r.entries.length).toBeGreaterThan(0);
    expect(r.topics.map((t) => t.topic)).toEqual(expect.arrayContaining(['friendship', 'rejection']));
  });
});

describe('safety', () => {
  it('recognises crisis language', () => {
    expect(checkSafety('my son said he wants to kill himself')?.category).toBe('self-harm');
    expect(checkSafety('I think she is being abused')?.category).toBe('abuse');
    expect(checkSafety('he hits me when he is angry')?.category).toBe('violence');
    expect(checkSafety('my toddler swallowed pills')?.category).toBe('medical');
    expect(checkSafety('my teen has an eating disorder')?.urgent).toBe(false);
  });

  it('does not alarm on everyday worries', () => {
    for (const ok of ['afraid of starting middle school', 'big math test Thursday', 'feels left out at recess', 'kill the lights at bedtime', 'struggling with friends']) {
      expect(checkSafety(ok), ok).toBeNull();
    }
  });
});

describe('rhythm', () => {
  it('counts days of prayer without shaming missed days', () => {
    const b = (date: string, prayed: boolean): Blessing => ({ id: date, personId: 'p1', date, entryId: 'x', topicId: 'faith', source: 'daily', createdAt: date, prayedAt: prayed ? date : undefined });
    const r = monthRhythm([b('2026-10-01', true), b('2026-10-02', false), b('2026-10-03', true)], '2026-10-07');
    expect(r.prayedDays).toBe(2);
    expect(rhythmLine(r, '2026-10-07')).toBe('2 days of prayer this month.');
    expect(rhythmLine(monthRhythm([], '2026-10-07'), '2026-10-07')).toBe('There’s always room to begin again today.');
  });
});
