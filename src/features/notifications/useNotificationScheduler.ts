import { App } from '@capacitor/app';
import { useEffect, useState } from 'react';
import { currentBlessing, isPlus, useStore } from '@/data/store';
import { dayKey } from '@/lib/dates';
import { planNotices, planningDays, scheduleReminders, syncPermission } from '@/services/notifications';
import { isNative } from '@/services/platform';

/**
 * Keeps gentle reminders scheduled: a day ahead while the web app is open, or a week ahead
 * in the phone's own scheduler in the native app, re-planned whenever the app comes back.
 */
export function useNotificationScheduler() {
  const prefs = useStore((s) => s.notifications);
  const people = useStore((s) => s.people);
  const specialDates = useStore((s) => s.specialDates);
  const blessings = useStore((s) => s.blessings);
  const plus = useStore(isPlus);
  const onboarded = useStore((s) => s.onboarded);
  const update = useStore((s) => s.updateNotifications);
  // Bumped when the native app returns to the foreground, so the week rolls forward.
  const [resumed, setResumed] = useState(0);

  useEffect(() => {
    if (!isNative()) return;
    const sub = App.addListener('appStateChange', ({ isActive }) => isActive && setResumed((n) => n + 1));
    return () => void sub.then((s) => s.remove());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const permission = await syncPermission();
      if (cancelled) return;
      if (isNative() && permission !== prefs.permission) update({ permission });
      if (!onboarded || permission !== 'granted') {
        scheduleReminders([]);
        return;
      }
      const today = dayKey();
      const prayedToday = new Set(people.filter((p) => currentBlessing(blessings, p.id, today)?.prayedAt).map((p) => p.id));
      const notices = planNotices(prefs, people, specialDates, { prayedToday, specialEnabled: plus, days: planningDays() }).filter(
        // No evening nudge if everyone has already been blessed today.
        (n) => !(n.kind === 'evening' && n.at.toDateString() === new Date().toDateString() && prayedToday.size === people.length),
      );
      scheduleReminders(notices);
    })();
    return () => {
      cancelled = true;
    };
  }, [prefs, people, specialDates, blessings, plus, onboarded, update, resumed]);
}
