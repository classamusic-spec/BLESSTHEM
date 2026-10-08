import { useEffect, useState } from 'react';
import { daypart, type Daypart } from '@/lib/dates';

/** The current part of the day, kept fresh while the app is open. */
export function useDaypart(): Daypart {
  const [part, setPart] = useState<Daypart>(() => daypart());
  useEffect(() => {
    const id = window.setInterval(() => setPart(daypart()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return part;
}
