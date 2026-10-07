import { ArrowsClockwise, LockSimple } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { CATEGORIES, TOPICS, TOPIC_BY_ID } from '@/content/taxonomy';
import type { TopicId } from '@/content/types';
import type { Person } from '@/data/models';
import { isPlus, useStore } from '@/data/store';
import { Sheet } from '@/design/Sheet';
import { TopicIcon } from '@/design/TopicIcon';
import { headingName } from '@/engine/compose';
import { topicSuits } from '@/engine/personalize';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import { usePaywall } from '@/features/premium/PaywallProvider';
import styles from './FocusSheet.module.css';

interface FocusSheetProps {
  open: boolean;
  onClose(): void;
  person: Person;
  currentTopic?: TopicId;
  onChoose(topic?: TopicId): void;
}

/** “Choose a different focus” — what’s on your heart for them today? */
export function FocusSheet({ open, onClose, person, currentTopic, onChoose }: FocusSheetProps) {
  const plus = useStore(isPlus);
  const paywall = usePaywall();
  const focus = person.focusTopics.filter((t) => topicSuits(t, person));
  const others = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        category: c,
        topics: TOPICS.filter((t) => t.category === c.id && !focus.includes(t.id) && topicSuits(t.id, person)),
      })).filter((g) => g.topics.length),
    [focus, person],
  );

  const choose = (topic?: TopicId) => {
    if (topic && !plus && !TOPIC_BY_ID[topic].free && !focus.includes(topic)) {
      paywall.open('focus-topic', () => {
        onChoose(topic);
        onClose();
      });
      return;
    }
    haptics.selection();
    onChoose(topic);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Choose a different focus" description={`What’s on your heart for ${headingName(person)} today?`} size="tall">
      <button type="button" className={styles.surprise} onClick={() => choose(undefined)}>
        <ArrowsClockwise size={20} weight="bold" />
        <span>
          <strong>Another blessing</strong>
          <small>From what you’re already praying about</small>
        </span>
      </button>

      {focus.length > 0 && (
        <>
          <h3 className={cx('overline', styles.heading)}>Praying about</h3>
          <div className={styles.grid}>
            {focus.map((t) => (
              <button key={t} type="button" className={cx(styles.topic, t === currentTopic && styles.current)} onClick={() => choose(t)} aria-current={t === currentTopic || undefined}>
                <TopicIcon name={TOPIC_BY_ID[t].icon} size={20} />
                {TOPIC_BY_ID[t].title}
              </button>
            ))}
          </div>
        </>
      )}

      {others.map(({ category, topics }) => (
        <div key={category.id}>
          <h3 className={cx('overline', styles.heading)}>{category.title}</h3>
          <div className={styles.grid}>
            {topics.map((t) => {
              const locked = !plus && !t.free;
              return (
                <button key={t.id} type="button" className={cx(styles.topic, t.id === currentTopic && styles.current)} onClick={() => choose(t.id)}>
                  <TopicIcon name={t.icon} size={20} />
                  {t.title}
                  {locked && <LockSimple size={12} weight="bold" className={styles.lock} aria-label="Bless Them+" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Sheet>
  );
}
