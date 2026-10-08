import { AppleLogo, CaretLeft, EnvelopeSimple, GoogleLogo, HandHeart, HeartStraight, HouseLine, LockSimple, Plant, ShieldCheck, Tree, UsersThree } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogoMark } from '@/brand/Logo';
import { DAYPART_SCENE } from '@/content/scenery';
import { FOCUS_CHOICES, AGE_HINTS, AGE_LABELS } from '@/content/taxonomy';
import { AGE_GROUPS, type AgeGroup, type TopicId } from '@/content/types';
import { RELATIONSHIP_LABEL, RELATIONSHIP_PRONOUNS, type OnboardingIntent, type Person, type Pronouns, type Relationship } from '@/data/models';
import { useStore } from '@/data/store';
import { Button, IconButton } from '@/design/Button';
import { ChoiceCard, ProgressDots, TextArea, TextField } from '@/design/Controls';
import { ease, fadeUp, stagger } from '@/design/motion';
import { SceneImage } from '@/design/SceneImage';
import { TopicChip } from '@/design/Topic';
import { Emblem } from '@/design/Emblem';
import { chooseDaily, defaultTopicsFor, topicSuits } from '@/engine/personalize';
import { classifyTopics } from '@/engine/search';
import { checkSafety, type SafetyResult } from '@/engine/safety';
import { headingName } from '@/engine/compose';
import { daypart, dayKey } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { track } from '@/services/analytics';
import { auth } from '@/services/auth';
import { haptics } from '@/services/haptics';
import { BlessingCard } from '@/features/blessing/BlessingCard';
import { SafetySupport } from '@/features/safety/SafetySupport';
import styles from './Onboarding.module.css';

type Step = 'welcome' | 'who' | 'person' | 'topics' | 'preview' | 'account';
const ORDER: Step[] = ['welcome', 'who', 'person', 'topics', 'preview', 'account'];

const INTENTS: Array<{ id: OnboardingIntent; title: string; description: string; icon: ReactElement }> = [
  { id: 'child', title: 'My child', description: 'A son or daughter', icon: <Plant weight="duotone" /> },
  { id: 'children', title: 'My children', description: 'Begin with one, add the others next', icon: <UsersThree weight="duotone" /> },
  { id: 'spouse', title: 'My spouse', description: 'Husband or wife', icon: <HeartStraight weight="duotone" /> },
  { id: 'grandchild', title: 'My grandchild', description: 'Blessing the next generation', icon: <Tree weight="duotone" /> },
  { id: 'family', title: 'My family', description: 'Everyone under one roof', icon: <HouseLine weight="duotone" /> },
  { id: 'other', title: 'Someone else', description: 'A friend, a parent, someone you mentor', icon: <HandHeart weight="duotone" /> },
];

const RELATIONSHIPS: Record<OnboardingIntent, Relationship[]> = {
  child: ['son', 'daughter', 'child'],
  children: ['son', 'daughter', 'child'],
  spouse: ['wife', 'husband', 'spouse'],
  grandchild: ['grandson', 'granddaughter', 'grandchild'],
  family: ['family'],
  other: ['friend', 'mother', 'father', 'parent', 'other'],
};

const PERSON_PROMPT: Record<OnboardingIntent, string> = {
  child: 'Who should we begin with?',
  children: 'Let’s begin with one of them.',
  spouse: 'Who are you blessing?',
  grandchild: 'Who should we begin with?',
  family: 'What do you call your family?',
  other: 'Who would you like to bless?',
};

interface Draft {
  intent?: OnboardingIntent;
  name: string;
  relationship?: Relationship;
  ageGroup?: AgeGroup;
  pronouns?: Pronouns;
  topics: TopicId[];
  concern: string;
  showConcern: boolean;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const onboarded = useStore((s) => s.onboarded && s.people.length > 0);
  const store = useStore;
  const [step, setStep] = useState<Step>('welcome');
  const [dir, setDir] = useState(1);
  const [draft, setDraft] = useState<Draft>({ name: '', topics: [], concern: '', showConcern: false });
  const [nameError, setNameError] = useState<string>();
  const [safety, setSafety] = useState<SafetyResult | null>(null);
  const [preparing, setPreparing] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (onboarded) navigate('/today', { replace: true });
  }, [onboarded, navigate]);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      track({ name: 'onboarding_started' });
    }
    track({ name: 'onboarding_step', props: { step } });
  }, [step]);

  const go = (next: Step) => {
    setDir(ORDER.indexOf(next) > ORDER.indexOf(step) ? 1 : -1);
    setStep(next);
  };
  const back = () => go(ORDER[Math.max(0, ORDER.indexOf(step) - 1)]);

  const relationship: Relationship | undefined = draft.relationship ?? (draft.intent === 'family' ? 'family' : undefined);
  const isFamily = relationship === 'family';
  const isSpouse = draft.intent === 'spouse';
  const needsPronoun = relationship !== undefined && !RELATIONSHIP_PRONOUNS[relationship];

  /** The person as the engine will see them. */
  const person: Person | null = useMemo(() => {
    if (!relationship) return null;
    return {
      id: 'draft',
      name: draft.name.trim() || (isFamily ? 'Our family' : 'them'),
      relationship,
      ageGroup: isSpouse ? draft.ageGroup ?? 'adult' : isFamily ? undefined : draft.ageGroup,
      pronouns: draft.pronouns ?? RELATIONSHIP_PRONOUNS[relationship] ?? 'they',
      focusTopics: draft.topics,
      concern: draft.concern.trim() || undefined,
      hue: 'sage',
      order: 0,
      createdAt: new Date().toISOString(),
    };
  }, [draft, relationship, isFamily, isSpouse]);

  const choices = useMemo(
    () => (person ? FOCUS_CHOICES.filter((c) => c.topics.some((t) => topicSuits(t, person))) : FOCUS_CHOICES).slice(0, 19),
    [person],
  );

  /** The “aha”: a blessing shaped by exactly what they told us. */
  const preview = useMemo(() => {
    if (!person) return null;
    const fromConcern = person.concern ? classifyTopics(person.concern).map((t) => t.topic).find((t) => topicSuits(t, person)) : undefined;
    // The first impression should reflect exactly what they chose (or, if they let us
    // choose, the most fitting default for this relationship and age).
    const topic = fromConcern ?? draft.topics.find((t) => topicSuits(t, person)) ?? defaultTopicsFor(person)[0];
    return chooseDaily({ person, date: dayKey(), history: [], topic });
  }, [person, draft.topics]);

  const submitPerson = () => {
    if (!draft.name.trim() && !isFamily) {
      setNameError('Please add a first name — it’s how we’ll personalize each blessing.');
      return;
    }
    if (!relationship) return;
    go('topics');
  };

  const submitTopics = () => {
    const result = checkSafety(draft.concern);
    if (result) {
      setSafety(result);
      track({ name: 'safety_support_shown', props: { category: result.category } });
      return;
    }
    setPreparing(true);
    go('preview');
    window.setTimeout(() => setPreparing(false), 1500);
  };

  const finish = async (provider: 'guest' | 'apple' | 'google' | 'email', details: { name?: string; email?: string } = {}) => {
    if (!person || !preview) return;
    const s = store.getState();
    let signedUp = false;
    if (provider !== 'guest') {
      const account = await auth.signIn(provider, details);
      s.setAccount(account);
      signedUp = true;
      track({ name: 'account_created', props: { provider } });
    } else if (details.name) {
      s.setAccount({ id: 'guest', name: details.name, provider: 'guest', createdAt: new Date().toISOString() });
    }
    if (draft.intent) s.setIntent(draft.intent);
    const created = s.addPerson({
      name: person.name,
      relationship: person.relationship,
      ageGroup: person.ageGroup,
      pronouns: person.pronouns,
      focusTopics: draft.topics.length ? draft.topics : [preview.topicId],
      concern: person.concern,
    });
    s.setBlessing(created.id, preview.entry.id, 'onboarding');
    s.completeOnboarding({ signedUp });
    navigate(draft.intent === 'children' ? '/today?welcome=children' : '/today', { replace: true });
  };

  const index = ORDER.indexOf(step);

  return (
    <div className={cx(styles.shell, step === 'welcome' && styles.welcomeShell)}>
      {/* The welcome opens onto today’s scene; the steps after it rest on the app’s sky. */}
      <AnimatePresence>
        {step === 'welcome' && (
          <motion.div className={styles.welcomeScene} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
            <SceneImage scene={DAYPART_SCENE[daypart()]} priority sizes="100vw" className={styles.welcomeImage} />
          </motion.div>
        )}
      </AnimatePresence>
      {step !== 'welcome' && (
        <header className={styles.bar}>
          <IconButton label="Back" onClick={back} tone="surface">
            <CaretLeft size={20} weight="bold" />
          </IconButton>
          <ProgressDots count={ORDER.length - 1} index={index - 1} />
          <span className={styles.barSpacer} />
        </header>
      )}

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.main
          id="main"
          key={step}
          className={styles.step}
          custom={dir}
          initial={{ opacity: 0, x: dir * 26 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.42, ease: ease.out } }}
          exit={{ opacity: 0, x: dir * -18, transition: { duration: 0.18 } }}
        >
          {step === 'welcome' && (
            <motion.div className={styles.welcome} variants={stagger(0.12, 0.2)} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className={styles.welcomeLogo} role="img" aria-label="Bless Them">
                <LogoMark size={30} tone="on-brand" />
                <span className={styles.welcomeWordmark} aria-hidden="true">
                  Bless Them
                </span>
              </motion.div>
              <motion.div variants={fadeUp} className={styles.welcomePanel}>
                <h1 className={styles.statement}>Speak life over the people you love.</h1>
                <p className={styles.lede}>
                  Bless Them helps you turn Scripture into simple, meaningful prayers and blessings for the people God has placed in your life.
                </p>
              <div className={styles.welcomeActions}>
                <Button block onClick={() => go('who')}>
                  Begin
                </Button>
                <p className={styles.small}>Takes about a minute. No account needed to start.</p>
                <Link to="/about" className={styles.learn}>
                  What is Bless Them?
                </Link>
              </div>
              </motion.div>
            </motion.div>
          )}

          {step === 'who' && (
            <div className={styles.content}>
              <h1 className={styles.title}>Who would you most like to pray for consistently?</h1>
              <p className={styles.subtitle}>You can add everyone you love later.</p>
              <motion.div className={styles.choices} role="radiogroup" aria-label="Who are you blessing?" variants={stagger(0.04)} initial="hidden" animate="show">
                {INTENTS.map((i) => (
                  <motion.div key={i.id} variants={fadeUp}>
                    <ChoiceCard
                      title={i.title}
                      description={i.description}
                      icon={i.icon}
                      selected={draft.intent === i.id}
                      onSelect={() => {
                        setDraft((d) => ({
                          ...d,
                          intent: i.id,
                          relationship: i.id === 'family' ? 'family' : RELATIONSHIPS[i.id].includes(d.relationship as Relationship) ? d.relationship : undefined,
                          name: i.id === 'family' && !d.name ? 'Our family' : d.name === 'Our family' && i.id !== 'family' ? '' : d.name,
                        }));
                        window.setTimeout(() => go('person'), 260);
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {step === 'person' && draft.intent && (
            <div className={styles.content}>
              <h1 className={styles.title}>{PERSON_PROMPT[draft.intent]}</h1>
              <div className={styles.form}>
                <TextField
                  label={isFamily ? 'Family name' : 'First name'}
                  value={draft.name}
                  autoComplete="off"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  placeholder={isFamily ? 'Our family' : isSpouse ? 'Daniel' : 'Noah'}
                  error={nameError}
                  data-autofocus
                  autoFocus
                  maxLength={40}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, name: e.target.value }));
                    setNameError(undefined);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && submitPerson()}
                  hint={isFamily ? 'In prayers we’ll say “our family.”' : undefined}
                />

                {!isFamily && (
                  <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Relationship</legend>
                    <div className={styles.chips}>
                      {RELATIONSHIPS[draft.intent].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={styles.option}
                          aria-pressed={relationship === r}
                          onClick={() => {
                            haptics.selection();
                            setDraft((d) => ({ ...d, relationship: r, pronouns: RELATIONSHIP_PRONOUNS[r] ?? d.pronouns }));
                          }}
                        >
                          {RELATIONSHIP_LABEL[r]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                {needsPronoun && (
                  <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>In prayers, we’ll say…</legend>
                    <div className={styles.chips}>
                      {(['he', 'she', 'they'] as Pronouns[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={styles.option}
                          aria-pressed={(draft.pronouns ?? 'they') === p}
                          onClick={() => {
                            haptics.selection();
                            setDraft((d) => ({ ...d, pronouns: p }));
                          }}
                        >
                          {p === 'he' ? 'He · him' : p === 'she' ? 'She · her' : 'Their name'}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                {!isFamily && !isSpouse && (
                  <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>
                      Age <span className={styles.optional}>Optional</span>
                    </legend>
                    <div className={styles.chips}>
                      {AGE_GROUPS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={cx(styles.option, styles.ageOption)}
                          aria-pressed={draft.ageGroup === a}
                          onClick={() => {
                            haptics.selection();
                            setDraft((d) => ({ ...d, ageGroup: d.ageGroup === a ? undefined : a }));
                          }}
                        >
                          {AGE_LABELS[a]}
                          <span className={styles.ageHint}>{AGE_HINTS[a]}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <p className={styles.privacy}>
                  <LockSimple size={14} weight="bold" aria-hidden="true" />
                  We only use age to make blessings fit. No accounts, emails or photos for children — ever.
                </p>
              </div>
              <div className={styles.footer}>
                <Button block onClick={submitPerson} disabled={!relationship}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'topics' && person && (
            <div className={styles.content}>
              <h1 className={styles.title}>What are you praying about{isFamily ? ' for your family' : ` for ${person.name}`}?</h1>
              <p className={styles.subtitle}>Choose a few. We’ll weave them into each day’s blessing.</p>
              <motion.div className={styles.topicChips} variants={stagger(0.025)} initial="hidden" animate="show">
                {choices.map((c) => {
                  const selected = c.topics.every((t) => draft.topics.includes(t));
                  return (
                    <motion.div key={c.label} variants={fadeUp}>
                      <TopicChip
                        label={c.label}
                        selected={selected}
                        onToggle={() =>
                          setDraft((d) => ({
                            ...d,
                            topics: selected ? d.topics.filter((t) => !c.topics.includes(t)) : [...new Set([...d.topics, ...c.topics.filter((t) => topicSuits(t, person))])],
                          }))
                        }
                      />
                    </motion.div>
                  );
                })}
                <motion.div variants={fadeUp}>
                  <TopicChip label="Something specific" selected={draft.showConcern} onToggle={() => setDraft((d) => ({ ...d, showConcern: !d.showConcern }))} />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {draft.showConcern && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={styles.concern}>
                    <TextArea
                      label="A short note"
                      optional
                      rows={3}
                      maxLength={160}
                      value={draft.concern}
                      placeholder="Starting at a new school next week."
                      hint="Only used on this device to shape blessings. Never shared."
                      onChange={(e) => setDraft((d) => ({ ...d, concern: e.target.value }))}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.footer}>
                <Button block onClick={submitTopics}>
                  {draft.topics.length || draft.concern.trim() ? 'Show me a blessing' : 'Choose for me'}
                </Button>
              </div>
              {safety && <SafetySupport result={safety} open onClose={() => setSafety(null)} onContinue={() => {
                setSafety(null);
                setDraft((d) => ({ ...d, concern: '' }));
                setPreparing(true);
                go('preview');
                window.setTimeout(() => setPreparing(false), 1500);
              }} />}
            </div>
          )}

          {step === 'preview' && person && (
            <div className={styles.content}>
              <AnimatePresence mode="wait">
                {preparing || !preview ? (
                  <motion.div key="preparing" className={styles.preparing} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                    <Emblem size={96} glow className={styles.preparingEmblem} />
                    <p className={styles.preparingText}>Preparing a blessing for {headingName(person)}…</p>
                  </motion.div>
                ) : (
                  <motion.div key="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out }}>
                    <p className={cx('overline', styles.previewKicker)}>A blessing for today</p>
                    <BlessingCard
                      person={person}
                      entryId={preview.entry.id}
                      minimal
                      footer={
                        <div className={styles.previewFooter}>
                          <Button block onClick={() => go('account')}>
                            I want this each day
                          </Button>
                          <p className={styles.small}>A new blessing for {headingName(person)} every morning.</p>
                        </div>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {step === 'account' && <AccountStep onFinish={finish} />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

function AccountStep({ onFinish }: { onFinish(provider: 'guest' | 'apple' | 'google' | 'email', details?: { name?: string; email?: string }): Promise<void> }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'choose' | 'email'>('choose');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const run = async (provider: 'guest' | 'apple' | 'google' | 'email') => {
    setBusy(provider);
    setError(undefined);
    try {
      await onFinish(provider, { name: name.trim() || undefined, email: email.trim() || undefined });
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.accountHero}>
        <Emblem icon={ShieldCheck} size={96} glow />
        <h1 className={styles.title}>Keep every blessing safe.</h1>
        <p className={styles.subtitle}>Create a free account to save your people, prayers and answered prayers.</p>
      </div>
      <div className={styles.form}>
        <TextField label="What should we call you?" optional value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="Maya" hint="Used only for your morning greeting." />
        <AnimatePresence mode="wait" initial={false}>
          {mode === 'choose' ? (
            <motion.div key="choose" className={styles.providers} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button type="button" className={cx(styles.provider, styles.apple)} onClick={() => run('apple')} disabled={!!busy}>
                <AppleLogo size={20} weight="fill" /> {busy === 'apple' ? 'Signing in…' : 'Continue with Apple'}
              </button>
              <button type="button" className={cx(styles.provider, styles.google)} onClick={() => run('google')} disabled={!!busy}>
                <GoogleLogo size={20} weight="bold" /> {busy === 'google' ? 'Signing in…' : 'Continue with Google'}
              </button>
              <button type="button" className={cx(styles.provider, styles.email)} onClick={() => setMode('email')} disabled={!!busy}>
                <EnvelopeSimple size={20} /> Continue with email
              </button>
            </motion.div>
          ) : (
            <motion.div key="email" className={styles.providers} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" error={error} autoFocus />
              <Button block loading={busy === 'email'} onClick={() => run('email')}>
                Create account
              </Button>
              <Button variant="ghost" size="md" onClick={() => setMode('choose')}>
                Other options
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" block size="md" onClick={() => run('guest')} disabled={!!busy}>
          Not now
        </Button>
        <p className={styles.privacy}>
          <LockSimple size={14} weight="bold" aria-hidden="true" />
          Your prayers are yours. In this preview they stay private on this device — we never sell or share them.
        </p>
      </div>
    </div>
  );
}
