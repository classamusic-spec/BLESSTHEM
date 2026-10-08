import { Compass, Trash, UsersThree } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AGE_HINTS, AGE_LABELS, FOCUS_CHOICES } from '@/content/taxonomy';
import { AGE_GROUPS, type AgeGroup, type TopicId } from '@/content/types';
import { FREE_LIMITS, RELATIONSHIP_LABEL, RELATIONSHIP_PRONOUNS, type Pronouns, type Relationship } from '@/data/models';
import { isPlus, useStore } from '@/data/store';
import { Button, ButtonLink } from '@/design/Button';
import { ConfirmationSheet } from '@/design/ConfirmationSheet';
import { TextArea, TextField } from '@/design/Controls';
import { Page, PageHeader } from '@/design/Layout';
import { EmptyState } from '@/design/States';
import { useToast } from '@/design/Toast';
import { TopicChip } from '@/design/Topic';
import { topicSuits } from '@/engine/personalize';
import { checkSafety, type SafetyResult } from '@/engine/safety';
import { cx } from '@/lib/cx';
import { haptics } from '@/services/haptics';
import { usePaywall } from '@/features/premium/PaywallProvider';
import { SafetySupport } from '@/features/safety/SafetySupport';
import styles from './PersonEditPage.module.css';

const GROUPS: Array<{ label: string; options: Relationship[] }> = [
  { label: 'Children', options: ['son', 'daughter', 'child'] },
  { label: 'Grandchildren', options: ['grandson', 'granddaughter', 'grandchild'] },
  { label: 'Spouse', options: ['wife', 'husband', 'spouse'] },
  { label: 'Others', options: ['family', 'mother', 'father', 'parent', 'friend', 'other'] },
];

export default function PersonEditPage() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const existing = useStore((s) => s.people.find((p) => p.id === personId));
  const peopleCount = useStore((s) => s.people.length);
  const plus = useStore(isPlus);
  const addPerson = useStore((s) => s.addPerson);
  const updatePerson = useStore((s) => s.updatePerson);
  const removePerson = useStore((s) => s.removePerson);
  const paywall = usePaywall();
  const toast = useToast();

  const [name, setName] = useState(existing?.name ?? '');
  const [relationship, setRelationship] = useState<Relationship | undefined>(existing?.relationship);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | undefined>(existing?.ageGroup);
  const [pronouns, setPronouns] = useState<Pronouns | undefined>(existing?.pronouns);
  const [topics, setTopics] = useState<TopicId[]>(existing?.focusTopics ?? []);
  const [concern, setConcern] = useState(existing?.concern ?? '');
  const [error, setError] = useState<string>();
  const [confirm, setConfirm] = useState(false);
  const [safety, setSafety] = useState<SafetyResult | null>(null);

  const isNew = !personId;
  const blocked = isNew && !plus && peopleCount >= FREE_LIMITS.people;
  const needsPronoun = relationship !== undefined && !RELATIONSHIP_PRONOUNS[relationship];
  const isFamily = relationship === 'family';
  const draft = useMemo(() => ({ relationship: relationship ?? 'child', ageGroup }), [relationship, ageGroup]);
  const choices = FOCUS_CHOICES.filter((c) => c.topics.some((t) => topicSuits(t, draft)));

  if (!isNew && !existing) {
    return (
      <Page>
        <PageHeader title="" back="/people" />
        <EmptyState icon={Compass} title="We couldn’t find this person." action={<ButtonLink to="/people">Back to People</ButtonLink>} />
      </Page>
    );
  }

  if (blocked) {
    return (
      <Page>
        <PageHeader title="" back="/people" />
        <EmptyState
          icon={UsersThree}
          title="Room for everyone you love"
          body={`The free plan includes ${FREE_LIMITS.people} people. Bless Them+ lets you bless your whole family — children, grandchildren, spouse and friends.`}
          action={<Button onClick={() => paywall.open('people-limit')}>See Bless Them+</Button>}
        />
      </Page>
    );
  }

  const save = () => {
    if (!name.trim() && !isFamily) {
      setError('Please add a first name.');
      return;
    }
    if (!relationship) {
      setError('Please choose a relationship.');
      return;
    }
    const result = checkSafety(concern);
    if (result) {
      setSafety(result);
      return;
    }
    const data = {
      name: name.trim() || 'Our family',
      relationship,
      ageGroup: isFamily ? undefined : ageGroup,
      pronouns: pronouns ?? RELATIONSHIP_PRONOUNS[relationship] ?? 'they',
      focusTopics: topics,
      concern: concern.trim() || undefined,
    };
    haptics.light();
    if (existing) {
      updatePerson(existing.id, data);
      toast.show('Saved.');
      navigate(`/people/${existing.id}`, { replace: true });
    } else {
      const created = addPerson(data);
      toast.show(`${created.name} has been added.`);
      navigate(`/people/${created.id}`, { replace: true });
    }
  };

  return (
    <Page>
      <PageHeader back title={existing ? `Edit ${existing.name}` : 'Add someone you love'} size="compact" />

      <div className={styles.form}>
        <TextField
          label={isFamily ? 'Family name' : 'First name'}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(undefined);
          }}
          autoCapitalize="words"
          autoComplete="off"
          maxLength={40}
          placeholder={isFamily ? 'Our family' : 'Ella'}
          error={error}
        />

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Relationship</legend>
          {GROUPS.map((g) => (
            <div key={g.label} className={styles.group}>
              <p className={styles.groupLabel}>{g.label}</p>
              <div className={styles.chips}>
                {g.options.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={styles.option}
                    aria-pressed={relationship === r}
                    onClick={() => {
                      haptics.selection();
                      setRelationship(r);
                      setPronouns(RELATIONSHIP_PRONOUNS[r] ?? pronouns);
                      setError(undefined);
                    }}
                  >
                    {RELATIONSHIP_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        {needsPronoun && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>In prayers, we’ll say…</legend>
            <div className={styles.chips}>
              {(['he', 'she', 'they'] as Pronouns[]).map((p) => (
                <button key={p} type="button" className={styles.option} aria-pressed={(pronouns ?? 'they') === p} onClick={() => setPronouns(p)}>
                  {p === 'he' ? 'He · him' : p === 'she' ? 'She · her' : 'Their name'}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {!isFamily && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              Age <span className={styles.optional}>Optional</span>
            </legend>
            <div className={styles.chips}>
              {AGE_GROUPS.map((a) => (
                <button key={a} type="button" className={cx(styles.option, styles.age)} aria-pressed={ageGroup === a} onClick={() => setAgeGroup(ageGroup === a ? undefined : a)}>
                  {AGE_LABELS[a]}
                  <span>{AGE_HINTS[a]}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Praying about</legend>
          <div className={styles.chips}>
            {choices.map((c) => {
              const selected = c.topics.every((t) => topics.includes(t));
              return (
                <TopicChip
                  key={c.label}
                  label={c.label}
                  selected={selected}
                  onToggle={() => setTopics((cur) => (selected ? cur.filter((t) => !c.topics.includes(t)) : [...new Set([...cur, ...c.topics])]))}
                />
              );
            })}
          </div>
        </fieldset>

        <TextArea
          label="Something specific"
          optional
          rows={3}
          maxLength={160}
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          placeholder="Big math test Thursday."
          hint="Shapes their blessings. Stays on this device."
        />

        <Button block onClick={save}>
          {existing ? 'Save changes' : 'Add to my people'}
        </Button>

        {existing && (
          <Button variant="danger" block icon={<Trash />} onClick={() => setConfirm(true)}>
            Remove {existing.name}
          </Button>
        )}
      </div>

      {existing && (
        <ConfirmationSheet
          open={confirm}
          onClose={() => setConfirm(false)}
          destructive
          title={`Remove ${existing.name}?`}
          body={
            <>
              Their daily blessings, special days and journeys will be deleted from this device. Your journal entries are kept — they’re your words — but they won’t be linked to {existing.name} anymore.
            </>
          }
          confirmLabel={`Remove ${existing.name}`}
          onConfirm={() => {
            removePerson(existing.id);
            setConfirm(false);
            toast.show(`${existing.name} was removed.`);
            navigate('/people', { replace: true });
          }}
        />
      )}
      {safety && <SafetySupport result={safety} open onClose={() => setSafety(null)} />}
    </Page>
  );
}
