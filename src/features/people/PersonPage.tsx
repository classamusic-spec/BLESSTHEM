import { CalendarPlus, HandHeart, PencilSimple, Trash } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ENTRY_BY_ID } from '@/content/blessings';
import { JOURNEY_BY_ID } from '@/content/journeys';
import { sceneForPerson } from '@/content/scenery';
import { formatRef } from '@/content/scripture';
import { AGE_LABELS, OCCASION_BY_ID, TOPIC_BY_ID } from '@/content/taxonomy';
import { RELATIONSHIP_LABEL } from '@/data/models';
import { useStore } from '@/data/store';
import { Button, ButtonLink, IconButton } from '@/design/Button';
import { ProgressRing } from '@/design/Controls';
import { Page, PageHeader, Section } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { PersonAvatar } from '@/design/PersonAvatar';
import { SceneImage } from '@/design/SceneImage';
import { EmptyState } from '@/design/States';
import { TopicIcon } from '@/design/TopicIcon';
import { monthRhythm } from '@/engine/rhythm';
import { useToday } from '@/hooks/useToday';
import { formatRelativeDay, formatShortDate, nextOccurrence } from '@/lib/dates';
import { Composer } from '@/features/journal/Composer';
import { JournalCard } from '@/features/journal/JournalCard';
import { SpecialDateSheet } from './SpecialDateSheet';
import styles from './PersonPage.module.css';

/** Each person becomes a quiet spiritual timeline: what you pray about, what you’ve prayed, what God has done. */
export default function PersonPage() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const today = useToday();
  const person = useStore((s) => s.people.find((p) => p.id === personId));
  const blessings = useStore((s) => s.blessings);
  const journal = useStore((s) => s.journal);
  const specialDates = useStore((s) => s.specialDates);
  const journeys = useStore((s) => s.journeys);
  const selectPerson = useStore((s) => s.selectPerson);
  const removeSpecialDate = useStore((s) => s.removeSpecialDate);
  const [sheet, setSheet] = useState<'date' | 'prayer' | null>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  const recent = useMemo(
    () =>
      blessings
        .filter((b) => b.personId === personId && !b.replaced)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 6),
    [blessings, personId],
  );
  const notes = useMemo(() => journal.filter((j) => j.personId === personId).slice(0, 5), [journal, personId]);
  const days = useMemo(
    () =>
      specialDates
        .filter((s) => s.personId === personId)
        .map((s) => ({ s, next: nextOccurrence(s.date, s.yearly, today) }))
        .sort((a, b) => (a.next ?? '9999').localeCompare(b.next ?? '9999')),
    [specialDates, personId, today],
  );
  const theirJourneys = journeys.filter((j) => j.personId === personId);

  if (!person) {
    return (
      <Page>
        <PageHeader title="" back="/people" />
        <EmptyState pose="curious" title="We couldn’t find this person." body="They may have been removed." action={<ButtonLink to="/people">Back to People</ButtonLink>} />
      </Page>
    );
  }

  const month = monthRhythm(blessings, today, person.id);

  return (
    <Page>
      <div className={styles.poster} aria-hidden="true">
        <SceneImage scene={sceneForPerson(person.id)} priority sizes="100vw" className={styles.posterImage} />
      </div>
      <PageHeader
        title=""
        condensedTitle={person.name}
        condenseAfter={nameRef}
        back="/people"
        size="compact"
        actions={
          <IconButton label={`Edit ${person.name}`} tone="surface" onClick={() => navigate(`/people/${person.id}/edit`)}>
            <PencilSimple size={20} />
          </IconButton>
        }
      />

      <motion.section className={styles.hero} variants={stagger(0.07)} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className={styles.avatar}>
          <PersonAvatar person={person} size={96} />
        </motion.div>
        <motion.h1 ref={nameRef} variants={fadeUp} className={styles.name}>
          {person.name}
        </motion.h1>
        <motion.p variants={fadeUp} className={styles.meta}>
          {RELATIONSHIP_LABEL[person.relationship]}
          {person.ageGroup ? ` · ${AGE_LABELS[person.ageGroup]}` : ''}
        </motion.p>
        <motion.p variants={fadeUp} className={styles.stat}>
          {month.blessings === 0 ? 'A fresh month of blessing ahead.' : `${month.blessings} ${month.blessings === 1 ? 'blessing' : 'blessings'} this month`}
        </motion.p>
        <motion.div variants={fadeUp} className={styles.heroAction}>
          <Button
            onClick={() => {
              selectPerson(person.id);
              navigate('/today');
            }}
          >
            Bless {person.relationship === 'family' ? 'your family' : person.name} now
          </Button>
        </motion.div>
      </motion.section>

      <Section title="Currently praying about" action={<Link to={`/people/${person.id}/edit`} className={styles.link}>Edit</Link>}>
        {person.focusTopics.length ? (
          <ul role="list" className={styles.topics}>
            {person.focusTopics.map((t) => (
              <li key={t} className={styles.topic}>
                <TopicIcon name={TOPIC_BY_ID[t]?.icon ?? 'Sparkle'} size={18} />
                {TOPIC_BY_ID[t]?.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Choose a few topics and we’ll weave them into each day’s blessing.</p>
        )}
        {person.concern && <p className={styles.concern}>“{person.concern}”</p>}
      </Section>

      <Section
        title="Prayer journal"
        action={
          <Button variant="ghost" size="sm" icon={<HandHeart />} onClick={() => setSheet('prayer')}>
            Add a prayer
          </Button>
        }
      >
        {notes.length ? (
          <div className={styles.stack}>
            {notes.map((j) => (
              <JournalCard key={j.id} entry={j} />
            ))}
          </div>
        ) : (
          <p className={styles.muted}>Keep the things you’re carrying for {person.name} — “Big math test Thursday.” “Starting soccer.” You can mark prayers as answered later.</p>
        )}
      </Section>

      <Section
        title="Special days"
        action={
          <Button variant="ghost" size="sm" icon={<CalendarPlus />} onClick={() => setSheet('date')}>
            Add
          </Button>
        }
      >
        {days.length ? (
          <ul role="list" className={styles.days}>
            {days.map(({ s, next }) => {
              const o = OCCASION_BY_ID[s.occasion];
              return (
                <li key={s.id} className={styles.day}>
                  <span className={styles.dayIcon}>
                    <TopicIcon name={o.icon} size={18} />
                  </span>
                  <span className={styles.dayText}>
                    <strong>{s.note ? `${o.label} · ${s.note}` : o.label}</strong>
                    <small>{next ? `${formatRelativeDay(next, today) === 'Today' ? 'Today' : formatShortDate(next)}${s.yearly ? ' · every year' : ''}` : 'Passed'}</small>
                  </span>
                  <IconButton label={`Remove ${o.label}`} size="sm" onClick={() => removeSpecialDate(s.id)}>
                    <Trash size={17} />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.muted}>Birthdays, first days of school, big games, surgeries — we’ll have a fitting blessing ready.</p>
        )}
      </Section>

      {theirJourneys.length > 0 && (
        <Section title="Journeys">
          <div className={styles.stack}>
            {theirJourneys.map((j) => {
              const journey = JOURNEY_BY_ID[j.journeyId];
              if (!journey) return null;
              return (
                <Link key={j.id} to={`/library/journeys/${journey.id}?person=${person.id}`} className={styles.journey}>
                  <ProgressRing value={j.completedDays.length / journey.days.length} size={44}>
                    {j.completedDays.length}
                  </ProgressRing>
                  <span>
                    <strong>{journey.title}</strong>
                    <small>{j.finishedAt ? 'Completed' : `Day ${j.completedDays.length + 1} of ${journey.days.length}`}</small>
                  </span>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Recent blessings">
        {recent.length ? (
          <ul role="list" className={styles.recent}>
            {recent.map((b) => {
              const entry = ENTRY_BY_ID.get(b.entryId);
              if (!entry) return null;
              return (
                <li key={b.id}>
                  <Link to={`/blessing/${b.id}`} className={styles.recentItem}>
                    <span className={styles.recentDate}>{formatRelativeDay(b.date, today)}</span>
                    <span className={styles.recentTheme}>{TOPIC_BY_ID[b.topicId]?.title}</span>
                    <span className={styles.recentRef}>{formatRef(entry.ref)}</span>
                    {b.prayedAt && <span className={styles.prayed} aria-label="Prayed" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.muted}>Blessings you share with {person.name} will gather here.</p>
        )}
      </Section>

      <SpecialDateSheet open={sheet === 'date'} onClose={() => setSheet(null)} person={person} />
      <Composer open={sheet === 'prayer'} onClose={() => setSheet(null)} seed={{ kind: 'request', personId: person.id }} />
    </Page>
  );
}
