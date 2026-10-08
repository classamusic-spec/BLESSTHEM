import { ArrowCounterClockwise, CloudSlash } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useOnline } from '@/hooks/useOnline';
import { cx } from '@/lib/cx';
import { Button } from './Button';
import { Emblem } from './Emblem';
import { fadeUp, stagger } from './motion';
import styles from './States.module.css';

interface EmptyStateProps {
  /** A glyph for the moment; without one, the Bless Them mark. */
  icon?: Icon;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

/** Every empty screen is an invitation, never a blank page. */
export function EmptyState({ icon, title, body, action, compact, className }: EmptyStateProps) {
  return (
    <motion.div className={cx(styles.empty, compact && styles.compact, className)} variants={stagger(0.08)} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className={styles.emblem}>
        <Emblem icon={icon} size={compact ? 72 : 88} glow />
      </motion.div>
      <motion.h2 variants={fadeUp} className={styles.title}>
        {title}
      </motion.h2>
      {body && (
        <motion.p variants={fadeUp} className={styles.body}>
          {body}
        </motion.p>
      )}
      {action && (
        <motion.div variants={fadeUp} className={styles.action}>
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

/** Never a raw error. Calm words, a reassurance, and one clear way forward. */
export function ErrorState({
  title = 'We couldn’t prepare today’s blessing.',
  body = 'Your saved prayers are safe. Try again in a moment.',
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.error} role="alert">
      <Emblem size={72} />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      {onRetry && (
        <Button variant="secondary" size="md" icon={<ArrowCounterClockwise />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** A quiet banner when the connection drops. Today’s blessing is cached, so nothing is lost. */
export function OfflineBanner() {
  const online = useOnline();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          className={styles.offline}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          role="status"
        >
          <CloudSlash size={16} weight="bold" />
          You’re offline. Today’s blessings are saved on this device.
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Skeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cx(styles.skeleton, className)} aria-hidden="true">
      <span className={styles.skelTitle} />
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className={styles.skelLine} style={{ width: `${92 - i * 11}%` }} />
      ))}
    </div>
  );
}

/** A full blessing-card placeholder, shaped exactly like the real card (no layout shift). */
export function BlessingSkeleton() {
  return (
    <div className={styles.cardSkeleton} aria-busy="true" aria-label="Preparing today’s blessing">
      <span className={styles.skelEyebrow} />
      <span className={styles.skelVerse} />
      <span className={styles.skelVerse} style={{ width: '86%' }} />
      <span className={styles.skelVerse} style={{ width: '64%' }} />
      <span className={styles.skelRef} />
      <Skeleton lines={3} />
    </div>
  );
}
