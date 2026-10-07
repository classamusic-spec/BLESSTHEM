import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { entriesForTopic } from '@/content/blessings';
import { CATEGORY_BY_ID, TOPIC_BY_ID } from '@/content/taxonomy';
import type { TopicId } from '@/content/types';
import { isPlus, useStore } from '@/data/store';
import { Button, ButtonLink } from '@/design/Button';
import { Page, PageHeader } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { EmptyState } from '@/design/States';
import { TopicIcon } from '@/design/TopicIcon';
import { track } from '@/services/analytics';
import { usePaywall } from '@/features/premium/PaywallProvider';
import { EntryRow } from './EntryRow';
import styles from './TopicPage.module.css';

export default function TopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topic = TOPIC_BY_ID[topicId as TopicId];
  const plus = useStore(isPlus);
  const paywall = usePaywall();
  const entries = topic ? entriesForTopic(topic.id) : [];
  const locked = Boolean(topic && !topic.free && !plus);

  useEffect(() => {
    if (topic) track({ name: 'topic_opened', props: { topic: topic.id, premium: !topic.free } });
  }, [topic]);

  if (!topic) {
    return (
      <Page>
        <PageHeader title="" back="/library" />
        <EmptyState pose="curious" title="We couldn’t find that topic." action={<ButtonLink to="/library">Back to Library</ButtonLink>} />
      </Page>
    );
  }

  const unlock = (entryId?: string) =>
    paywall.open(`topic:${topic.id}`, () => {
      if (entryId) navigate(`/library/entry/${entryId}`);
    });

  return (
    <Page>
      <PageHeader title="" back="/library" size="compact" />
      <motion.header className={styles.hero} variants={stagger(0.07)} initial="hidden" animate="show">
        <motion.span variants={fadeUp} className={styles.icon}>
          <TopicIcon name={topic.icon} size={34} />
        </motion.span>
        <motion.p variants={fadeUp} className="overline">
          {CATEGORY_BY_ID[topic.category].title}
        </motion.p>
        <motion.h1 variants={fadeUp} className={styles.title}>
          {topic.title}
        </motion.h1>
        <motion.p variants={fadeUp} className={styles.description}>
          {topic.description}
        </motion.p>
      </motion.header>

      {locked && (
        <div className={styles.locked}>
          <p>
            <strong>{topic.title}</strong> is part of Bless Them+. The full library has {Object.keys(TOPIC_BY_ID).length} topics for every season of life.
          </p>
          <Button size="md" onClick={() => unlock()}>
            Unlock the full library
          </Button>
        </div>
      )}

      <motion.ul role="list" className={styles.list} variants={stagger(0.05, 0.15)} initial="hidden" animate="show">
        {entries.map((e) => (
          <motion.li key={e.id} variants={fadeUp}>
            <EntryRow entry={e} locked={locked} onLocked={() => unlock(e.id)} />
          </motion.li>
        ))}
      </motion.ul>
    </Page>
  );
}
