import type { Transition, Variants } from 'motion/react';

/**
 * Motion should feel almost invisible: 180–300ms, gentle springs, no bounce theatrics.
 * <MotionConfig reducedMotion="user"> (App.tsx) turns transforms off for reduced motion;
 * opacity fades remain so state changes are still perceivable.
 */

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const spring = {
  /** Selections, toggles, small UI. */
  ui: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 } satisfies Transition,
  /** Cards, sheets, larger surfaces. */
  soft: { type: 'spring', stiffness: 260, damping: 30, mass: 1 } satisfies Transition,
  /** Gentle settle for celebratory moments (still no bounce). */
  gentle: { type: 'spring', stiffness: 170, damping: 22, mass: 1 } satisfies Transition,
};

export const fade: Transition = { duration: 0.24, ease: ease.out };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: ease.out } },
};

export const stagger = (step = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const page: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.out } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: ease.out } },
};
