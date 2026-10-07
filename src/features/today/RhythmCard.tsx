import { motion } from 'motion/react';
import { useMemo } from 'react';
import { useStore } from '@/data/store';
import { PersonAvatar } from '@/design/PersonAvatar';
import { monthRhythm, rhythmLine } from '@/engine/rhythm';
import { useToday } from '@/hooks/useToday';
import { parseDayKey } from '@/lib/dates';
import { cx } from '@/lib/cx';
import styles from './RhythmCard.module.css';

/**
 * Rhythm, not streaks: a soft month of light. Missed days are simply quiet —
 * “Faithfulness isn’t perfection. Begin again today.”
 */
export function RhythmCard() {
  const today = useToday();
  const blessings = useStore((s) => s.blessings);
  const people = useStore((s) => s.people);
  const rhythm = useMemo(() => monthRhythm(blessings, today), [blessings, today]);
  const perPerson = useMemo(
    () =>
      people
        .map((p) => ({ person: p, count: monthRhythm(blessings, today, p.id).blessings }))
        .filter((x) => x.count > 0),
    [people, blessings, today],
  );
  const monthName = parseDayKey(today).toLocaleDateString(undefined, { month: 'long' });
  const prayedToday = rhythm.days.find((d) => d.isToday)?.prayed;
  const offset = parseDayKey(rhythm.days[0].day).getDay();

  return (
    <section className={styles.card} aria-labelledby="rhythm-title">
      <div className={styles.head}>
        <div>
          <h2 id="rhythm-title" className={styles.title}>
            Your rhythm in {monthName}
          </h2>
          <p className={styles.line}>{rhythmLine(rhythm, today)}</p>
        </div>
      </div>

      <div className={styles.calendar} role="img" aria-label={`${rhythm.prayedDays} days of prayer so far in ${monthName}.`}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`h${i}`} className={styles.weekday} aria-hidden="true">
            {d}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`o${i}`} aria-hidden="true" />
        ))}
        {rhythm.days.map((d, i) => (
          <motion.span
            key={d.day}
            aria-hidden="true"
            className={cx(styles.day, d.prayed && styles.prayed, d.isToday && styles.today, d.isFuture && styles.future)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.02 * i, duration: 0.3 }}
          />
        ))}
      </div>

      {perPerson.length > 0 ? (
        <ul role="list" className={styles.people}>
          {perPerson.map(({ person, count }) => (
            <li key={person.id} className={styles.personRow}>
              <PersonAvatar person={person} size={28} />
              <span>
                You’ve blessed <strong>{person.name}</strong> {count === 1 ? 'once' : `${count} times`} this month.
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.encourage}>{prayedToday ? 'Covered in prayer today.' : 'Faithfulness isn’t perfection. Begin again today.'}</p>
      )}
    </section>
  );
}
