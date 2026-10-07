import { useId } from 'react';
import { cx } from '@/lib/cx';
import styles from './Pip.module.css';

/**
 * Pip — Bless Them's little sparrow.
 *
 * “Are not two sparrows sold for a penny? Yet not one of them will fall to the
 * ground apart from the will of your Father.” (Matthew 10:29)
 * “Even the sparrow has found a home… a place near Your altar where she may
 * lay her young.” (Psalm 84:3)
 *
 * Pip never speaks for God and never nags. Pip simply keeps you company:
 * resting in empty states, glowing quietly when a prayer is complete.
 */
export type PipPose = 'idle' | 'happy' | 'sleep' | 'sprig' | 'wave' | 'nest' | 'heart' | 'curious';

interface PipProps {
  pose?: PipPose;
  size?: number | string;
  /** Gentle ambient life: breathing and blinking. Off automatically for reduced motion. */
  alive?: boolean;
  /** A soft golden halo behind Pip. */
  glow?: boolean;
  /** Accessible name. Omit when Pip is decorative (most of the time). */
  label?: string;
  className?: string;
}

const C = {
  bodyTop: '#9C6B45',
  body: '#B4825A',
  bodyBottom: '#BE8E64',
  wing: '#8D5C3A',
  wingStripe: '#B58A62',
  tail: '#7C5234',
  cream: '#F8EEDF',
  creamShade: '#EFDFC9',
  cheek: '#EC9F8E',
  beak: '#E5A453',
  beakLight: '#F2C580',
  eye: '#2B2420',
  feet: '#8C6A55',
  leaf: '#6E8F76',
  leafDark: '#3E5B47',
  nest: '#C79D66',
  nestDark: '#A47A47',
};

const WING_PATH = 'M44 80C32 86 27 104 33 120c2 5 6 8 10 9 4-11 7-25 7-37 0-6-2-10-6-12Z';

function Wing({ lift = 0, className }: { lift?: number; className?: string }) {
  return (
    <g transform={`rotate(${lift} 46 84)`}>
      <g className={className}>
        <path d={WING_PATH} fill={C.wing} />
        <path
          d="M36.5 107.5q4.2-4.4 9.6-4.4M35.6 116q4.4-4.2 9.6-4"
          fill="none"
          stroke={C.wingStripe}
          strokeWidth="2.3"
          strokeLinecap="round"
          opacity=".9"
        />
      </g>
    </g>
  );
}

const POSES: Record<PipPose, { eyes: 'open' | 'happy' | 'sleep'; liftL: number; liftR: number; cheek: number; tilt: number }> = {
  idle: { eyes: 'open', liftL: 0, liftR: 0, cheek: 0.5, tilt: 0 },
  happy: { eyes: 'happy', liftL: 20, liftR: 20, cheek: 0.75, tilt: 0 },
  sleep: { eyes: 'sleep', liftL: 0, liftR: 0, cheek: 0.4, tilt: 5 },
  sprig: { eyes: 'open', liftL: 0, liftR: 0, cheek: 0.5, tilt: 0 },
  wave: { eyes: 'happy', liftL: 0, liftR: 135, cheek: 0.65, tilt: 0 },
  nest: { eyes: 'open', liftL: 0, liftR: 0, cheek: 0.5, tilt: 0 },
  heart: { eyes: 'happy', liftL: 12, liftR: 12, cheek: 0.72, tilt: 0 },
  curious: { eyes: 'open', liftL: 0, liftR: 0, cheek: 0.5, tilt: -9 },
};

export function Pip({ pose = 'idle', size = 120, alive = true, glow = false, label, className }: PipProps) {
  const uid = useId().replace(/:/g, '');
  const p = POSES[pose];
  const ids = { body: `pb${uid}`, cream: `pc${uid}`, sheen: `ps${uid}`, halo: `ph${uid}` };

  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={cx(styles.pip, alive && styles.alive, styles[pose], className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={ids.body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.bodyTop} />
          <stop offset=".55" stopColor={C.body} />
          <stop offset="1" stopColor={C.bodyBottom} />
        </linearGradient>
        <linearGradient id={ids.cream} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.cream} />
          <stop offset="1" stopColor={C.creamShade} />
        </linearGradient>
        <radialGradient id={ids.sheen} cx=".36" cy=".24" r=".62">
          <stop offset="0" stopColor="#fff" stopOpacity=".26" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ids.halo} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="rgb(var(--glow-rgb))" stopOpacity=".55" />
          <stop offset=".55" stopColor="rgb(var(--glow-rgb))" stopOpacity=".16" />
          <stop offset="1" stopColor="rgb(var(--glow-rgb))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <circle className={styles.halo} cx="80" cy="92" r="78" fill={`url(#${ids.halo})`} />}

      <ellipse className={styles.shadow} cx="80" cy="142.5" rx="36" ry="5" fill="#3B2B19" opacity=".1" />

      <g className={styles.figure} transform={p.tilt ? `rotate(${p.tilt} 80 138)` : undefined}>
        <g className={styles.breathe}>
          {/* tail */}
          <path d="M110 124c11 4.6 24 5 35-2.4-2.6 9.6-13.4 17.6-27.4 16.6Z" fill={C.tail} />
          <path d="M108 128.6c10.4 3.4 21.6 4.2 31.4-.4-3.8 7.4-12.6 12-23.6 11Z" fill={C.wing} />

          {pose !== 'nest' && (
            <g stroke={C.feet} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M70 133.5v5.5m0 0-4.2 3.2m4.2-3.2v4.6m0-4.6 4.2 3.2" />
              <path d="M90 133.5v5.5m0 0-4.2 3.2m4.2-3.2v4.6m0-4.6 4.2 3.2" />
            </g>
          )}

          {/* body */}
          <path d="M80 38c31 0 52 23 52 54 0 28-22 46-52 46s-52-18-52-46c0-31 21-54 52-54Z" fill={`url(#${ids.body})`} />
          <path d="M80 60c23 0 39 17 40 38 1 23-17 37-40 37s-41-14-40-37c1-21 17-38 40-38Z" fill={`url(#${ids.cream})`} />
          <g fill="none" stroke="#D9C2A2" strokeWidth="1.8" strokeLinecap="round" opacity=".75">
            <path d="M70 117l3 2.6 3-2.6" />
            <path d="M84 121l3 2.6 3-2.6" />
            <path d="M76 127.6l3 2.4 3-2.4" />
          </g>
          <path d="M80 38c31 0 52 23 52 54 0 28-22 46-52 46s-52-18-52-46c0-31 21-54 52-54Z" fill={`url(#${ids.sheen})`} />

          {/* tuft */}
          <path className={styles.tuft} d="M77 40.6c-4.6-9-.4-15.6 7.8-14.6-4.4 2-6.2 6-4.4 13.4Z" fill={C.bodyTop} />

          {/* wings */}
          <Wing lift={p.liftL} className={styles.wingL} />
          <g transform="translate(160 0) scale(-1 1)">
            <Wing lift={p.liftR} className={styles.wingR} />
          </g>

          {/* cheeks */}
          <ellipse cx="54.5" cy="101" rx="7.6" ry="4.6" fill={C.cheek} opacity={p.cheek} />
          <ellipse cx="105.5" cy="101" rx="7.6" ry="4.6" fill={C.cheek} opacity={p.cheek} />

          {/* eyes */}
          {p.eyes === 'open' && (
            <g className={styles.eyes}>
              <circle cx="64" cy="90" r="5.8" fill={C.eye} />
              <circle cx="96" cy="90" r="5.8" fill={C.eye} />
              <circle cx="66.3" cy="87.6" r="2.1" fill="#fff" />
              <circle cx="98.3" cy="87.6" r="2.1" fill="#fff" />
              <circle cx="62.2" cy="92.6" r=".95" fill="#fff" opacity=".85" />
              <circle cx="94.2" cy="92.6" r=".95" fill="#fff" opacity=".85" />
            </g>
          )}
          {p.eyes === 'happy' && (
            <g fill="none" stroke={C.eye} strokeWidth="3.4" strokeLinecap="round">
              <path d="M57.8 91.6Q64 84.4 70.2 91.6" />
              <path d="M89.8 91.6Q96 84.4 102.2 91.6" />
            </g>
          )}
          {p.eyes === 'sleep' && (
            <g fill="none" stroke={C.eye} strokeWidth="3" strokeLinecap="round">
              <path d="M58 89Q64 94.4 70 89" />
              <path d="M90 89Q96 94.4 102 89" />
            </g>
          )}

          {/* beak */}
          <path d="M73.4 96.2Q80 92.2 86.6 96.2 83.2 103.6 80 104.8 76.8 103.6 73.4 96.2Z" fill={C.beak} />
          <path d="M75.6 96.6Q80 94.4 84.4 96.6 82 98 80 98.2 78 98 75.6 96.6Z" fill={C.beakLight} opacity=".8" />

          {pose === 'sprig' && (
            <g className={styles.sprig}>
              <path d="M84 101c10-1 22-4.6 33-12.4" fill="none" stroke="#7A6247" strokeWidth="2" strokeLinecap="round" />
              <path d="M97 99.4c1.6-6.4 7.4-9.6 12.6-8.6-2 5.6-7 9-12.6 8.6Z" fill={C.leaf} />
              <path d="M104.6 96.4c4.6-4.6 11-4.6 15.4-1.6-4.4 4-10.6 4.6-15.4 1.6Z" fill={C.leafDark} />
              <path d="M91 101.2c3.6 4.8 9.4 6 14 4-3.6-4.4-9-5.6-14-4Z" fill={C.leafDark} opacity=".9" />
              <circle cx="117.6" cy="88.4" r="2.6" fill="#B9A35E" />
            </g>
          )}

          {pose === 'heart' && (
            <path
              className={styles.heart}
              d="M80 128.6c-7.6-4.6-12-8.6-12-13.4 0-3.4 2.6-6 5.8-6 2.6 0 4.6 1.4 6.2 3.6 1.6-2.2 3.6-3.6 6.2-3.6 3.2 0 5.8 2.6 5.8 6 0 4.8-4.4 8.8-12 13.4Z"
              fill="#D98F7E"
            />
          )}
        </g>

        {pose === 'nest' && (
          <g>
            <path d="M30 118c4 22 26 30 50 30s46-8 50-30c-16 6-33 8-50 8s-34-2-50-8Z" fill={C.nest} />
            <g fill="none" stroke={C.nestDark} strokeWidth="2" strokeLinecap="round" opacity=".85">
              <path d="M36 126c14 6 30 8 44 8s32-2 46-8" />
              <path d="M42 136c12 4 24 6 38 6s28-2 38-6" />
              <path d="M48 122l6 12M64 126l4 12M96 126l-4 12M112 122l-6 12" opacity=".6" />
            </g>
            <path d="M30 118c16 6 33 8 50 8s34-2 50-8" fill="none" stroke="#D9B47E" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}
      </g>

      {pose === 'sleep' && (
        <g className={styles.zzz} fill="currentColor" fontFamily="var(--font-serif)" fontStyle="italic">
          <text x="118" y="44" fontSize="15">z</text>
          <text x="130" y="30" fontSize="11" opacity=".7">z</text>
        </g>
      )}
    </svg>
  );
}
