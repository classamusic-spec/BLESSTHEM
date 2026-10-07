import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { isPlus, useStore } from '@/data/store';
import { Page, PageHeader } from '@/design/Layout';
import { EmptyState } from '@/design/States';
import { ButtonLink } from '@/design/Button';
import { track } from '@/services/analytics';
import { Paywall } from './Paywall';

export default function PlusPage() {
  const navigate = useNavigate();
  const plus = useStore(isPlus);
  useEffect(() => {
    if (!plus) track({ name: 'paywall_viewed', props: { source: 'plus-page' } });
  }, [plus]);

  return (
    <Page>
      <PageHeader title="" back size="compact" />
      {plus ? (
        <EmptyState
          pose="happy"
          title="You’re on Bless Them+"
          body="Everything is unlocked. Thank you for building a rhythm of prayer for the people you love."
          action={<ButtonLink to="/settings/subscription" variant="secondary" size="md">Manage subscription</ButtonLink>}
        />
      ) : (
        <Paywall source="plus-page" onClose={() => navigate(-1)} onUnlocked={() => navigate('/today')} />
      )}
    </Page>
  );
}
