/**
 * Dates in Bless Them are local calendar days ("YYYY-MM-DD"), because a
 * blessing belongs to the day the parent experiences, not to UTC.
 */

export type DayKey = string; // YYYY-MM-DD

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(d: Date = new Date()): DayKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: DayKey, days: number): DayKey {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

export function daysBetween(a: DayKey, b: DayKey): number {
  const ms = parseDayKey(b).getTime() - parseDayKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export type Daypart = 'morning' | 'day' | 'evening' | 'night';

export function daypart(d: Date = new Date()): Daypart {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h >= 4 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 22) return 'Good evening';
  return 'Peace to you tonight';
}

export function formatLongDate(key: DayKey | Date): string {
  const d = typeof key === 'string' ? parseDayKey(key) : key;
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatShortDate(key: DayKey | Date): string {
  const d = typeof key === 'string' ? parseDayKey(key) : key;
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

/** "Today", "Yesterday", weekday within a week, else short date. */
export function formatRelativeDay(key: DayKey, today: DayKey = dayKey()): string {
  const diff = daysBetween(key, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) return parseDayKey(key).toLocaleDateString(undefined, { weekday: 'long' });
  return formatShortDate(key);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Days in the month containing `key`, as day keys. */
export function monthDays(key: DayKey): DayKey[] {
  const d = parseDayKey(key);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const count = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => dayKey(new Date(first.getFullYear(), first.getMonth(), i + 1)));
}

/** Next occurrence (today or later) of a date, repeating yearly when asked. */
export function nextOccurrence(date: DayKey, yearly: boolean, today: DayKey = dayKey()): DayKey | null {
  if (!yearly) return daysBetween(today, date) >= 0 ? date : null;
  const [, m, d] = date.split('-').map(Number);
  const t = parseDayKey(today);
  let candidate = dayKey(new Date(t.getFullYear(), (m ?? 1) - 1, d ?? 1));
  if (daysBetween(today, candidate) < 0) candidate = dayKey(new Date(t.getFullYear() + 1, (m ?? 1) - 1, d ?? 1));
  return candidate;
}
