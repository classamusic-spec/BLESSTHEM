import { ArrowUpRight, Phone } from '@phosphor-icons/react';
import { Button } from '@/design/Button';
import { Sheet } from '@/design/Sheet';
import { resourcesFor, SAFETY_COPY, type SafetyResult } from '@/engine/safety';
import { usePassage } from '@/features/blessing/useComposed';
import styles from './SafetySupport.module.css';

interface SafetySupportProps {
  result: SafetyResult;
  open: boolean;
  onClose(): void;
  /** Continue gently to Scripture once help has been offered. */
  onContinue?(): void;
}

/**
 * When something serious is shared, we don’t simply answer with a verse.
 * Compassion first, real help first — prayer alongside, never instead.
 */
export function SafetySupport({ result, open, onClose, onContinue }: SafetySupportProps) {
  const copy = SAFETY_COPY[result.category];
  const resources = resourcesFor(result.category);
  // Verified text only — never typed by hand.
  const comfort = usePassage('PSA 34:18');
  return (
    <Sheet open={open} onClose={onClose} title={copy.title} size="tall">
      <p className={styles.body}>{copy.body}</p>
      <ul role="list" className={styles.list}>
        {resources.map((r, i) => {
          const external = r.href.startsWith('http');
          return (
            <li key={r.name}>
              <a className={i === 0 && result.urgent ? `${styles.resource} ${styles.primary}` : styles.resource} href={r.href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
                <span className={styles.icon}>{external ? <ArrowUpRight size={18} weight="bold" /> : <Phone size={18} weight="fill" />}</span>
                <span className={styles.text}>
                  <strong>{r.name}</strong>
                  <span>{r.detail}</span>
                </span>
                <span className={styles.action}>{r.action}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <p className={styles.note}>Numbers shown are for the United States. Wherever you are, if someone is in immediate danger, call your local emergency number.</p>
      {comfort && (
        <div className={styles.verse}>
          <p className={styles.verseText}>“{comfort.text}”</p>
          <p className={styles.verseRef}>
            {comfort.display} · {comfort.translation.abbreviation}
          </p>
        </div>
      )}
      {onContinue && (
        <Button variant="secondary" block onClick={onContinue}>
          Everyone is safe — continue
        </Button>
      )}
    </Sheet>
  );
}
