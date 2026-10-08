import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { SceneId } from '@/content/scenery';
import { cx } from '@/lib/cx';
import { SceneImage } from './SceneImage';
import styles from './PhotoCard.module.css';

interface PhotoCardProps {
  to: string;
  scene: SceneId;
  title: ReactNode;
  /** Small caps line above the title, e.g. “7 days” or “In season”. */
  kicker?: ReactNode;
  body?: ReactNode;
  /** Something at the caption’s trailing edge: a progress ring, a lock, Pip. */
  accessory?: ReactNode;
  size?: 'feature' | 'tile';
  /** The `sizes` hint for the photo. */
  sizes?: string;
  className?: string;
}

/**
 * A place, not a box: a photograph with a frosted-glass caption resting on it, the way
 * a widget rests on a wallpaper. The caption is glass-strong, so its text keeps full
 * contrast whatever the photograph does beneath it.
 */
export function PhotoCard({ to, scene, title, kicker, body, accessory, size = 'feature', sizes = '(min-width: 640px) 320px, 92vw', className }: PhotoCardProps) {
  return (
    <Link to={to} className={cx(styles.card, styles[size], className)}>
      <SceneImage scene={scene} sizes={sizes} className={styles.photo} />
      <span className={styles.caption}>
        <span className={styles.text}>
          {kicker && <span className={styles.kicker}>{kicker}</span>}
          <span className={styles.title}>{title}</span>
          {body && <span className={styles.body}>{body}</span>}
        </span>
        {accessory && <span className={styles.accessory}>{accessory}</span>}
      </span>
    </Link>
  );
}
