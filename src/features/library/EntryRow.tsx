import { CaretRight, LockSimple } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { TOPIC_BY_ID } from '@/content/taxonomy';
import type { CuratedEntry } from '@/content/types';
import { cx } from '@/lib/cx';
import { usePassage } from '@/features/blessing/useComposed';
import styles from './EntryRow.module.css';

interface EntryRowProps {
  entry: CuratedEntry;
  locked?: boolean;
  onLocked?(): void;
  showTopic?: boolean;
  why?: string;
}

/** A passage in a list: reference, a first glimpse of the words, and where it leads. */
export function EntryRow({ entry, locked, onLocked, showTopic, why }: EntryRowProps) {
  const passage = usePassage(entry.ref);
  const topic = TOPIC_BY_ID[entry.topic];
  const content = (
    <>
      <span className={styles.text}>
        <span className={styles.top}>
          <span className={styles.ref}>{passage?.display ?? entry.ref}</span>
          {showTopic && <span className={styles.topic}>{topic.title}</span>}
          {why && !showTopic && <span className={styles.topic}>{why}</span>}
        </span>
        <span className={cx(styles.verse, locked && styles.blurred)}>{passage ? `“${passage.text}”` : ''}</span>
      </span>
      {locked ? <LockSimple size={16} weight="bold" className={styles.lock} aria-label="Bless Them+" /> : <CaretRight size={16} weight="bold" className={styles.chev} aria-hidden="true" />}
    </>
  );
  if (locked) {
    return (
      <button type="button" className={styles.row} onClick={onLocked}>
        {content}
      </button>
    );
  }
  return (
    <Link to={`/library/entry/${entry.id}`} className={styles.row}>
      {content}
    </Link>
  );
}
