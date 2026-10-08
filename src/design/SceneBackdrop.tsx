import { AnimatePresence, motion } from 'motion/react';
import { DAYPART_SCENE, SCENES } from '@/content/scenery';
import { useDaypart } from '@/hooks/useDaypart';
import styles from './SceneBackdrop.module.css';

/**
 * The sky behind the whole app: today’s scene, dissolved into a soft wash of its own
 * colours under a warm veil — like light through frosted glass. It changes with the time
 * of day, crossfading slowly. Costs one 24-pixel image; works offline.
 */
export function SceneBackdrop() {
  const part = useDaypart();
  const scene = SCENES[DAYPART_SCENE[part]];
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene.id}
          className={styles.wash}
          style={{ backgroundImage: `url(${scene.lqip})`, backgroundColor: scene.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.4, ease: 'easeInOut' }}
        />
      </AnimatePresence>
      <div className={styles.veil} />
      <div className={styles.grain} />
    </div>
  );
}
