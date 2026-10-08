import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { SCENES, sceneSrcSet, sceneUrl, type SceneId } from '@/content/scenery';
import { cx } from '@/lib/cx';
import styles from './SceneImage.module.css';

interface SceneImageProps {
  scene: SceneId;
  /** The `sizes` hint, so the browser fetches the right width. */
  sizes?: string;
  /** Above the fold: fetch eagerly and early. */
  priority?: boolean;
  /** Override the scene’s focal point (CSS object-position). */
  position?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A photograph that arrives gracefully: its blurred placeholder shows at once, then the
 * real image (AVIF, or WebP where AVIF is unsupported) fades in over it. Always decorative —
 * the words around it carry the meaning.
 */
export function SceneImage({ scene, sizes = '100vw', priority, position, className, style }: SceneImageProps) {
  const s = SCENES[scene];
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // A cached image can finish loading before React attaches onLoad.
  useLayoutEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  const fallbackWidth = s.widths[Math.min(1, s.widths.length - 1)];
  return (
    <span
      className={cx(styles.frame, loaded && styles.loaded, className)}
      style={{ ...style, backgroundColor: s.color, ['--lqip' as string]: `url(${s.lqip})`, ['--focus' as string]: position ?? s.focus }}
      aria-hidden="true"
    >
      <picture>
        <source type="image/avif" srcSet={sceneSrcSet(scene, 'avif')} sizes={sizes} />
        <img
          ref={ref}
          className={styles.img}
          src={sceneUrl(scene, fallbackWidth, 'webp')}
          srcSet={sceneSrcSet(scene, 'webp')}
          sizes={sizes}
          alt=""
          draggable={false}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
        />
      </picture>
    </span>
  );
}
