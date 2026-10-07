import { motion } from 'motion/react';
import { useParams } from 'react-router';
import { entriesForTopic } from '@/content/blessings';
import { COLLECTIONS } from '@/content/journeys';
import { isPlus, useStore } from '@/data/store';
import { Button, ButtonLink } from '@/design/Button';
import { Page, PageHeader } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { EmptyState } from '@/design/States';
import { TopicIcon } from '@/design/TopicIcon';
import { usePaywall } from '@/features/premium/PaywallProvider';
import { EntryRow } from './EntryRow';
import styles from './TopicPage.module.css';

/** Seasonal collections (Bless Them+): a few weeks of blessings for a season of the year. */
export default function CollectionPage() {
  const { collectionId } = useParams();
  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  const plus = useStore(isPlus);
  const paywall = usePaywall();

  if (!collection) {
    return (
      <Page>
        <PageHeader title="" back="/library" />
        <EmptyState pose="curious" title="We couldn’t find that collection." action={<ButtonLink to="/library">Back to Library</ButtonLink>} />
      </Page>
    );
  }

  const entries = collection.topics.flatMap((t) => entriesForTopic(t).slice(0, 3));

  return (
    <Page>
      <PageHeader title="" back="/library" size="compact" />
      <motion.header className={styles.hero} variants={stagger(0.07)} initial="hidden" animate="show">
        <motion.span variants={fadeUp} className={styles.icon}>
          <TopicIcon name={collection.icon} size={34} />
        </motion.span>
        <motion.p variants={fadeUp} className="overline">
          Seasonal collection
        </motion.p>
        <motion.h1 variants={fadeUp} className={styles.title}>
          {collection.title}
        </motion.h1>
        <motion.p variants={fadeUp} className={styles.description}>
          {collection.subtitle}
        </motion.p>
      </motion.header>
      {!plus && (
        <div className={styles.locked}>
          <p>Seasonal collections are part of Bless Them+ — fresh blessings for the rhythms of the year.</p>
          <Button size="md" onClick={() => paywall.open(`collection:${collection.id}`)}>
            Unlock collections
          </Button>
        </div>
      )}
      <motion.ul role="list" className={styles.list} variants={stagger(0.05, 0.15)} initial="hidden" animate="show">
        {entries.map((e) => (
          <motion.li key={e.id} variants={fadeUp}>
            <EntryRow entry={e} showTopic locked={!plus} onLocked={() => paywall.open(`collection:${collection.id}`)} />
          </motion.li>
        ))}
      </motion.ul>
    </Page>
  );
}
