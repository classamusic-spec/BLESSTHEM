import { Check, LockSimple } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { JOURNEY_BY_ID } from '@/content/journeys';
import { formatRef } from '@/content/scripture';
import { TOPIC_BY_ID } from '@/content/taxonomy';
import { currentBlessing, isPlus, useStore } from '@/data/store';
import { Button, ButtonLink } from '@/design/Button';
import { ProgressRing } from '@/design/Controls';
import { Page, PageHeader } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { PersonSelector } from '@/design/PersonSelector';
import { EmptyState } from '@/design/States';
import { TopicIcon } from '@/design/TopicIcon';
import { journeyPlan, journeySuits, nextJourneyDay } from '@/engine/journeys';
import { useToday } from '@/hooks/useToday';
import { dayKey } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { Pip } from '@/mascot/Pip';
import { BlessingCard } from '@/features/blessing/BlessingCard';
import { usePaywall } from '@/features/premium/PaywallProvider';
import styles from './Journeys.module.css';

export default function JourneyPage() {
  const { journeyId } = useParams();
  const [params] = useSearchParams();
  const today = useToday();
  const journey = journeyId ? JOURNEY_BY_ID[journeyId] : undefined;
  const people = useStore((s) => s.people);
  const blessings = useStore((s) => s.blessings);
  const allProgress = useStore((s) => s.journeys);
  const start = useStore((s) => s.startJourney);
  const setBlessing = useStore((s) => s.setBlessing);
  const markPrayed = useStore((s) => s.markPrayed);
  const leave = useStore((s) => s.leaveJourney);
  const plus = useStore(isPlus);
  const paywall = usePaywall();

  const eligible = useMemo(() => (journey ? people.filter((p) => journeySuits(journey, p)) : []), [journey, people]);
  const [personId, setPersonId] = useState(() => params.get('person') ?? eligible[0]?.id);
  const person = eligible.find((p) => p.id === personId) ?? eligible[0];
  const progress = journey && person ? allProgress.find((p) => p.journeyId === journey.id && p.personId === person.id) : undefined;
  const plan = useMemo(() => (journey && person ? journeyPlan(journey, person) : []), [journey, person]);

  if (!journey) {
    return (
      <Page>
        <PageHeader title="" back="/library/journeys" />
        <EmptyState pose="curious" title="We couldn’t find that journey." action={<ButtonLink to="/library/journeys">All journeys</ButtonLink>} />
      </Page>
    );
  }

  const nextDay = nextJourneyDay(journey, progress);
  const finished = Boolean(progress?.finishedAt);
  const todays = person ? currentBlessing(blessings, person.id, today) : undefined;
  const doneToday = progress?.lastCompletedAt ? dayKey(new Date(progress.lastCompletedAt)) === today : false;
  const day = plan[nextDay];
  const dayBlessing = todays?.journeyId === journey.id && todays.journeyDay === nextDay ? todays : undefined;

  const begin = () => {
    if (!person) return;
    if (!plus) {
      paywall.open(`journey:${journey.id}`, () => start(journey.id, person.id));
      return;
    }
    start(journey.id, person.id);
  };

  return (
    <Page>
      <PageHeader title="" back="/library/journeys" size="compact" />
      <motion.header className={cx(styles.hero, styles[`tone-${journey.tone}`])} variants={stagger(0.07)} initial="hidden" animate="show">
        <motion.span variants={fadeUp} className={styles.heroIcon}>
          <TopicIcon name={journey.icon} size={30} />
        </motion.span>
        <motion.p variants={fadeUp} className={styles.heroLength}>
          {journey.days.length}-day journey
        </motion.p>
        <motion.h1 variants={fadeUp} className={styles.heroTitle}>
          {journey.title}
        </motion.h1>
        <motion.p variants={fadeUp} className={styles.heroBody}>
          {journey.description}
        </motion.p>
      </motion.header>

      {eligible.length === 0 ? (
        <EmptyState compact pose="curious" title="This journey is for someone else in your life." body="It’s written for a different relationship or age. Add someone it fits from People." action={<ButtonLink to="/people/new" variant="secondary" size="md">Add someone</ButtonLink>} />
      ) : (
        <>
          {eligible.length > 1 && (
            <div className={styles.who}>
              <p className={styles.whoLabel}>Who is this journey for?</p>
              <PersonSelector people={eligible} selectedId={person?.id} onSelect={setPersonId} label="Who is this journey for?" />
            </div>
          )}

          {!progress && (
            <div className={styles.begin}>
              <Button block onClick={begin} icon={!plus ? <LockSimple /> : undefined}>
                Begin with {person?.name}
              </Button>
              {!plus && <p className={styles.small}>Prayer journeys are part of Bless Them+.</p>}
            </div>
          )}

          {progress && day && !finished && person && (
            <section className={styles.today} aria-labelledby="journey-today">
              <div className={styles.todayHead}>
                <ProgressRing value={progress.completedDays.length / journey.days.length} size={48}>
                  {progress.completedDays.length}
                </ProgressRing>
                <div>
                  <p className="overline">
                    Day {nextDay + 1} of {journey.days.length}
                  </p>
                  <h2 id="journey-today" className={styles.todayTitle}>
                    {day.title}
                  </h2>
                </div>
              </div>
              {doneToday && !dayBlessing ? (
                <p className={styles.small}>Today’s step is done. Day {nextDay + 1} will be here tomorrow — there’s no rush.</p>
              ) : day.entry ? (
                <BlessingCard
                  person={person}
                  entryId={day.entry.id}
                  blessing={dayBlessing}
                  eyebrow={`${journey.title} · Day ${nextDay + 1}`}
                  onPray={() => {
                    if (dayBlessing) return;
                    const b = setBlessing(person.id, day.entry!.id, 'journey', { journeyId: journey.id, journeyDay: nextDay });
                    if (b) markPrayed(b.id);
                  }}
                />
              ) : null}
            </section>
          )}

          <AnimatePresence>
            {finished && (
              <motion.div className={styles.finished} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Pip pose="heart" size={112} glow />
                <h2 className={styles.todayTitle}>You finished {journey.title}.</h2>
                <p className={styles.small}>
                  {journey.days.length} days of blessing {person?.name}. Take a moment to thank God for this time.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <ol className={styles.days}>
            {plan.map((d) => {
              const complete = progress?.completedDays.includes(d.index);
              const current = Boolean(progress) && !finished && d.index === nextDay;
              return (
                <li key={d.index} className={cx(styles.dayRow, complete && styles.dayDone, current && styles.dayCurrent)}>
                  <span className={styles.dayNum} aria-hidden="true">
                    {complete ? <Check size={14} weight="bold" /> : d.index + 1}
                  </span>
                  <span className={styles.dayText}>
                    <strong>{d.title}</strong>
                    <small>
                      {TOPIC_BY_ID[journey.days[d.index].topic]?.title}
                      {d.entry ? ` · ${formatRef(d.entry.ref)}` : ''}
                    </small>
                  </span>
                  <span className="visually-hidden">{complete ? 'Completed' : current ? 'Current day' : 'Upcoming'}</span>
                </li>
              );
            })}
          </ol>

          {progress && (
            <div className={styles.leave}>
              <Button variant="ghost" size="sm" onClick={() => leave(progress.id)}>
                {finished ? 'Start over' : 'Leave this journey'}
              </Button>
            </div>
          )}
        </>
      )}
    </Page>
  );
}
