import { LockSimple } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { JOURNEYS } from '@/content/journeys';
import { isPlus, useStore } from '@/data/store';
import { ProgressRing } from '@/design/Controls';
import { Page, PageHeader } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { TopicIcon } from '@/design/TopicIcon';
import { cx } from '@/lib/cx';
import styles from './Journeys.module.css';

export default function JourneysPage() {
  const plus = useStore(isPlus);
  const progress = useStore((s) => s.journeys);

  return (
    <Page>
      <PageHeader back="/library" title="Prayer journeys" subtitle="Short, guided paths of blessing — a few quiet minutes a day for a season that matters." />
      <motion.ul role="list" className={styles.list} variants={stagger(0.06)} initial="hidden" animate="show">
        {JOURNEYS.map((j) => {
          const active = progress.find((p) => p.journeyId === j.id && !p.finishedAt);
          return (
            <motion.li key={j.id} variants={fadeUp}>
              <Link to={`/library/journeys/${j.id}`} className={cx(styles.card, styles[`tone-${j.tone}`])}>
                <span className={styles.cardIcon}>
                  <TopicIcon name={j.icon} size={26} />
                </span>
                <span className={styles.cardText}>
                  <span className={styles.cardLength}>{j.days.length} days</span>
                  <span className={styles.cardTitle}>{j.title}</span>
                  <span className={styles.cardSub}>{j.subtitle}</span>
                </span>
                {active ? (
                  <ProgressRing value={active.completedDays.length / j.days.length} size={42}>
                    {active.completedDays.length}
                  </ProgressRing>
                ) : (
                  !plus && <LockSimple size={16} weight="bold" className={styles.lock} aria-label="Bless Them+" />
                )}
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </Page>
  );
}
