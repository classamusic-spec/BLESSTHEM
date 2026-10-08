import type { Blessing } from '@/data/models';
import { addDays, monthDays, parseDayKey, type DayKey } from '@/lib/dates';

/**
 * Rhythm, not streaks. We count faithfulness gently (“12 days of prayer this month”)
 * and never frame a missed day as failure.
 */

export interface MonthRhythm {
  days: Array<{ day: DayKey; prayed: boolean; isToday: boolean; isFuture: boolean }>;
  prayedDays: number;
  /** Total completed blessings this month (several people can be blessed in a day). */
  blessings: number;
}

export function monthRhythm(blessings: Blessing[], today: DayKey, personId?: string): MonthRhythm {
  const days = monthDays(today);
  const month = today.slice(0, 7);
  const prayed = blessings.filter((b) => b.prayedAt && b.date.startsWith(month) && (!personId || b.personId === personId));
  const prayedSet = new Set(prayed.map((b) => b.date));
  return {
    days: days.map((day) => ({ day, prayed: prayedSet.has(day), isToday: day === today, isFuture: day > today })),
    prayedDays: prayedSet.size,
    blessings: prayed.length,
  };
}

/** Monday of the week that contains `day` (weeks run Monday to Sunday). */
export function weekStart(day: DayKey): DayKey {
  return addDays(day, -((parseDayKey(day).getDay() + 6) % 7));
}

export interface WeekSummary {
  week: DayKey;
  activeDays: number;
  blessings: number;
  peopleBlessed: number;
  peopleBlessed3Plus: number;
}

/**
 * Counts for one week of practice: the only view of a household’s rhythm that analytics
 * ever receives. No names, ids or text, just numbers, so the north-star metrics in
 * docs/ARCHITECTURE.md can be measured without knowing who anyone prays for.
 */
export function weekSummary(blessings: Blessing[], openDays: DayKey[], start: DayKey): WeekSummary {
  const end = addDays(start, 6);
  const inWeek = (d: DayKey) => d >= start && d <= end;
  const perPerson = new Map<string, number>();
  for (const b of blessings) if (b.prayedAt && inWeek(b.date)) perPerson.set(b.personId, (perPerson.get(b.personId) ?? 0) + 1);
  const counts = [...perPerson.values()];
  return {
    week: start,
    activeDays: new Set(openDays.filter(inWeek)).size,
    blessings: counts.reduce((sum, n) => sum + n, 0),
    peopleBlessed: counts.length,
    peopleBlessed3Plus: counts.filter((n) => n >= 3).length,
  };
}

export function prayedThisWeek(blessings: Blessing[], today: DayKey): number {
  const from = addDays(today, -6);
  return blessings.filter((b) => b.prayedAt && b.date >= from && b.date <= today).length;
}

/** A calm sentence about the month, never guilt-driven. */
export function rhythmLine(r: MonthRhythm, today: DayKey): string {
  const n = r.prayedDays;
  const dayOfMonth = Number(today.slice(8, 10));
  if (n === 0) return dayOfMonth <= 2 ? 'A new month, a fresh rhythm of prayer.' : 'There’s always room to begin again today.';
  if (n === 1) return '1 day of prayer this month.';
  return `${n} days of prayer this month.`;
}

export function encouragement(r: MonthRhythm, prayedToday: boolean): string {
  if (prayedToday) return 'Covered in prayer today.';
  if (r.prayedDays === 0) return 'Faithfulness isn’t perfection. Begin again today.';
  return 'One quiet minute is enough.';
}
