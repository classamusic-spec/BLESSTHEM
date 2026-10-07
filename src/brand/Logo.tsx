import { cx } from '@/lib/cx';
import styles from './Logo.module.css';

/** The Bless Them mark: two leaves cradling a small light — covering, growth, blessing. */
export function LogoMark({ size = 32, className, tone = 'color' }: { size?: number; className?: string; tone?: 'color' | 'mono' | 'on-brand' }) {
  const leafA = tone === 'on-brand' ? '#F6F0E4' : tone === 'mono' ? 'currentColor' : 'var(--logo-leaf-a, var(--color-brand))';
  const leafB = tone === 'on-brand' ? '#CCDAC7' : tone === 'mono' ? 'currentColor' : 'var(--logo-leaf-b, var(--color-brand-tint))';
  const light = tone === 'on-brand' ? '#E9C783' : tone === 'mono' ? 'currentColor' : 'var(--color-gold)';
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cx(styles.mark, className)} aria-hidden="true" focusable="false">
      <circle cx="32" cy="33" r="6.4" fill={light} className={styles.light} />
      <path d="M30.8 56.6C16.2 55 7 43.4 9.4 26.6c.6-4.2 1.9-8.4 3.8-12.4 10 7.4 16.6 21 17.6 42.4Z" fill={leafA} />
      <path
        d="M33.2 56.6C47.8 55 57 43.4 54.6 26.6c-.6-4.2-1.9-8.4-3.8-12.4-10 7.4-16.6 21-17.6 42.4Z"
        fill={leafB}
        opacity={tone === 'mono' ? 0.6 : 1}
      />
    </svg>
  );
}

/** Mark + wordmark. The wordmark is set in Newsreader with generous tracking. */
export function Logo({ size = 28, className, label = true }: { size?: number; className?: string; label?: boolean }) {
  return (
    <span className={cx(styles.logo, className)} aria-label={label ? 'Bless Them' : undefined} role={label ? 'img' : undefined}>
      <LogoMark size={size} />
      <span className={styles.word} aria-hidden="true">
        Bless Them
      </span>
    </span>
  );
}
