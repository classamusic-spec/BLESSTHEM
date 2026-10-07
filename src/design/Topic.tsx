import { Check, LockSimple } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import { spring } from './motion';
import { TopicIcon } from './TopicIcon';
import styles from './Topic.module.css';

interface TopicChipProps {
  label: string;
  selected: boolean;
  onToggle(): void;
  icon?: string;
}

/** Multi-select chip with a clear selected state (not by colour alone: a check appears). */
export function TopicChip({ label, selected, onToggle, icon }: TopicChipProps) {
  return (
    <motion.button
      type="button"
      layout
      transition={spring.ui}
      aria-pressed={selected}
      className={cx(styles.chip, selected && styles.chipOn)}
      onClick={() => {
        haptics.selection();
        onToggle();
      }}
    >
      <span className={styles.chipIcon} aria-hidden="true">
        {selected ? <Check size={15} weight="bold" /> : icon ? <TopicIcon name={icon} size={16} weight="regular" /> : null}
      </span>
      {label}
    </motion.button>
  );
}

interface TopicCardProps {
  to: string;
  title: string;
  icon: string;
  meta?: ReactNode;
  locked?: boolean;
  tone?: 'sand' | 'sage' | 'blue' | 'plain';
}

export function TopicCard({ to, title, icon, meta, locked, tone = 'plain' }: TopicCardProps) {
  return (
    <Link to={to} className={cx(styles.card, styles[`tone-${tone}`])}>
      <span className={styles.cardIcon}>
        <TopicIcon name={icon} size={24} />
      </span>
      <span className={styles.cardText}>
        <span className={styles.cardTitle}>{title}</span>
        {meta && <span className={styles.cardMeta}>{meta}</span>}
      </span>
      {locked && (
        <span className={styles.lock} aria-label="Bless Them+">
          <LockSimple size={14} weight="bold" />
        </span>
      )}
    </Link>
  );
}
