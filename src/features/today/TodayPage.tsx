import { ArrowsClockwise, GearSix } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { OCCASION_BY_ID } from '@/content/taxonomy';
import { JOURNEY_BY_ID } from '@/content/journeys';
import { currentBlessing, isPlus, useStore } from '@/data/store';
import { Button } from '@/design/Button';
import { Ambient, Page } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { PersonSelector } from '@/design/PersonSelector';
import { BlessingSkeleton, EmptyState } from '@/design/States';
import { headingName } from '@/engine/compose';
import { useToday } from '@/hooks/useToday';
import { formatLongDate, greeting } from '@/lib/dates';
import { initials } from '@/lib/text';
import { track } from '@/services/analytics';
import { BlessingCard } from '@/features/blessing/BlessingCard';
import { FocusSheet } from '@/features/blessing/FocusSheet';
import { NotificationPrompt } from '@/features/notifications/NotificationPrompt';
import { usePaywall } from '@/features/premium/PaywallProvider';
import { RhythmCard } from './RhythmCard';
import { UpcomingMoments } from './UpcomingMoments';
import { FREE_LIMITS } from '@/data/models';
import styles from './TodayPage.module.css';

export function TodayPage() {
  const today = useToday();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const people = useStore((s) => s.people);
  const blessings = useStore((s) => s.blessings);
  const account = useStore((s) => s.account);
  const selectedId = useStore((s) => s.selectedPersonId);
  const selectPerson = useStore((s) => s.selectPerson);
  const ensureBlessing = useStore((s) => s.ensureBlessing);
  const changeFocus = useStore((s) => s.changeFocus);
  const journeys = useStore((s) => s.journeys);
  const plus = useStore(isPlus);
  const paywall = usePaywall();
  const [focusOpen, setFocusOpen] = useState(false);

  // Deep links from notifications and widgets: /today?person=…&from=notification
  useEffect(() => {
    const person = params.get('person');
    const from = params.get('from');
    if (person && people.some((p) => p.id === person)) selectPerson(person);
    if (from === 'notification') track({ name: 'notification_opened', props: { kind: params.get('kind') ?? 'unknown' } });
    if (person || from || params.get('source')) setParams({}, { replace: true });
  }, [params, people, selectPerson, setParams]);

  // Prepare (and cache) today’s blessing for everyone, so it’s ready offline.
  useEffect(() => {
    people.forEach((p) => ensureBlessing(p.id, today));
  }, [people, today, ensureBlessing]);

  const person = people.find((p) => p.id === selectedId) ?? people[0];
  const blessing = person ? currentBlessing(blessings, person.id, today) : undefined;
  const prayedIds = useMemo(
    () => new Set(blessings.filter((b) => b.date === today && b.prayedAt && !b.replaced).map((b) => b.personId)),
    [blessings, today],
  );

  const journeyProgress = person ? journeys.find((j) => j.personId === person.id && !j.finishedAt) : undefined;
  const journey = journeyProgress ? JOURNEY_BY_ID[journeyProgress.journeyId] : undefined;

  useEffect(() => {
    if (blessing) track({ name: 'blessing_viewed', props: { topic: blessing.topicId, source: blessing.source } });
  }, [blessing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstName = account?.name?.split(' ')[0];
  const addPerson = () => {
    if (!plus && people.length >= FREE_LIMITS.people) paywall.open('people-limit', () => navigate('/people/new'));
    else navigate('/people/new');
  };

  if (!person) {
    return (
      <Page>
        <EmptyState pose="wave" title="Who would you like to bless?" body="Add someone you love, and we’ll prepare a blessing for them each day." action={<Button onClick={() => navigate('/people/new')}>Add someone</Button>} />
      </Page>
    );
  }

  const eyebrow = blessing?.occasionId
    ? OCCASION_BY_ID[blessing.occasionId].eyebrow
    : blessing?.source === 'journey' && blessing.journeyId
      ? `${JOURNEY_BY_ID[blessing.journeyId]?.title ?? 'Journey'} · Day ${(blessing.journeyDay ?? 0) + 1}`
      : undefined;

  return (
    <Page className={styles.page}>
      <Ambient />
      <motion.header className={styles.hero} variants={stagger(0.07)} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className={styles.topRow}>
          <p className="overline">{formatLongDate(today)}</p>
          <Link to="/settings" className={styles.profile} aria-label="Settings and profile">
            {firstName ? <span className={styles.profileInitial}>{initials(firstName)}</span> : <GearSix size={20} />}
          </Link>
        </motion.div>
        <motion.h1 variants={fadeUp} className={styles.greeting}>
          {greeting()}
          {firstName ? `, ${firstName}.` : '.'}
        </motion.h1>
        <motion.p variants={fadeUp} className={styles.question}>
          Who are you blessing today?
        </motion.p>
      </motion.header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18, duration: 0.4 }}>
        <PersonSelector people={people} selectedId={person.id} prayedIds={prayedIds} onSelect={selectPerson} onAdd={addPerson} />
      </motion.div>

      <UpcomingMoments />

      {journey && journeyProgress && (
        <Link to={`/library/journeys/${journey.id}?person=${person.id}`} className={styles.journey}>
          <span className={styles.journeyDot} aria-hidden="true" />
          <span>
            <strong>{journey.title}</strong> · Day {Math.min(journey.days.length, journeyProgress.completedDays.length + 1)} of {journey.days.length}
          </span>
        </Link>
      )}

      <div className={styles.cardArea}>
        <AnimatePresence mode="wait" initial={false}>
          {blessing ? (
            <motion.div
              key={blessing.id}
              initial={{ opacity: 0, y: 14, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <BlessingCard person={person} entryId={blessing.entryId} blessing={blessing} eyebrow={eyebrow} />
            </motion.div>
          ) : (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <BlessingSkeleton />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {blessing && !blessing.prayedAt && (
        <div className={styles.focus}>
          <Button variant="ghost" size="sm" icon={<ArrowsClockwise />} onClick={() => setFocusOpen(true)}>
            Choose a different focus for {headingName(person)}
          </Button>
        </div>
      )}

      {prayedIds.size > 0 && <NotificationPrompt />}

      <RhythmCard />

      <FocusSheet open={focusOpen} onClose={() => setFocusOpen(false)} person={person} currentTopic={blessing?.topicId} onChoose={(topic) => changeFocus(person.id, topic)} />
    </Page>
  );
}
