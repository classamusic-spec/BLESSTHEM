import { OCCASION_BY_ID } from '@/content/taxonomy';
import type { NotificationPrefs, Person, SpecialDate } from '@/data/models';
import { relationshipKind } from '@/engine/compose';
import { addDays, dayKey, nextOccurrence } from '@/lib/dates';

/**
 * Pastoral reminders — supporting the practice, never manipulating engagement.
 * Never: “You’re about to lose your streak!”
 *
 * On the web, reminders are scheduled while the app is open and delivered through the
 * service worker (tapping one opens the exact blessing). Native builds hand the same
 * planned notices to the OS scheduler; a push service can deliver them when closed.
 */

export interface PlannedNotice {
  at: Date;
  kind: 'morning' | 'evening' | 'special';
  title: string;
  body: string;
  url: string;
  tag: string;
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function currentPermission(): NotificationPrefs['permission'] {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPrefs['permission']> {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

const objectPronoun = (p: Person) => {
  if (relationshipKind(p) === 'family') return 'your family';
  return p.pronouns === 'he' ? 'him' : p.pronouns === 'she' ? 'her' : 'them';
};

export function morningCopy(person: Person) {
  const who = relationshipKind(person) === 'family' ? 'your family' : person.name;
  return {
    title: `A blessing for ${who} is ready.`,
    body: `Take one quiet minute to cover ${objectPronoun(person)} in prayer.`,
  };
}

export function eveningCopy() {
  return { title: 'Before today ends…', body: 'Is there someone you want to bless tonight?' };
}

export function specialCopy(person: Person, special: SpecialDate) {
  const occasion = OCCASION_BY_ID[special.occasion];
  return {
    title: occasion.noticeTitle.replace('{name}', person.name),
    body: occasion.noticeBody,
  };
}

function at(date: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h ?? 7, m ?? 0, 0, 0);
  return d;
}

/** Notices for the next 24 hours, rotating the morning reminder across people. */
export function planNotices(
  prefs: NotificationPrefs,
  people: Person[],
  specialDates: SpecialDate[],
  opts: { now?: Date; prayedToday?: Set<string>; specialEnabled?: boolean } = {},
): PlannedNotice[] {
  const now = opts.now ?? new Date();
  if (!people.length) return [];
  const notices: PlannedNotice[] = [];
  const horizon = now.getTime() + 24 * 3_600_000;

  for (const offset of [0, 1]) {
    const day = new Date(now);
    day.setDate(day.getDate() + offset);
    const key = dayKey(day);

    if (prefs.morning.enabled) {
      const when = at(day, prefs.morning.time);
      const dayIndex = Math.floor(when.getTime() / 86_400_000);
      const person = people[dayIndex % people.length];
      notices.push({
        at: when,
        kind: 'morning',
        ...morningCopy(person),
        url: `/today?person=${person.id}&from=notification&kind=morning`,
        tag: `morning-${key}`,
      });
    }
    if (prefs.evening.enabled) {
      notices.push({ at: at(day, prefs.evening.time), kind: 'evening', ...eveningCopy(), url: '/today?from=notification&kind=evening', tag: `evening-${key}` });
    }
    if (prefs.specialMoments && opts.specialEnabled !== false) {
      // The evening before a special moment.
      const tomorrow = addDays(key, 1);
      for (const s of specialDates) {
        const next = nextOccurrence(s.date, s.yearly, key);
        const person = people.find((p) => p.id === s.personId);
        if (person && next === tomorrow) {
          notices.push({
            at: at(day, '18:30'),
            kind: 'special',
            ...specialCopy(person, s),
            url: `/today?person=${person.id}&from=notification&kind=special`,
            tag: `special-${s.id}-${tomorrow}`,
          });
        }
      }
    }
  }
  return notices.filter((n) => n.at.getTime() > now.getTime() && n.at.getTime() <= horizon).sort((a, b) => a.at.getTime() - b.at.getTime());
}

export async function showNotice(n: Pick<PlannedNotice, 'title' | 'body' | 'url' | 'tag'>): Promise<boolean> {
  if (currentPermission() !== 'granted') return false;
  const options: NotificationOptions = {
    body: n.body,
    tag: n.tag,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: n.url },
  };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) {
      await reg.showNotification(n.title, options);
    } else {
      const notification = new Notification(n.title, options);
      notification.onclick = () => {
        window.focus();
        window.location.assign(n.url);
      };
    }
    return true;
  } catch {
    return false;
  }
}

let timers: number[] = [];

export function scheduleWhileOpen(notices: PlannedNotice[]) {
  timers.forEach((t) => window.clearTimeout(t));
  timers = notices.map((n) => window.setTimeout(() => void showNotice(n), Math.max(0, n.at.getTime() - Date.now())));
}
