import { BellSimple } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useStore } from '@/data/store';
import { Button } from '@/design/Button';
import { spring } from '@/design/motion';
import { track } from '@/services/analytics';
import { haptics } from '@/services/haptics';
import { notificationsSupported, requestPermission } from '@/services/notifications';
import styles from './NotificationPrompt.module.css';

const TIMES = [
  { value: '06:30', label: '6:30 am' },
  { value: '07:00', label: '7:00 am' },
  { value: '08:00', label: '8:00 am' },
  { value: '20:30', label: '8:30 pm' },
];

/**
 * Asked only after the first completed blessing — when it’s meaningful — and only once.
 * Reminders are pastoral, never “don’t lose your streak”.
 */
export function NotificationPrompt({ force }: { force?: boolean }) {
  const prefs = useStore((s) => s.notifications);
  const update = useStore((s) => s.updateNotifications);
  const [time, setTime] = useState(prefs.morning.time);
  const [state, setState] = useState<'ask' | 'done'>('ask');
  const visible = force || (!prefs.asked && notificationsSupported());

  const accept = async () => {
    haptics.light();
    const permission = await requestPermission();
    const evening = time >= '12:00';
    update({
      asked: true,
      permission,
      morning: { enabled: !evening, time: evening ? prefs.morning.time : time },
      evening: { enabled: evening, time: evening ? time : prefs.evening.time },
    });
    track({ name: 'notification_prompt', props: { result: permission } });
    setState('done');
  };

  const decline = () => {
    update({ asked: true });
    track({ name: 'notification_prompt', props: { result: 'not-now' } });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          className={styles.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0, padding: 0 }}
          transition={spring.soft}
          aria-labelledby="notify-title"
        >
          {state === 'ask' ? (
            <>
              <div className={styles.head}>
                <span className={styles.icon}>
                  <BellSimple size={20} weight="duotone" />
                </span>
                <div>
                  <h2 id="notify-title" className={styles.title}>
                    Would a gentle reminder help?
                  </h2>
                  <p className={styles.body}>One quiet note a day when a blessing is ready. Never more, and never guilt.</p>
                </div>
              </div>
              <div className={styles.times} role="radiogroup" aria-label="Reminder time">
                {TIMES.map((t) => (
                  <button key={t.value} type="button" role="radio" aria-checked={time === t.value} className={styles.time} onClick={() => setTime(t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className={styles.actions}>
                <Button size="md" onClick={accept}>
                  Remind me
                </Button>
                <Button size="md" variant="ghost" onClick={decline}>
                  Not now
                </Button>
              </div>
            </>
          ) : (
            <p className={styles.body}>
              {prefs.permission === 'granted'
                ? 'Lovely. We’ll send one gentle reminder a day. You can change this anytime in Settings.'
                : 'No problem. You can turn reminders on later in Settings.'}
            </p>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
