import { useEffect } from 'react';
import { currentBlessing, isPlus, useStore } from '@/data/store';
import { dayKey } from '@/lib/dates';
import { currentPermission, planNotices, scheduleWhileOpen } from '@/services/notifications';

/** Keeps the next day of gentle reminders scheduled while the app is open. */
export function useNotificationScheduler() {
  const prefs = useStore((s) => s.notifications);
  const people = useStore((s) => s.people);
  const specialDates = useStore((s) => s.specialDates);
  const blessings = useStore((s) => s.blessings);
  const plus = useStore(isPlus);
  const onboarded = useStore((s) => s.onboarded);

  useEffect(() => {
    if (!onboarded || currentPermission() !== 'granted') {
      scheduleWhileOpen([]);
      return;
    }
    const today = dayKey();
    const prayedToday = new Set(people.filter((p) => currentBlessing(blessings, p.id, today)?.prayedAt).map((p) => p.id));
    const notices = planNotices(prefs, people, specialDates, { prayedToday, specialEnabled: plus }).filter(
      // No evening nudge if everyone has already been blessed today.
      (n) => !(n.kind === 'evening' && n.at.toDateString() === new Date().toDateString() && prayedToday.size === people.length),
    );
    scheduleWhileOpen(notices);
  }, [prefs, people, specialDates, blessings, plus, onboarded]);
}
