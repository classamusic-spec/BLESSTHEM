import { CaretRight, MagnifyingGlass, Path } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { entriesForTopic } from '@/content/blessings';
import { collectionInSeason, JOURNEYS } from '@/content/journeys';
import { CATEGORIES, TOPICS } from '@/content/taxonomy';
import { isPlus, useStore } from '@/data/store';
import { Page, PageHeader, Section } from '@/design/Layout';
import { PhotoCard } from '@/design/PhotoCard';
import { fadeUp, stagger } from '@/design/motion';
import { TopicCard } from '@/design/Topic';
import { TopicIcon } from '@/design/TopicIcon';
import { track } from '@/services/analytics';
import styles from './LibraryPage.module.css';

const SUGGESTIONS = ['afraid of starting middle school', 'being left out', 'a big test tomorrow', 'can’t sleep'];

export default function LibraryPage() {
  const plus = useStore(isPlus);
  const now = new Date();
  const season = collectionInSeason(`${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);

  useEffect(() => {
    track({ name: 'library_opened' });
  }, []);

  return (
    <Page>
      <PageHeader title="Library" subtitle="Scripture blessings for every season of their lives." scene="forest-river" />

      <Link to="/library/search" className={styles.search}>
        <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
        <span className={styles.searchText}>What’s on your heart?</span>
      </Link>
      <div className={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Link key={s} to={`/library/search?q=${encodeURIComponent(s)}`} className={styles.suggestion}>
            {s}
          </Link>
        ))}
      </div>

      <motion.div className={styles.features} variants={stagger(0.08)} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <PhotoCard
            to="/library/journeys"
            scene="mountain-sunrise"
            kicker="Prayer journeys"
            title="Guided blessings, day by day"
            body={`${JOURNEYS.length} journeys — courage, bedtime peace, your teen, your marriage.`}
            accessory={<Path size={28} weight="duotone" />}
          />
        </motion.div>
        {season && (
          <motion.div variants={fadeUp}>
            <PhotoCard
              to={`/library/collection/${season.id}`}
              scene={season.scene}
              kicker="In season"
              title={season.title}
              body={season.subtitle}
              accessory={<TopicIcon name={season.icon} size={28} />}
            />
          </motion.div>
        )}
      </motion.div>

      {CATEGORIES.map((c) => {
        const topics = TOPICS.filter((t) => t.category === c.id && entriesForTopic(t.id).length > 0);
        if (!topics.length) return null;
        return (
          <Section key={c.id} title={c.title} id={`cat-${c.id}`}>
            <p className={styles.categorySub}>{c.subtitle}</p>
            <div className={styles.grid}>
              {topics.map((t) => (
                <TopicCard
                  key={t.id}
                  to={`/library/topic/${t.id}`}
                  title={t.title}
                  icon={t.icon}
                  tone={c.id === 'hard-seasons' ? 'blue' : c.id === 'everyday' || c.id === 'future' ? 'sand' : 'sage'}
                  meta={`${entriesForTopic(t.id).length} blessings`}
                  locked={!plus && !t.free}
                />
              ))}
            </div>
          </Section>
        );
      })}

      <Link to="/library/journeys" className={styles.footerLink}>
        Explore prayer journeys <CaretRight size={14} weight="bold" />
      </Link>
    </Page>
  );
}
