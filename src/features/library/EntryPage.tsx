import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { ENTRY_BY_ID } from '@/content/blessings';
import { TOPIC_BY_ID } from '@/content/taxonomy';
import { currentBlessing, isPlus, useStore } from '@/data/store';
import { ButtonLink } from '@/design/Button';
import { Page, PageHeader } from '@/design/Layout';
import { PersonSelector } from '@/design/PersonSelector';
import { EmptyState } from '@/design/States';
import { entrySuits } from '@/engine/personalize';
import { useToday } from '@/hooks/useToday';
import { BlessingCard } from '@/features/blessing/BlessingCard';
import { usePaywall } from '@/features/premium/PaywallProvider';
import styles from './EntryPage.module.css';

/** A library blessing, prepared for whoever you choose. */
export default function EntryPage() {
  const { entryId } = useParams();
  const today = useToday();
  const entry = entryId ? ENTRY_BY_ID.get(entryId) : undefined;
  const people = useStore((s) => s.people);
  const blessings = useStore((s) => s.blessings);
  const selectedId = useStore((s) => s.selectedPersonId);
  const setBlessing = useStore((s) => s.setBlessing);
  const markPrayed = useStore((s) => s.markPrayed);
  const plus = useStore(isPlus);
  const paywall = usePaywall();
  const [personId, setPersonId] = useState(selectedId ?? people[0]?.id);

  const person = people.find((p) => p.id === personId) ?? people[0];
  const blessing = useMemo(() => {
    if (!person || !entry) return undefined;
    const b = currentBlessing(blessings, person.id, today);
    return b?.entryId === entry.id ? b : undefined;
  }, [blessings, person, entry, today]);

  if (!entry || !person) {
    return (
      <Page>
        <PageHeader title="" back="/library" />
        <EmptyState pose="curious" title="We couldn’t find that blessing." action={<ButtonLink to="/library">Back to Library</ButtonLink>} />
      </Page>
    );
  }

  const topic = TOPIC_BY_ID[entry.topic];
  if (!topic.free && !plus) {
    return (
      <Page>
        <PageHeader title="" back={`/library/topic/${topic.id}`} />
        <EmptyState pose="nest" title={`${topic.title} is part of Bless Them+`} body="The full library holds Scripture blessings for every season of life." action={<ButtonLink to="/plus">See Bless Them+</ButtonLink>} />
      </Page>
    );
  }

  const suits = entrySuits(entry, person);

  return (
    <Page>
      <PageHeader back eyebrow={topic.title} title="Who is this blessing for?" size="compact" />
      <PersonSelector people={people} selectedId={person.id} onSelect={setPersonId} label="Choose who this blessing is for" />
      {!suits && <p className={styles.note}>This passage was written with a different age in mind, but you’re welcome to pray it.</p>}
      <div className={styles.card}>
        <BlessingCard
          key={`${entry.id}-${person.id}`}
          person={person}
          entryId={entry.id}
          blessing={blessing}
          onPray={() => {
            if (blessing) return;
            const created = setBlessing(person.id, entry.id, 'library');
            if (created) markPrayed(created.id);
          }}
        />
      </div>
      {!plus && <p className={styles.note}>Praying from the library sets today’s blessing for {person.name}. <button type="button" className={styles.inline} onClick={() => paywall.open('library-unlimited')}>Unlimited blessings with Bless Them+</button></p>}
    </Page>
  );
}
