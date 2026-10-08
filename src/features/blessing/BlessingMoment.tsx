import { ArrowLeft, ArrowRight, HandHeart, HandsPraying, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconButton, Button } from '@/design/Button';
import { Emblem } from '@/design/Emblem';
import { ProgressDots } from '@/design/Controls';
import { ease } from '@/design/motion';
import type { ComposedBlessing } from '@/engine/compose';
import { daypart } from '@/lib/dates';
import { DAYPART_SCENE } from '@/content/scenery';
import { SceneImage } from '@/design/SceneImage';
import { haptics } from '@/services/haptics';
import { ScriptureText } from './ScriptureText';
import styles from './BlessingMoment.module.css';

interface BlessingMomentProps {
  open: boolean;
  onClose(): void;
  composed: ComposedBlessing;
  personName: string;
  prayed: boolean;
  onPrayed(): void;
}

type Step = { key: string; label: string };

/**
 * The moment itself: one part at a time, in large type, for reading aloud at a
 * bedside or across the breakfast table. Dims at night. Swipe, tap or use arrows.
 */
export function BlessingMoment({ open, onClose, composed, personName, prayed, onPrayed }: BlessingMomentProps) {
  const steps: Step[] = [
    { key: 'scripture', label: composed.passage?.display ?? 'Scripture' },
    { key: 'blessing', label: composed.speakHeading },
    { key: 'prayer', label: 'Pray' },
    ...(composed.talk ? [{ key: 'talk', label: 'Talk about it' }] : []),
    { key: 'done', label: 'Amen' },
  ];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const scene = DAYPART_SCENE[daypart()];
  const closeRef = useRef<HTMLButtonElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = Math.min(steps.length - 1, Math.max(0, i + delta));
        if (next !== i) haptics.selection();
        return next;
      });
      setDir(delta);
    },
    [steps.length],
  );

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    restore.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => closeRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      restore.current?.focus?.();
    };
  }, [open, go, onClose]);

  const step = steps[index];

  const content = () => {
    switch (step.key) {
      case 'scripture':
        return composed.passage ? (
          <>
            <p className={styles.kicker}>{composed.passage.display}</p>
            <ScriptureText passage={composed.passage} size="moment" />
          </>
        ) : null;
      case 'blessing':
        return (
          <>
            <p className={styles.kicker}>{composed.speakHeading}</p>
            <p className={styles.blessing}>{composed.blessing}</p>
          </>
        );
      case 'prayer':
        return (
          <>
            <p className={styles.kicker}>Pray</p>
            <p className={styles.prayer}>{composed.prayer}</p>
          </>
        );
      case 'talk':
        return (
          <>
            <p className={styles.kicker}>Talk about it</p>
            <p className={styles.talk}>{composed.talk}</p>
          </>
        );
      default:
        return (
          <div className={styles.end}>
            <Emblem icon={prayed ? HandHeart : HandsPraying} size={96} glow />
            <p className={styles.endTitle}>{prayed ? 'Covered in prayer today.' : 'Amen.'}</p>
            <p className={styles.endBody}>{prayed ? `You blessed ${personName} today.` : 'Take a breath. You can close whenever you’re ready.'}</p>
            {!prayed && (
              <Button
                onClick={() => {
                  haptics.success();
                  onPrayed();
                }}
              >
                I prayed this
              </Button>
            )}
            {prayed && (
              <Button variant="secondary" onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        );
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.moment}
          data-glass
          role="dialog"
          aria-modal="true"
          aria-label={`Blessing for ${personName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.36, ease: ease.out }}
        >
          {/* Today’s scene, softened and dimmed: a quiet place to read aloud. */}
          <div className={styles.scene} aria-hidden="true">
            <SceneImage scene={scene} sizes="100vw" priority className={styles.sceneImage} />
          </div>
          <div className={styles.shade} aria-hidden="true" />
          <div className={styles.glow} aria-hidden="true" />
          <header className={styles.top}>
            <ProgressDots count={steps.length} index={index} label={`Part ${index + 1} of ${steps.length}: ${step.label}`} />
            <IconButton ref={closeRef} label="Close" onClick={onClose} className={styles.close}>
              <X size={22} />
            </IconButton>
          </header>

          <motion.div
            className={styles.stage}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -400) go(1);
              else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
            }}
          >
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step.key}
                className={styles.slide}
                custom={dir}
                initial={{ opacity: 0, x: dir * 28 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.42, ease: ease.out } }}
                exit={{ opacity: 0, x: dir * -20, transition: { duration: 0.2 } }}
                aria-live="polite"
              >
                {content()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <footer className={styles.bottom}>
            <IconButton label="Previous" onClick={() => go(-1)} disabled={index === 0} tone="surface">
              <ArrowLeft size={20} />
            </IconButton>
            <span className={styles.hint}>{index < steps.length - 1 ? 'Read slowly. There’s no rush.' : ''}</span>
            <IconButton label="Next" onClick={() => go(1)} disabled={index === steps.length - 1} tone="brand">
              <ArrowRight size={20} />
            </IconButton>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
