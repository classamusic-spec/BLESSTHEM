import { CaretRight } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { OCCASION_BY_ID } from '@/content/taxonomy';
import { isPlus, useStore } from '@/data/store';
import { TopicIcon } from '@/design/TopicIcon';
import { upcomingMoments } from '@/engine/personalize';
import { useToday } from '@/hooks/useToday';
import { formatShortDate } from '@/lib/dates';
import styles from './UpcomingMoments.module.css';

/** Saved special moments in the next week, so the blessing is ready when it matters. */
export function UpcomingMoments() {
  const today = useToday();
  const people = useStore((s) => s.people);
  const specialDates = useStore((s) => s.specialDates);
  const plus = useStore(isPlus);
  const moments = upcomingMoments(people, specialDates, today, 7).slice(0, 2);
  if (!moments.length) return null;

  return (
    <div className={styles.list}>
      {moments.map(({ special, inDays, person, next }) => {
        const occasion = OCCASION_BY_ID[special.occasion];
        const when = inDays === 0 ? 'Today' : inDays === 1 ? 'Tomorrow' : `In ${inDays} days · ${formatShortDate(next)}`;
        return (
          <Link key={special.id} to={plus ? `/people/${person!.id}` : '/plus'} className={styles.moment}>
            <span className={styles.icon}>
              <TopicIcon name={occasion.icon} size={20} />
            </span>
            <span className={styles.text}>
              <strong>
                {person!.name} · {occasion.label}
              </strong>
              <small>{when}{plus ? (inDays <= 1 ? ' — a special blessing is ready' : '') : ' — special-moment blessings with Bless Them+'}</small>
            </span>
            <CaretRight size={16} weight="bold" className={styles.chev} />
          </Link>
        );
      })}
    </div>
  );
}
