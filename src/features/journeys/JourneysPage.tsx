import { LockSimple } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { JOURNEYS } from '@/content/journeys';
import { isPlus, useStore } from '@/data/store';
import { ProgressRing } from '@/design/Controls';
import { Page, PageHeader } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { PhotoCard } from '@/design/PhotoCard';
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
              <PhotoCard
                to={`/library/journeys/${j.id}`}
                scene={j.scene}
                size="tile"
                kicker={`${j.days.length} days`}
                title={j.title}
                body={j.subtitle}
                accessory={
                  active ? (
                    <ProgressRing value={active.completedDays.length / j.days.length} size={42}>
                      {active.completedDays.length}
                    </ProgressRing>
                  ) : !plus ? (
                    <LockSimple size={16} weight="bold" aria-label="Bless Them+" />
                  ) : undefined
                }
              />
            </motion.li>
          );
        })}
      </motion.ul>
    </Page>
  );
}
