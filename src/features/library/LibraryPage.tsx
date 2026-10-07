import { CaretRight, MagnifyingGlass } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { entriesForTopic } from '@/content/blessings';
import { collectionInSeason, JOURNEYS } from '@/content/journeys';
import { CATEGORIES, TOPICS } from '@/content/taxonomy';
import { isPlus, useStore } from '@/data/store';
import { Page, PageHeader, Section } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { TopicCard } from '@/design/Topic';
import { TopicIcon } from '@/design/TopicIcon';
import { cx } from '@/lib/cx';
import { Pip } from '@/mascot/Pip';
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
      <PageHeader title="Library" subtitle="Scripture blessings for every season of their lives." />

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
          <Link to="/library/journeys" className={cx(styles.feature, styles.featureJourney)}>
            <span className={styles.featureText}>
              <span className={cx('overline', styles.featureKicker)}>Prayer journeys</span>
              <span className={styles.featureTitle}>Guided blessings, day by day</span>
              <span className={styles.featureBody}>{JOURNEYS.length} journeys — courage, bedtime peace, your teen, your marriage.</span>
            </span>
            <span className={styles.featurePip} aria-hidden="true">
              <Pip pose="sprig" size={92} alive={false} />
            </span>
          </Link>
        </motion.div>
        {season && (
          <motion.div variants={fadeUp}>
            <Link to={`/library/collection/${season.id}`} className={cx(styles.feature, styles.featureSeason)}>
              <span className={styles.featureText}>
                <span className={cx('overline', styles.featureKicker)}>In season</span>
                <span className={styles.featureTitle}>{season.title}</span>
                <span className={styles.featureBody}>{season.subtitle}</span>
              </span>
              <span className={styles.seasonIcon} aria-hidden="true">
                <TopicIcon name={season.icon} size={34} />
              </span>
            </Link>
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
