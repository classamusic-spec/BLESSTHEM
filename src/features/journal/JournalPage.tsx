import { Check, NotePencil, Plus } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ENTRY_BY_ID } from '@/content/blessings';
import { formatRef } from '@/content/scripture';
import { TOPIC_BY_ID } from '@/content/taxonomy';
import type { Blessing, JournalEntry } from '@/data/models';
import { useStore } from '@/data/store';
import { Button } from '@/design/Button';
import { Segmented } from '@/design/Controls';
import { Page, PageHeader, Section } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { PersonAvatar } from '@/design/PersonAvatar';
import { EmptyState } from '@/design/States';
import { dayKey, formatRelativeDay, parseDayKey } from '@/lib/dates';
import { EntryRow } from '@/features/library/EntryRow';
import { Composer } from './Composer';
import { JournalCard } from './JournalCard';
import styles from './JournalPage.module.css';

type View = 'timeline' | 'people' | 'answered' | 'favorites';

type TimelineItem = { kind: 'entry'; at: string; entry: JournalEntry } | { kind: 'blessing'; at: string; blessing: Blessing };

export default function JournalPage() {
  const journal = useStore((s) => s.journal);
  const blessings = useStore((s) => s.blessings);
  const people = useStore((s) => s.people);
  const favorites = useStore((s) => s.favorites);
  const [view, setView] = useState<View>('timeline');
  const [composing, setComposing] = useState(false);
  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [
      ...journal.map((entry) => ({ kind: 'entry' as const, at: entry.createdAt, entry })),
      ...blessings.filter((b) => b.prayedAt).map((blessing) => ({ kind: 'blessing' as const, at: blessing.prayedAt!, blessing })),
    ].sort((a, b) => (a.at < b.at ? 1 : -1));
    const groups: Array<{ month: string; items: TimelineItem[] }> = [];
    for (const item of items) {
      const month = new Date(item.at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (groups[groups.length - 1]?.month !== month) groups.push({ month, items: [] });
      groups[groups.length - 1].items.push(item);
    }
    return groups;
  }, [journal, blessings]);

  const answered = journal.filter((j) => j.answeredAt).sort((a, b) => (a.answeredAt! < b.answeredAt! ? 1 : -1));
  const openRequests = journal.filter((j) => j.kind === 'request' && !j.answeredAt);
  const isEmpty = journal.length === 0 && !blessings.some((b) => b.prayedAt);

  return (
    <Page>
      <PageHeader
        title="Journal"
        subtitle="What you’ve prayed, and what God has carried you through."
        scene="lake-dock"
        actions={
          <Button size="sm" variant="secondary" icon={<Plus weight="bold" />} onClick={() => setComposing(true)}>
            New
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          pose="nest"
          title="Your prayers will live here."
          body="Each time you bless someone, you can save what was on your heart and look back on what God has carried you through."
          action={
            <Button icon={<NotePencil />} onClick={() => setComposing(true)}>
              Write first prayer
            </Button>
          }
        />
      ) : (
        <>
          <Segmented<View>
            label="Journal view"
            layoutId="journal-view"
            value={view}
            onChange={setView}
            options={[
              { value: 'timeline', label: 'Timeline' },
              { value: 'people', label: 'By person' },
              { value: 'answered', label: 'Answered' },
              { value: 'favorites', label: 'Favorites' },
            ]}
          />

          <motion.div key={view} className={styles.view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
            {view === 'timeline' &&
              timeline.map((group) => (
                <Section key={group.month} title={group.month}>
                  <motion.ul role="list" className={styles.stack} variants={stagger(0.04)} initial="hidden" animate="show">
                    {group.items.map((item) =>
                      item.kind === 'entry' ? (
                        <motion.li key={item.entry.id} variants={fadeUp}>
                          <JournalCard entry={item.entry} person={item.entry.personId ? personById.get(item.entry.personId) : undefined} />
                        </motion.li>
                      ) : (
                        <motion.li key={item.blessing.id} variants={fadeUp}>
                          <BlessingRow blessing={item.blessing} />
                        </motion.li>
                      ),
                    )}
                  </motion.ul>
                </Section>
              ))}

            {view === 'people' &&
              people.map((p) => {
                const theirs = journal.filter((j) => j.personId === p.id);
                const count = blessings.filter((b) => b.personId === p.id && b.prayedAt).length;
                return (
                  <Section
                    key={p.id}
                    title={
                      <span className={styles.personTitle}>
                        <PersonAvatar person={p} size={30} />
                        {p.name}
                      </span>
                    }
                    action={<span className={styles.count}>{count} prayed</span>}
                  >
                    {theirs.length ? (
                      <div className={styles.stack}>
                        {theirs.map((j) => (
                          <JournalCard key={j.id} entry={j} />
                        ))}
                      </div>
                    ) : (
                      <p className={styles.muted}>No journal entries for {p.name} yet.</p>
                    )}
                  </Section>
                );
              })}

            {view === 'answered' &&
              (answered.length ? (
                <div className={styles.stack}>
                  <p className={styles.remember}>Remember what God has done.</p>
                  {answered.map((j) => (
                    <JournalCard key={j.id} entry={j} person={j.personId ? personById.get(j.personId) : undefined} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  pose="heart"
                  title="Answered prayers will gather here."
                  body={
                    openRequests.length
                      ? 'When you see a prayer answered, open it and mark it. Some prayers are answered in ways we can see, and some in ways we can’t yet — keep bringing them to God.'
                      : 'Add a prayer request, and when you see it answered, mark it here. Some prayers are answered in ways we can see, and some in ways we can’t yet.'
                  }
                />
              ))}

            {view === 'favorites' &&
              (favorites.length || journal.some((j) => j.favorite) ? (
                <div className={styles.stack}>
                  {favorites.map((f) => {
                    const entry = ENTRY_BY_ID.get(f.entryId);
                    return entry ? <EntryRow key={f.id} entry={entry} showTopic /> : null;
                  })}
                  {journal
                    .filter((j) => j.favorite)
                    .map((j) => (
                      <JournalCard key={j.id} entry={j} person={j.personId ? personById.get(j.personId) : undefined} />
                    ))}
                </div>
              ) : (
                <EmptyState compact pose="sprig" title="Keep the blessings you love." body="Tap the heart on any blessing to save it here." />
              ))}
          </motion.div>
        </>
      )}

      <Composer open={composing} onClose={() => setComposing(false)} seed={{ kind: 'request' }} />
    </Page>
  );
}

function BlessingRow({ blessing }: { blessing: Blessing }) {
  const person = useStore((s) => s.people.find((p) => p.id === blessing.personId));
  const entry = ENTRY_BY_ID.get(blessing.entryId);
  if (!entry || !person) return null;
  const day = dayKey(parseDayKey(blessing.date));
  return (
    <Link to={`/blessing/${blessing.id}`} className={styles.blessing}>
      <span className={styles.blessingIcon} aria-hidden="true">
        <Check size={14} weight="bold" />
      </span>
      <span className={styles.blessingText}>
        Blessed <strong>{person.relationship === 'family' ? 'your family' : person.name}</strong> · {TOPIC_BY_ID[blessing.topicId]?.title}
      </span>
      <span className={styles.blessingMeta}>
        {formatRef(entry.ref)} · {formatRelativeDay(day)}
      </span>
    </Link>
  );
}
