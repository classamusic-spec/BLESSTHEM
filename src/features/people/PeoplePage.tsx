import { CaretRight, Plus } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { AGE_LABELS, TOPIC_BY_ID } from '@/content/taxonomy';
import { FREE_LIMITS, RELATIONSHIP_LABEL } from '@/data/models';
import { isPlus, useStore } from '@/data/store';
import { Button } from '@/design/Button';
import { Page, PageHeader } from '@/design/Layout';
import { fadeUp, stagger } from '@/design/motion';
import { PersonAvatar } from '@/design/PersonAvatar';
import { EmptyState } from '@/design/States';
import { monthRhythm } from '@/engine/rhythm';
import { useToday } from '@/hooks/useToday';
import { usePaywall } from '@/features/premium/PaywallProvider';
import styles from './PeoplePage.module.css';

export default function PeoplePage() {
  const people = useStore((s) => s.people);
  const blessings = useStore((s) => s.blessings);
  const plus = useStore(isPlus);
  const paywall = usePaywall();
  const navigate = useNavigate();
  const today = useToday();

  const counts = useMemo(() => Object.fromEntries(people.map((p) => [p.id, monthRhythm(blessings, today, p.id).blessings])), [people, blessings, today]);
  const atLimit = !plus && people.length >= FREE_LIMITS.people;

  const add = () => (atLimit ? paywall.open('people-limit', () => navigate('/people/new')) : navigate('/people/new'));

  return (
    <Page>
      <PageHeader
        title="People"
        subtitle="The ones you carry in prayer."
        actions={
          <Button size="sm" variant="secondary" icon={<Plus weight="bold" />} onClick={add}>
            Add
          </Button>
        }
      />

      {people.length === 0 ? (
        <EmptyState pose="nest" title="Who would you like to bless?" body="Add a child, a spouse, a grandchild — anyone God has placed in your life." action={<Button onClick={add}>Add someone</Button>} />
      ) : (
        <motion.ul role="list" className={styles.list} variants={stagger(0.06)} initial="hidden" animate="show">
          {people.map((p) => (
            <motion.li key={p.id} variants={fadeUp}>
              <Link to={`/people/${p.id}`} className={styles.person}>
                <PersonAvatar person={p} size={56} />
                <span className={styles.text}>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.meta}>
                    {RELATIONSHIP_LABEL[p.relationship]}
                    {p.ageGroup ? ` · ${AGE_LABELS[p.ageGroup]}` : ''}
                  </span>
                  {p.focusTopics.length > 0 && (
                    <span className={styles.topics}>
                      {p.focusTopics.slice(0, 3).map((t) => (
                        <span key={t} className={styles.topic}>
                          {TOPIC_BY_ID[t]?.title}
                        </span>
                      ))}
                      {p.focusTopics.length > 3 && <span className={styles.more}>+{p.focusTopics.length - 3}</span>}
                    </span>
                  )}
                </span>
                <span className={styles.count}>
                  <strong>{counts[p.id]}</strong>
                  <small>this month</small>
                </span>
                <CaretRight size={16} weight="bold" className={styles.chev} aria-hidden="true" />
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}

      {atLimit && (
        <div className={styles.limit}>
          <p>
            <strong>Bless everyone you love.</strong> The free plan includes {FREE_LIMITS.people} people. Bless Them+ has room for your whole family.
          </p>
          <Button size="sm" variant="secondary" onClick={() => paywall.open('people-list')}>
            See Bless Them+
          </Button>
        </div>
      )}
    </Page>
  );
}
