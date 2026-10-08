import { Compass } from '@phosphor-icons/react';
import { useParams } from 'react-router';
import { JOURNEY_BY_ID } from '@/content/journeys';
import { OCCASION_BY_ID } from '@/content/taxonomy';
import { useStore } from '@/data/store';
import { ButtonLink } from '@/design/Button';
import { Page, PageHeader } from '@/design/Layout';
import { EmptyState } from '@/design/States';
import { formatLongDate } from '@/lib/dates';
import { BlessingCard } from './BlessingCard';

/** A blessing from the timeline, exactly as it was given that day. */
export default function BlessingPage() {
  const { blessingId } = useParams();
  const blessing = useStore((s) => s.blessings.find((b) => b.id === blessingId));
  const person = useStore((s) => s.people.find((p) => p.id === blessing?.personId));

  if (!blessing || !person) {
    return (
      <Page>
        <PageHeader title="" back />
        <EmptyState icon={Compass} title="We couldn’t find this blessing." body="It may belong to someone who was removed." action={<ButtonLink to="/journal">Back to Journal</ButtonLink>} />
      </Page>
    );
  }

  const eyebrow = blessing.occasionId
    ? OCCASION_BY_ID[blessing.occasionId].eyebrow
    : blessing.journeyId
      ? `${JOURNEY_BY_ID[blessing.journeyId]?.title} · Day ${(blessing.journeyDay ?? 0) + 1}`
      : undefined;

  return (
    <Page>
      <PageHeader back title={formatLongDate(blessing.date)} eyebrow={blessing.prayedAt ? 'Prayed' : 'Blessing'} size="compact" />
      <BlessingCard person={person} entryId={blessing.entryId} blessing={blessing} eyebrow={eyebrow} />
    </Page>
  );
}
