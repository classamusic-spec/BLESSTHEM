import { HandHeart, Heart, Sparkle } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ENTRY_BY_ID } from '@/content/blessings';
import { formatRef } from '@/content/scripture';
import type { JournalEntry, Person } from '@/data/models';
import { PersonAvatar } from '@/design/PersonAvatar';
import { formatRelativeDay, dayKey } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { photoURL } from '@/services/photos';
import styles from './JournalCard.module.css';

const KIND_LABEL: Record<JournalEntry['kind'], string> = {
  reflection: 'Reflection',
  request: 'Prayer',
  gratitude: 'Gratitude',
  note: 'Note',
};

/** A journal entry, presented like a page from a cherished notebook — not a database row. */
export function JournalCard({ entry, person }: { entry: JournalEntry; person?: Person }) {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    if (entry.photoId) photoURL(entry.photoId).then((u) => live && setPhoto(u));
    return () => {
      live = false;
    };
  }, [entry.photoId]);

  const curated = entry.entryId ? ENTRY_BY_ID.get(entry.entryId) : undefined;
  const answered = Boolean(entry.answeredAt);

  return (
    <Link to={`/journal/${entry.id}`} className={cx(styles.card, answered && styles.answered)}>
      <div className={styles.head}>
        <span className={cx(styles.kind, styles[`kind-${answered ? 'answered' : entry.kind}`])}>
          {answered ? <Sparkle size={13} weight="fill" /> : entry.kind === 'request' ? <HandHeart size={13} weight="fill" /> : null}
          {answered ? 'Answered' : KIND_LABEL[entry.kind]}
        </span>
        <span className={styles.date}>{formatRelativeDay(dayKey(new Date(entry.createdAt)))}</span>
        {entry.favorite && <Heart size={14} weight="fill" className={styles.fav} aria-label="Favorite" />}
      </div>
      <div className={styles.body}>
        <p className={styles.text}>{entry.text}</p>
        {photo && <img className={styles.photo} src={photo} alt="" />}
      </div>
      {answered && entry.answerNote && <p className={styles.answer}>“{entry.answerNote}”</p>}
      {(person || curated) && (
        <div className={styles.foot}>
          {person && (
            <span className={styles.person}>
              <PersonAvatar person={person} size={22} />
              {person.name}
            </span>
          )}
          {curated && <span className={styles.ref}>{formatRef(curated.ref)}</span>}
        </div>
      )}
    </Link>
  );
}
