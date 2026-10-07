import { Export, NotePencil } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/design/Button';
import { ease, spring } from '@/design/motion';
import { Pip } from '@/mascot/Pip';
import { haptics } from '@/services/haptics';
import styles from './PrayedButton.module.css';

interface PrayedButtonProps {
  prayed: boolean;
  onPray(): void;
  onReflect?(): void;
  onShare?(): void;
  /** e.g. “You blessed Noah today.” */
  confirmation: string;
  label?: string;
}

const MOTES = [
  { x: -120, d: 0.0, s: 5 },
  { x: -70, d: 0.12, s: 4 },
  { x: -22, d: 0.05, s: 6 },
  { x: 30, d: 0.18, s: 4 },
  { x: 76, d: 0.08, s: 5 },
  { x: 124, d: 0.22, s: 4 },
  { x: 4, d: 0.3, s: 3 },
];

/**
 * “I prayed this.” A quiet moment of completion: a soft expanding glow, a check
 * drawn in one stroke, a few motes of light — and a gentle haptic. No confetti.
 */
export function PrayedButton({ prayed, onPray, onReflect, onShare, confirmation, label = 'I prayed this' }: PrayedButtonProps) {
  const [celebrating, setCelebrating] = useState(false);
  const reduce = useReducedMotion();

  const pray = () => {
    haptics.success();
    setCelebrating(true);
    onPray();
    window.setTimeout(() => setCelebrating(false), 1800);
  };

  return (
    <div className={styles.wrap}>
      <AnimatePresence initial={false} mode="popLayout">
        {!prayed ? (
          <motion.div key="cta" className={styles.cta} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}>
            <Button block onClick={pray} className={styles.button}>
              {label}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            className={styles.done}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.gentle, delay: celebrating ? 0.25 : 0 }}
          >
            {celebrating && !reduce && (
              <div className={styles.fx} aria-hidden="true">
                <motion.span
                  className={styles.glow}
                  initial={{ scale: 0.4, opacity: 0.9 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 1.3, ease: ease.out }}
                />
                {MOTES.map((m, i) => (
                  <motion.span
                    key={i}
                    className={styles.mote}
                    style={{ width: m.s, height: m.s }}
                    initial={{ x: m.x * 0.3, y: 20, opacity: 0 }}
                    animate={{ x: m.x, y: -90 - i * 6, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.7, delay: m.d, ease: ease.out }}
                  />
                ))}
              </div>
            )}
            <div className={styles.confirmRow}>
              <span className={styles.pip}>
                <Pip pose={celebrating ? 'happy' : 'heart'} size={64} alive={!reduce} />
              </span>
              <div>
                <p className={styles.title}>
                  <svg className={styles.check} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" fill="var(--color-brand)" />
                    <motion.path
                      d="M7 12.4l3.2 3.1L17.2 8.6"
                      fill="none"
                      stroke="var(--color-on-brand)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: celebrating ? 0 : 1 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.35, ease: ease.out }}
                    />
                  </svg>
                  Covered in prayer today.
                </p>
                <p className={styles.sub}>{confirmation}</p>
              </div>
            </div>
            {(onReflect || onShare) && (
              <div className={styles.next}>
                {onReflect && (
                  <Button variant="secondary" size="md" icon={<NotePencil />} onClick={onReflect}>
                    Add a reflection
                  </Button>
                )}
                {onShare && (
                  <Button variant="secondary" size="md" icon={<Export />} onClick={onShare}>
                    Share blessing
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="visually-hidden" role="status" aria-live="polite">
        {prayed ? 'Covered in prayer today.' : ''}
      </p>
    </div>
  );
}
