import { Pause, Play, SpeakerHigh, Stop } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { isPlus, useStore } from '@/data/store';
import { spring } from '@/design/motion';
import { cx } from '@/lib/cx';
import { track } from '@/services/analytics';
import { speak, speechSupported, voicesReady, type SpeakHandle } from '@/services/speech';
import { usePaywall } from '@/features/premium/PaywallProvider';
import styles from './AudioControl.module.css';

const RATES = [0.8, 0.95, 1.15];

/**
 * Listen (Bless Them+). Never autoplays; collapses back to a quiet pill when finished.
 */
export function AudioControl({ text, label, part }: { text: string; label: string; part: string }) {
  const plus = useStore(isPlus);
  const rate = useStore((s) => s.settings.audioRate);
  const voiceURI = useStore((s) => s.settings.voiceURI);
  const updateSettings = useStore((s) => s.updateSettings);
  const paywall = usePaywall();
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [progress, setProgress] = useState(0);
  const handle = useRef<SpeakHandle | null>(null);

  useEffect(() => () => handle.current?.stop(), []);

  if (!speechSupported()) return null;

  const start = async () => {
    if (!plus) {
      paywall.open('audio');
      return;
    }
    await voicesReady();
    setProgress(0);
    setState('playing');
    track({ name: 'audio_played', props: { part } });
    handle.current = speak(text, {
      rate,
      voiceURI,
      onProgress: setProgress,
      onEnd: () => {
        setState('idle');
        setProgress(0);
      },
    });
  };

  const toggle = () => {
    if (state === 'playing') {
      handle.current?.pause();
      setState('paused');
    } else if (state === 'paused') {
      handle.current?.resume();
      setState('playing');
    } else {
      void start();
    }
  };

  const stop = () => {
    handle.current?.stop();
    setState('idle');
    setProgress(0);
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length] ?? 0.95;
    updateSettings({ audioRate: next });
    if (state !== 'idle') {
      stop();
      window.setTimeout(() => void start(), 60);
    }
  };

  return (
    <motion.div layout transition={spring.ui} className={cx(styles.audio, state !== 'idle' && styles.active)}>
      <button type="button" className={styles.main} onClick={toggle} aria-label={state === 'playing' ? `Pause ${label}` : `Listen: ${label}`}>
        {state === 'playing' ? <Pause size={16} weight="fill" /> : state === 'paused' ? <Play size={16} weight="fill" /> : <SpeakerHigh size={17} weight="regular" />}
        <span>{state === 'idle' ? 'Listen' : state === 'playing' ? 'Listening' : 'Paused'}</span>
        {!plus && <span className={styles.plus}>+</span>}
      </button>
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div className={styles.extra} initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={spring.ui}>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
            </span>
            <button type="button" className={styles.rate} onClick={cycleRate} aria-label={`Playback speed ${rate}×. Change speed`}>
              {rate.toFixed(2).replace(/0$/, '')}×
            </button>
            <button type="button" className={styles.stop} onClick={stop} aria-label="Stop">
              <Stop size={14} weight="fill" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
