import { useMemo } from 'react';
import type { CuratedEntry } from '@/content/types';
import { formatRef, verseKeys } from '@/content/scripture';
import { Sheet } from '@/design/Sheet';
import { ErrorState } from '@/design/States';
import { usePassage } from './useComposed';
import { ScriptureText } from './ScriptureText';
import styles from './ContextSheet.module.css';

/** “Read context” — the surrounding passage, so a verse is never read out of its setting. */
export function ContextSheet({ entry, open, onClose }: { entry: CuratedEntry; open: boolean; onClose(): void }) {
  const passage = usePassage(open ? entry.contextRef : undefined);
  const highlight = useMemo(() => {
    if (!passage) return new Set<string>();
    const all: Record<string, unknown> = Object.fromEntries(passage.verses.map((v) => [v.key, true]));
    return new Set(verseKeys(entry.ref, all as never) ?? []);
  }, [passage, entry.ref]);

  return (
    <Sheet open={open} onClose={onClose} title={formatRef(entry.contextRef)} size="tall">
      <div className={styles.note}>
        <p className={styles.noteLabel}>The setting</p>
        <p className={styles.noteText}>{entry.contextNote}</p>
      </div>
      {passage ? (
        <>
          <ScriptureText passage={passage} numbers highlight={highlight} size="context" className={styles.text} />
          <p className={styles.attribution}>
            {passage.translation.name} ({passage.translation.abbreviation}) · {passage.translation.license}
          </p>
        </>
      ) : (
        <ErrorState title="We couldn’t open this passage." body="Scripture is only ever shown from our verified text. Please try again in a moment." />
      )}
    </Sheet>
  );
}
