import { useEffect, useState } from 'react';
import { dayKey, type DayKey } from '@/lib/dates';

/** The current local day, updating at midnight and when the app returns to the foreground. */
export function useToday(): DayKey {
  const [today, setToday] = useState(dayKey);
  useEffect(() => {
    const check = () => setToday((prev) => (prev === dayKey() ? prev : dayKey()));
    const id = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return today;
}
