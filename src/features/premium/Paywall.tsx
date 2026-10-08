import { BookOpen, Check, HeartStraight, ImageSquare, MapTrifold, Sparkle, SpeakerHigh, UsersThree } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { TOPICS } from '@/content/taxonomy';
import { useStore } from '@/data/store';
import type { PlanId } from '@/data/models';
import { Button } from '@/design/Button';
import { fadeUp, spring, stagger } from '@/design/motion';
import { cx } from '@/lib/cx';
import { SceneImage } from '@/design/SceneImage';
import { Emblem } from '@/design/Emblem';
import { track } from '@/services/analytics';
import { haptics } from '@/services/haptics';
import { PLANS, purchases } from '@/services/purchases';
import styles from './Paywall.module.css';

const BENEFITS = [
  { icon: UsersThree, title: 'Everyone you love', body: 'Bless as many people as are on your heart.' },
  { icon: BookOpen, title: 'The full library', body: `${TOPICS.length} topics for every season and need.` },
  { icon: MapTrifold, title: 'Prayer journeys', body: '7 to 30 days of guided blessings — courage, bedtime, your teen, your marriage.' },
  { icon: HeartStraight, title: 'Special moments', body: 'Blessings for birthdays, first days, big games and hard days.' },
  { icon: SpeakerHigh, title: 'Listen', body: 'Scripture and blessings read aloud, at your pace.' },
  { icon: ImageSquare, title: 'A richer journal', body: 'Photos with your prayers, and unlimited favorites.' },
];

interface PaywallProps {
  source: string;
  onClose(): void;
  onUnlocked?(): void;
}

/** “Pray more intentionally for the people you love.” Honest pricing, easy exit. */
export function Paywall({ source, onClose, onUnlocked }: PaywallProps) {
  const [plan, setPlan] = useState<PlanId>('annual');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSubscription = useStore((s) => s.setSubscription);
  const subscription = useStore((s) => s.subscription);
  const selected = PLANS[plan];

  const buy = async () => {
    setBusy(true);
    setError(null);
    try {
      const sub = await purchases.purchase(plan);
      setSubscription(sub);
      haptics.success();
      track({ name: sub.status === 'trial' ? 'trial_started' : 'subscription_started', props: { plan } });
      setDone(true);
      window.setTimeout(() => onUnlocked?.(), 1500);
    } catch {
      setError('We couldn’t complete that just now. You haven’t been charged. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    const restored = await purchases.restore(subscription);
    setBusy(false);
    if (restored) {
      setSubscription(restored);
      setDone(true);
      window.setTimeout(() => onUnlocked?.(), 1200);
    } else {
      setError('We didn’t find an earlier purchase for this account.');
    }
  };

  return (
    <div className={styles.paywall}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" className={styles.done} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.soft}>
            <Emblem icon={Sparkle} size={104} glow />
            <h2 className={styles.doneTitle}>Welcome to Bless Them+</h2>
            <p className={styles.doneBody}>Everything is open to you. Thank you for building a rhythm of prayer for the people you love.</p>
            <Button onClick={onUnlocked ?? onClose} size="md">
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div key="offer" variants={stagger(0.05)} initial="hidden" animate="show" exit={{ opacity: 0 }}>
            <motion.div variants={fadeUp} className={styles.hero}>
              <div className={styles.postcard} aria-hidden="true">
                <SceneImage scene="golden-grass" sizes="(min-width: 540px) 480px, 92vw" className={styles.postcardImage} />
              </div>
              <p className={cx('overline', styles.eyebrow)}>Bless Them+</p>
              <h2 className={styles.title}>Pray more intentionally for the people you love.</h2>
              <p className={styles.lede}>Unlimited personalized Scripture blessings for your family.</p>
            </motion.div>

            <motion.ul variants={fadeUp} role="list" className={styles.benefits}>
              {BENEFITS.map(({ icon: Icon, title, body }) => (
                <li key={title} className={styles.benefit}>
                  <span className={styles.benefitIcon}>
                    <Icon size={20} weight="duotone" />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <span className={styles.benefitBody}>{body}</span>
                  </span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className={styles.plans} role="radiogroup" aria-label="Choose a plan">
              {(['annual', 'monthly'] as PlanId[]).map((id) => {
                const p = PLANS[id];
                const on = plan === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={cx(styles.plan, on && styles.planOn)}
                    onClick={() => {
                      haptics.selection();
                      setPlan(id);
                    }}
                  >
                    <span className={styles.radio} aria-hidden="true">
                      {on && <Check size={13} weight="bold" />}
                    </span>
                    <span className={styles.planText}>
                      <span className={styles.planName}>
                        {p.name}
                        {p.badge && <span className={styles.badge}>{p.badge}</span>}
                      </span>
                      <span className={styles.planDetail}>
                        {p.trialDays ? `${p.trialDays}-day free trial, then ` : ''}
                        {p.priceLabel}/{p.period}
                      </span>
                    </span>
                    <span className={styles.planPrice}>{p.perMonthLabel}</span>
                  </button>
                );
              })}
            </motion.div>

            <motion.div variants={fadeUp} className={styles.actions}>
              <Button block loading={busy} onClick={buy}>
                {selected.trialDays ? 'Start my family plan' : 'Subscribe monthly'}
              </Button>
              <p className={styles.terms}>{selected.renewal}</p>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <Button
                variant="ghost"
                block
                size="md"
                onClick={() => {
                  track({ name: 'paywall_dismissed', props: { source } });
                  onClose();
                }}
              >
                Continue free
              </Button>
              <div className={styles.links}>
                <button type="button" onClick={restore} disabled={busy}>
                  Restore purchases
                </button>
                <span aria-hidden="true">·</span>
                <a href="/about#terms">Terms</a>
                <span aria-hidden="true">·</span>
                <a href="/about#privacy">Privacy</a>
              </div>
              {purchases.mode === 'preview' && <p className={styles.preview}>Preview build — no payment is taken.</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
