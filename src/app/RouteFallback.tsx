import { LogoMark } from '@/brand/Logo';
import styles from './RouteFallback.module.css';

/** Shown only if a screen takes a moment to load: the mark, breathing softly. */
export function RouteFallback() {
  return (
    <div className={styles.fallback} role="status" aria-label="Loading">
      <LogoMark size={40} className={styles.mark} />
    </div>
  );
}
