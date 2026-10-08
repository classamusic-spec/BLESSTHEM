import type { Icon } from '@phosphor-icons/react';
import { LogoMark } from '@/brand/Logo';
import { cx } from '@/lib/cx';
import styles from './Emblem.module.css';

interface EmblemProps {
  /** A duotone icon for the moment; without one, the Bless Them mark. */
  icon?: Icon;
  size?: number;
  /** A soft golden light behind it, for moments worth marking. */
  glow?: boolean;
  className?: string;
}

/**
 * A quiet glass medallion that crowns empty states and small moments: a glyph that fits
 * the moment, or the mark itself. Always decorative; the words carry the meaning.
 */
export function Emblem({ icon: Glyph, size = 88, glow, className }: EmblemProps) {
  return (
    <span className={cx(styles.emblem, glow && styles.glow, className)} style={{ width: size, height: size }} aria-hidden="true">
      {Glyph ? <Glyph size={Math.round(size * 0.42)} weight="duotone" /> : <LogoMark size={Math.round(size * 0.56)} />}
    </span>
  );
}
