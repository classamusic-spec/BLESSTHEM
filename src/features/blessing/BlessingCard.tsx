import { ArrowsOutSimple, BookOpen, Export, Heart } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { ENTRY_BY_ID } from '@/content/blessings';
import type { Blessing, Person } from '@/data/models';
import { useStore } from '@/data/store';
import { Button, IconButton } from '@/design/Button';
import { Ornament } from '@/design/Layout';
import { fadeUp } from '@/design/motion';
import { BlessingSkeleton, ErrorState } from '@/design/States';
import { useToast } from '@/design/Toast';
import { headingName } from '@/engine/compose';
import { cx } from '@/lib/cx';
import { track } from '@/services/analytics';
import { haptics } from '@/services/haptics';
import { speakableReference } from '@/services/speech';
import { Composer, type ComposerSeed } from '@/features/journal/Composer';
import { usePaywall } from '@/features/premium/PaywallProvider';
import { ShareSheet } from '@/features/share/ShareSheet';
import { AudioControl } from './AudioControl';
import { BlessingMoment } from './BlessingMoment';
import { ContextSheet } from './ContextSheet';
import { PrayedButton } from './PrayedButton';
import { ScriptureText } from './ScriptureText';
import { useComposed } from './useComposed';
import styles from './BlessingCard.module.css';

interface BlessingCardProps {
  person: Person;
  entryId: string;
  blessing?: Blessing;
  /** Replaces the default “For Gabriel · Courage” eyebrow (occasions, journeys). */
  eyebrow?: string;
  /** Replaces the completion area (e.g. onboarding’s “I want this each day”). */
  footer?: ReactNode;
  onPray?(): void;
  /** Hide secondary chrome (favorite/share) — used in onboarding preview. */
  minimal?: boolean;
  className?: string;
}

const reveal = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '0px 0px -8% 0px' },
  variants: fadeUp,
};

/**
 * The daily blessing — the most important screen in the product.
 * Person → Scripture → reflection → blessing → prayer → conversation → done.
 */
export function BlessingCard({ person, entryId, blessing, eyebrow, footer, onPray, minimal, className }: BlessingCardProps) {
  const { composed, loading } = useComposed(entryId, person);
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const markPrayed = useStore((s) => s.markPrayed);
  const toast = useToast();
  const paywall = usePaywall();
  const [sheet, setSheet] = useState<'context' | 'share' | 'moment' | 'reflect' | null>(null);
  const [seed, setSeed] = useState<ComposerSeed | undefined>();

  const entry = ENTRY_BY_ID.get(entryId);
  if (loading) return <BlessingSkeleton />;
  if (!entry || !composed) return <ErrorState />;

  const passage = composed.passage;
  const prayed = Boolean(blessing?.prayedAt);
  const favorite = favorites.some((f) => f.entryId === entryId);
  const name = headingName(person);

  const pray = () => {
    if (blessing) markPrayed(blessing.id);
    onPray?.();
  };

  const onFavorite = () => {
    const result = toggleFavorite(entryId, person.id);
    if (result.limited) {
      paywall.open('favorites-limit');
      return;
    }
    haptics.light();
    toast.show(result.added ? 'Saved to favorites.' : 'Removed from favorites.', { icon: <Heart weight="fill" /> });
  };

  return (
    <article className={cx(styles.card, prayed && styles.prayed, className)} aria-labelledby={`blessing-${entryId}`}>
      <div className={styles.light} aria-hidden="true" />

      <header className={styles.top}>
        <p className={styles.eyebrow} id={`blessing-${entryId}`}>
          {eyebrow ?? (
            <>
              <span>For {name}</span>
              <span className={styles.dot} aria-hidden="true">·</span>
              <span className={styles.theme}>{composed.topic.title}</span>
            </>
          )}
        </p>
        {!minimal && (
          <div className={styles.tools}>
            <IconButton label={favorite ? 'Remove from favorites' : 'Save to favorites'} pressed={favorite} onClick={onFavorite} size="sm">
              <Heart size={20} weight={favorite ? 'fill' : 'regular'} />
            </IconButton>
            <IconButton label="Share blessing" onClick={() => setSheet('share')} size="sm">
              <Export size={20} />
            </IconButton>
          </div>
        )}
      </header>

      {/* Scripture */}
      <section className={styles.scripture} aria-label="Scripture">
        {passage ? (
          <>
            <p className={styles.reference}>
              <span>{passage.display}</span>
              <span className={styles.translation}>{passage.translation.abbreviation}</span>
            </p>
            <blockquote className={styles.verse}>
              <ScriptureText passage={passage} />
            </blockquote>
            <div className={styles.scriptureActions}>
              <Button variant="ghost" size="sm" icon={<BookOpen />} onClick={() => setSheet('context')}>
                Read context
              </Button>
              {!minimal && <AudioControl text={`${speakableReference(passage.display)}. ${passage.text}`} label={`${passage.display}`} part="scripture" />}
            </div>
          </>
        ) : (
          <ErrorState
            title="We couldn’t load this Scripture."
            body="We only ever show verified Scripture, so we won’t fill this space with anything else. Your saved prayers are safe."
          />
        )}
      </section>

      <Ornament className={styles.ornament} />

      <motion.section className={styles.section} {...reveal}>
        <h3 className={styles.label}>Hold onto this</h3>
        <p className={styles.reflection}>{composed.reflection}</p>
      </motion.section>

      <motion.section className={cx(styles.section, styles.blessingPanel)} {...reveal}>
        <h3 className={styles.label}>{composed.speakHeading}</h3>
        <p className={styles.blessing}>{composed.blessing}</p>
        <div className={styles.panelActions}>
          <Button variant="ghost" size="sm" icon={<ArrowsOutSimple />} onClick={() => {
            track({ name: 'blessing_moment_opened' });
            setSheet('moment');
          }} aria-label="Read it aloud in a full-screen view">
            Read it aloud
          </Button>
          {!minimal && <AudioControl text={composed.blessing} label="the blessing" part="blessing" />}
        </div>
      </motion.section>

      <motion.section className={styles.section} {...reveal}>
        <h3 className={styles.label}>Pray</h3>
        <p className={styles.prayer}>{composed.prayer}</p>
      </motion.section>

      {composed.talk && (
        <motion.section className={cx(styles.section, styles.talkPanel)} {...reveal}>
          <h3 className={styles.label}>Talk about it</h3>
          <p className={styles.talk}>{composed.talk}</p>
        </motion.section>
      )}

      <motion.div className={styles.footer} {...reveal}>
        {footer ?? (
          <PrayedButton
            prayed={prayed}
            onPray={pray}
            confirmation={`You blessed ${name === 'your family' ? 'your family' : name} today.`}
            gentle={composed.topic.category === 'hard-seasons'}
            onReflect={() => {
              setSeed({ kind: 'reflection', personId: person.id, blessingId: blessing?.id, entryId });
              setSheet('reflect');
            }}
            onShare={() => setSheet('share')}
          />
        )}
      </motion.div>

      <ContextSheet entry={entry} open={sheet === 'context'} onClose={() => setSheet(null)} />
      {passage && <ShareSheet open={sheet === 'share'} onClose={() => setSheet(null)} composed={composed} />}
      <BlessingMoment
        open={sheet === 'moment'}
        onClose={() => setSheet(null)}
        composed={composed}
        personName={name}
        prayed={prayed}
        onPrayed={pray}
      />
      <Composer open={sheet === 'reflect'} onClose={() => setSheet(null)} seed={seed} />
    </article>
  );
}
