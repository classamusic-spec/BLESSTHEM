import { describe, expect, it } from 'vitest';
import type { NotificationPrefs, Person } from '@/data/models';
import { planNotices } from './notifications';

const prefs: NotificationPrefs = {
  morning: { enabled: true, time: '07:00' },
  evening: { enabled: true, time: '20:30' },
  specialMoments: true,
  permission: 'granted',
  asked: true,
};

const person = (id: string, name: string, pronouns: Person['pronouns']): Person => ({
  id,
  name,
  relationship: 'son',
  ageGroup: 'elementary',
  pronouns,
  focusTopics: ['courage'],
  hue: 'sage',
  order: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const people = [person('g', 'Gabriel', 'he'), person('j', 'Joshua', 'he')];
const now = new Date(2026, 9, 28, 9, 0); // 9:00 am, after today's morning reminder

describe('reminder planning', () => {
  it('plans a day ahead for the web', () => {
    const notices = planNotices(prefs, people, [], { now });
    expect(notices.map((n) => n.kind)).toEqual(['evening', 'morning']);
  });

  it('plans a week ahead for the native scheduler, rotating through people', () => {
    const notices = planNotices(prefs, people, [], { now, days: 7 });
    const mornings = notices.filter((n) => n.kind === 'morning');
    expect(mornings).toHaveLength(7);
    expect(notices.filter((n) => n.kind === 'evening')).toHaveLength(7);
    // Each morning names someone, and the names alternate day to day.
    const names = mornings.map((n) => (n.title.includes('Gabriel') ? 'G' : 'J'));
    for (let i = 1; i < names.length; i++) expect(names[i]).not.toBe(names[i - 1]);
    // Nothing in the past, nothing beyond the week, and every reminder opens a blessing.
    const horizon = now.getTime() + 7 * 86_400_000;
    for (const n of notices) {
      expect(n.at.getTime()).toBeGreaterThan(now.getTime());
      expect(n.at.getTime()).toBeLessThanOrEqual(horizon);
      expect(n.url.startsWith('/today')).toBe(true);
    }
    // Tags become native notification ids, so they must be unique.
    expect(new Set(notices.map((n) => n.tag)).size).toBe(notices.length);
  });

  it('never nags: the copy is pastoral', () => {
    const copy = planNotices(prefs, people, [], { now, days: 7 }).map((n) => `${n.title} ${n.body}`).join(' ');
    expect(copy).not.toMatch(/streak|don’t forget|missed|hurry/i);
  });
});
