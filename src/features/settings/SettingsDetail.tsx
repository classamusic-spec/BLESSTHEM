import { AppleLogo, DownloadSimple, EnvelopeSimple, GoogleLogo, PaperPlaneTilt, SignOut, Sparkle, Trash } from '@phosphor-icons/react';
import { clear as clearPhotos } from 'idb-keyval';
import { useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ENTRIES } from '@/content/blessings';
import { TRANSLATIONS, getPassage, loadTranslation, type TranslationId } from '@/content/scripture';
import { TOPICS } from '@/content/taxonomy';
import { PHOTO_CREDITS } from '@/content/scenery';
import { isPlus, useStore } from '@/data/store';
import { Button } from '@/design/Button';
import { ConfirmationSheet } from '@/design/ConfirmationSheet';
import { Switch, TextField } from '@/design/Controls';
import { Page, PageHeader, SettingsGroup, SettingsRow } from '@/design/Layout';
import { useToast } from '@/design/Toast';
import { Emblem } from '@/design/Emblem';
import { cx } from '@/lib/cx';
import { clearEvents, track } from '@/services/analytics';
import { auth, PROVIDER_LABEL } from '@/services/auth';
import { haptics } from '@/services/haptics';
import { currentPermission, morningCopy, notificationsSupported, requestPermission, showNotice } from '@/services/notifications';
import { photoBlob } from '@/services/photos';
import { PLANS, purchases } from '@/services/purchases';
import { SUPPORT_EMAIL, APP_VERSION } from '@/config';
import { usePassage } from '@/features/blessing/useComposed';
import styles from './Settings.module.css';

const TITLES: Record<string, string> = {
  account: 'Account',
  subscription: 'Bless Them+',
  notifications: 'Reminders',
  scripture: 'Bible translation',
  appearance: 'Appearance',
  accessibility: 'Text, motion & haptics',
  privacy: 'Privacy & your data',
  support: 'Help & support',
  about: 'About Bless Them',
};

export default function SettingsDetail() {
  const { section = '' } = useParams();
  if (!TITLES[section]) return <Navigate to="/settings" replace />;
  return (
    <Page>
      <PageHeader back="/settings" title={TITLES[section]} size="compact" />
      {section === 'account' && <AccountSection />}
      {section === 'subscription' && <SubscriptionSection />}
      {section === 'notifications' && <NotificationsSection />}
      {section === 'scripture' && <ScriptureSection />}
      {section === 'appearance' && <AppearanceSection />}
      {section === 'accessibility' && <AccessibilitySection />}
      {section === 'privacy' && <PrivacySection />}
      {section === 'support' && <SupportSection />}
      {section === 'about' && <AboutSection />}
    </Page>
  );
}

function Choice({ checked, onSelect, title, detail }: { checked: boolean; onSelect(): void; title: string; detail?: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className={styles.option}
      onClick={() => {
        haptics.selection();
        onSelect();
      }}
    >
      <span className={styles.radio} aria-hidden="true" />
      <span>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </span>
    </button>
  );
}

/* ── Account ─────────────────────────────────────────── */
function AccountSection() {
  const account = useStore((s) => s.account);
  const setAccount = useStore((s) => s.setAccount);
  const toast = useToast();
  const [name, setName] = useState(account?.name ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const signedIn = account && account.provider !== 'guest';

  const signIn = async (provider: 'apple' | 'google' | 'email') => {
    setBusy(provider);
    setError(undefined);
    try {
      const created = await auth.signIn(provider, { name, email });
      setAccount(created);
      track({ name: 'account_created', props: { provider } });
      toast.show('Your account is ready. Everything you’ve saved is kept.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={styles.stack}>
      <TextField
        label="Your first name"
        hint="Used for your greeting."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => account && setAccount({ ...account, name: name.trim() })}
        autoComplete="given-name"
      />
      {signedIn ? (
        <>
          <SettingsGroup title="Signed in">
            <SettingsRow label={account!.email ?? 'Your account'} detail={`with ${PROVIDER_LABEL[account!.provider]}`} />
          </SettingsGroup>
          <Button
            variant="secondary"
            icon={<SignOut />}
            onClick={async () => {
              await auth.signOut();
              setAccount(account?.name ? { id: 'guest', name: account.name, provider: 'guest', createdAt: new Date().toISOString() } : null);
              toast.show('Signed out. Your prayers remain on this device.');
            }}
          >
            Sign out
          </Button>
        </>
      ) : (
        <>
          <p className={styles.lede}>Create a free account to keep your people, blessings and journal safe. Everything you’ve already saved comes with you.</p>
          <div className={styles.options}>
            <Button variant="secondary" icon={<AppleLogo weight="fill" />} loading={busy === 'apple'} onClick={() => signIn('apple')}>
              Continue with Apple
            </Button>
            <Button variant="secondary" icon={<GoogleLogo weight="bold" />} loading={busy === 'google'} onClick={() => signIn('google')}>
              Continue with Google
            </Button>
            <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" error={error} />
            <Button icon={<EnvelopeSimple />} loading={busy === 'email'} onClick={() => signIn('email')}>
              Continue with email
            </Button>
          </div>
          {auth.mode === 'local' && <p className={styles.small}>In this preview, accounts and prayers stay private on this device.</p>}
        </>
      )}
    </div>
  );
}

/* ── Subscription ────────────────────────────────────── */
function SubscriptionSection() {
  const subscription = useStore((s) => s.subscription);
  const setSubscription = useStore((s) => s.setSubscription);
  const plus = useStore(isPlus);
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!plus) return <Navigate to="/plus" replace />;
  const plan = PLANS[subscription.plan ?? 'annual'];
  const renew = subscription.renewsAt ? new Date(subscription.renewsAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className={styles.stack}>
      <div className={cx(styles.panel, styles.emblemRow)}>
        <Emblem icon={Sparkle} size={64} />
        <div>
          <p>
            <strong>{plan.name} plan</strong> · {plan.priceLabel}/{plan.period}
          </p>
          <p className={styles.small}>
            {subscription.status === 'trial' && `Free trial until ${new Date(subscription.trialEndsAt!).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}. `}
            {subscription.status === 'canceled' ? `Canceled — Bless Them+ stays active until ${renew}.` : `Renews ${renew}.`}
          </p>
        </div>
      </div>
      <p className={styles.small}>{plan.renewal}</p>
      {subscription.status !== 'canceled' && (
        <Button variant="secondary" onClick={() => setConfirm(true)}>
          Cancel subscription
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={async () => {
          const restored = await purchases.restore(subscription);
          if (restored) toast.show('Your purchase is restored.');
        }}
      >
        Restore purchases
      </Button>
      <ConfirmationSheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Cancel Bless Them+?"
        body={`You’ll keep everything until ${renew}. After that, your people, journal and favorites stay safe — some features return to the free plan.`}
        confirmLabel="Cancel subscription"
        cancelLabel="Keep Bless Them+"
        destructive
        busy={busy}
        onConfirm={async () => {
          setBusy(true);
          setSubscription(await purchases.cancel(subscription));
          track({ name: 'subscription_canceled' });
          setBusy(false);
          setConfirm(false);
          toast.show('Canceled. Thank you for praying with us.');
          navigate('/settings');
        }}
      />
    </div>
  );
}

/* ── Notifications ───────────────────────────────────── */
function NotificationsSection() {
  const prefs = useStore((s) => s.notifications);
  const update = useStore((s) => s.updateNotifications);
  const people = useStore((s) => s.people);
  const plus = useStore(isPlus);
  const toast = useToast();
  const permission = notificationsSupported() ? currentPermission() : 'unsupported';
  const sample = people[0] ? morningCopy(people[0]) : { title: 'A blessing is ready.', body: 'Take one quiet minute to pray.' };

  const ensurePermission = async () => {
    if (permission === 'granted') return true;
    const result = await requestPermission();
    update({ permission: result, asked: true });
    return result === 'granted';
  };

  return (
    <div className={styles.stack}>
      <div className={styles.notice} aria-live="polite">
        <p className={styles.noticeTitle}>{sample.title}</p>
        <p className={styles.noticeBody}>{sample.body}</p>
      </div>
      <p className={styles.small}>Reminders are gentle and pastoral. We’ll never send “don’t lose your streak” — just a quiet nudge when a blessing is ready.</p>

      <SettingsGroup title="Daily">
        <SettingsRow
          label="Morning blessing"
          detail="A blessing is ready for someone you love"
          control={
            <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input aria-label="Morning reminder time" className={styles.timeInput} type="time" value={prefs.morning.time} onChange={(e) => update({ morning: { ...prefs.morning, time: e.target.value } })} />
              <Switch
                label="Morning blessing"
                checked={prefs.morning.enabled}
                onChange={async (v) => {
                  if (v && !(await ensurePermission())) return;
                  update({ morning: { ...prefs.morning, enabled: v } });
                }}
              />
            </span>
          }
        />
        <SettingsRow
          label="Evening invitation"
          detail="“Before today ends…”"
          control={
            <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input aria-label="Evening reminder time" className={styles.timeInput} type="time" value={prefs.evening.time} onChange={(e) => update({ evening: { ...prefs.evening, time: e.target.value } })} />
              <Switch
                label="Evening invitation"
                checked={prefs.evening.enabled}
                onChange={async (v) => {
                  if (v && !(await ensurePermission())) return;
                  update({ evening: { ...prefs.evening, enabled: v } });
                }}
              />
            </span>
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Special moments" footer={plus ? undefined : 'Special-moment blessings are part of Bless Them+.'}>
        <SettingsRow
          label="The evening before a special day"
          detail="Birthdays, first days of school, big games"
          control={<Switch label="Special moment reminders" checked={prefs.specialMoments} onChange={(v) => update({ specialMoments: v })} />}
        />
      </SettingsGroup>

      {permission === 'denied' && <p className={styles.small}>Notifications are blocked for Bless Them in your device settings. You can allow them there anytime.</p>}
      {permission === 'unsupported' && <p className={styles.small}>This browser doesn’t support notifications. Add Bless Them to your home screen to receive reminders.</p>}

      <Button
        variant="secondary"
        icon={<PaperPlaneTilt />}
        onClick={async () => {
          if (!(await ensurePermission())) {
            toast.show('Allow notifications to try a reminder.');
            return;
          }
          const person = people[0];
          const ok = await showNotice({
            title: sample.title,
            body: sample.body,
            url: person ? `/today?person=${person.id}&from=notification&kind=test` : '/today',
            tag: 'test',
          });
          toast.show(ok ? 'A sample reminder is on its way. Tap it to open the blessing.' : 'We couldn’t show a reminder here.');
        }}
      >
        Send a sample reminder
      </Button>
    </div>
  );
}

/* ── Scripture ───────────────────────────────────────── */
function ScriptureSection() {
  const translation = useStore((s) => s.settings.translation);
  const update = useStore((s) => s.updateSettings);
  const [preview, setPreview] = useState(() => getPassage('JOS 1:9', translation));

  const choose = async (id: TranslationId) => {
    await loadTranslation(id);
    update({ translation: id });
    setPreview(getPassage('JOS 1:9', id));
  };

  return (
    <div className={styles.stack}>
      <div className={styles.options} role="radiogroup" aria-label="Bible translation">
        {TRANSLATIONS.map((t) => (
          <Choice key={t.id} checked={translation === t.id} onSelect={() => void choose(t.id)} title={`${t.name} (${t.abbreviation})`} detail={t.note} />
        ))}
      </div>
      {preview && (
        <div className={styles.preview}>
          “{preview.text}”<p className={styles.previewRef}>{preview.display} · {preview.translation.abbreviation}</p>
        </div>
      )}
      <p className={styles.small}>
        Both translations are in the public domain. Every verse in Bless Them comes from the publisher’s text and is checked verse-by-verse against it. We never generate or alter Scripture. Other licensed translations can be added in the future.
      </p>
    </div>
  );
}

/* ── Appearance ──────────────────────────────────────── */
function AppearanceSection() {
  const theme = useStore((s) => s.settings.theme);
  const update = useStore((s) => s.updateSettings);
  return (
    <div className={styles.options} role="radiogroup" aria-label="Appearance">
      <Choice checked={theme === 'system'} onSelect={() => update({ theme: 'system' })} title="Automatic" detail="Follows your device — warm ivory by day, deep charcoal at night." />
      <Choice checked={theme === 'light'} onSelect={() => update({ theme: 'light' })} title="Light" detail="Ivory, linen and soft morning light." />
      <Choice checked={theme === 'dark'} onSelect={() => update({ theme: 'dark' })} title="Dark" detail="Gentle on the eyes at bedtime." />
    </div>
  );
}

/* ── Accessibility ───────────────────────────────────── */
function AccessibilitySection() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const sizes = [0.9, 1, 1.12, 1.25, 1.4];
  const label = (v: number) => (v < 1 ? 'Smaller' : v === 1 ? 'Default' : v < 1.2 ? 'Larger' : v < 1.3 ? 'Extra large' : 'Largest');
  return (
    <div className={styles.stack}>
      <div className={styles.panel}>
        <label htmlFor="text-size" className={styles.scaleLabel}>
          Text size · {label(settings.textScale)}
        </label>
        <div className={styles.scale}>
          <span aria-hidden="true" style={{ fontSize: 14 }}>A</span>
          <input
            id="text-size"
            type="range"
            min={0}
            max={sizes.length - 1}
            step={1}
            value={Math.max(0, sizes.indexOf(settings.textScale))}
            aria-valuetext={label(settings.textScale)}
            onChange={(e) => update({ textScale: sizes[Number(e.target.value)] })}
          />
          <span aria-hidden="true" style={{ fontSize: 22 }}>A</span>
        </div>
        <p className={styles.preview} style={{ marginTop: 16 }}>
          May you know today that you are deeply loved.
        </p>
      </div>
      <SettingsGroup footer="Bless Them also follows your device’s text size on iPhone and iPad.">
        <SettingsRow label="Follow device text size" htmlFor="dyn" control={<Switch id="dyn" label="Follow device text size" checked={settings.dynamicType} onChange={(v) => update({ dynamicType: v })} />} />
        <SettingsRow
          label="Reduce motion"
          detail="Calmer transitions, no drifting light"
          control={<Switch label="Reduce motion" checked={settings.motion === 'reduce'} onChange={(v) => update({ motion: v ? 'reduce' : 'system' })} />}
        />
        <SettingsRow
          label="Reduce transparency"
          detail="Solid surfaces instead of frosted glass"
          control={<Switch label="Reduce transparency" checked={settings.transparency === 'reduce'} onChange={(v) => update({ transparency: v ? 'reduce' : 'system' })} />}
        />
        <SettingsRow label="Haptics" detail="A soft tap when you complete a blessing" control={<Switch label="Haptics" checked={settings.haptics} onChange={(v) => update({ haptics: v })} />} />
      </SettingsGroup>
    </div>
  );
}

/* ── Privacy ─────────────────────────────────────────── */
function PrivacySection() {
  const analytics = useStore((s) => s.settings.analytics);
  const update = useStore((s) => s.updateSettings);
  const resetAll = useStore((s) => s.resetAll);
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState<'data' | null>(null);

  const exportData = async () => {
    const state = useStore.getState();
    const photos: Record<string, string> = {};
    for (const j of state.journal) {
      if (!j.photoId) continue;
      const blob = await photoBlob(j.photoId);
      if (blob) {
        photos[j.photoId] = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.readAsDataURL(blob);
        });
      }
    }
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'Bless Them',
      version: APP_VERSION,
      account: state.account,
      people: state.people,
      specialDates: state.specialDates,
      blessings: state.blessings,
      journal: state.journal,
      favorites: state.favorites,
      journeys: state.journeys,
      settings: state.settings,
      photos,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bless-them-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    track({ name: 'data_exported' });
    toast.show('Your data has been exported.');
  };

  return (
    <div className={styles.stack}>
      <div className={cx(styles.legal)}>
        <p>
          <strong>Your prayers are yours.</strong> Bless Them keeps your people, blessings and journal on this device. We don’t sell your data, we don’t show ads, and we never use your prayers, names or journal entries for analytics.
        </p>
        <p>
          <strong>Children’s privacy.</strong> Children never need an account, an email or a profile. We only ask for a first name and, optionally, an age group so blessings fit.
        </p>
      </div>

      <SettingsGroup footer="Counts like “a blessing was completed” — never names, prayers, notes or searches.">
        <SettingsRow label="Share anonymous usage" detail="Helps us make Bless Them better" control={<Switch label="Share anonymous usage" checked={analytics} onChange={(v) => update({ analytics: v })} />} />
      </SettingsGroup>

      <SettingsGroup title="Your data">
        <SettingsRow icon={<DownloadSimple />} label="Export my data" detail="Everything, including photos, as a file" onClick={exportData} />
        <SettingsRow icon={<Trash />} label="Delete all my data" detail="Removes everything from this device" onClick={() => setConfirm('data')} danger />
      </SettingsGroup>

      <ConfirmationSheet
        open={confirm === 'data'}
        onClose={() => setConfirm(null)}
        destructive
        title="Delete everything?"
        body="Your account, people, blessings, journal, photos and settings will be permanently removed from this device. Export first if you’d like a copy."
        confirmLabel="Delete everything"
        onConfirm={async () => {
          track({ name: 'data_deleted' });
          await clearPhotos().catch(() => undefined);
          clearEvents();
          resetAll();
          setConfirm(null);
          navigate('/welcome', { replace: true });
        }}
      />
    </div>
  );
}

/* ── Support ─────────────────────────────────────────── */
const FAQ = [
  ['Where do the Bible verses come from?', 'From the Berean Standard Bible and the World English Bible — both public domain. Every verse is taken from the publisher’s text and checked verse-by-verse. Scripture is never written or altered by AI.'],
  ['Who writes the blessings and prayers?', `A curated library of ${ENTRIES.length} Scripture blessings across ${TOPICS.length} topics, written to careful theological guidelines: rooted in context, humble, and never speaking for God.`],
  ['What if I miss a day?', 'Nothing is lost. Faithfulness isn’t perfection — there’s always room to begin again today.'],
  ['Can I bless adults too?', 'Yes. Spouses, grown children, parents and friends all receive blessings suited to them.'],
  ['Is this a replacement for counseling or medical care?', 'No. Prayer belongs alongside real help. If someone is in danger, please contact emergency services or a crisis line right away.'],
];

function SupportSection() {
  return (
    <div className={styles.stack}>
      {FAQ.map(([q, a]) => (
        <details key={q} className={styles.panel}>
          <summary style={{ fontWeight: 650, cursor: 'pointer', minHeight: 32 }}>{q}</summary>
          <p className={styles.lede} style={{ marginTop: 8 }}>
            {a}
          </p>
        </details>
      ))}
      <Button variant="secondary" icon={<EnvelopeSimple />} onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Bless Them')}`)}>
        Email us
      </Button>
    </div>
  );
}

/* ── About ───────────────────────────────────────────── */
function AboutSection() {
  const navigate = useNavigate();
  const blessing = usePassage('NUM 6:24-26');
  return (
    <div className={styles.stack}>
      <div className={cx(styles.panel, styles.emblemRow)}>
        <Emblem size={64} />
        <div>
          <p>
            <strong>Bless Them</strong>
          </p>
          <p className={styles.small}>
            Named for one of the oldest blessings there is.
            {blessing && ` ${blessing.text} (${blessing.display})`}
          </p>
        </div>
      </div>
      <div className={styles.legal}>
        <p>Bless Them exists to help people speak God’s Word, love, hope, wisdom and prayer over the people entrusted to them. We aren’t optimizing for screen time — we’re helping create a real moment between people who love each other.</p>
        <h3>Scripture</h3>
        <p>Berean Standard Bible (BSB): public domain, BSB Publishing. World English Bible (WEB): public domain; “World English Bible” is a trademark of eBible.org.</p>
        <h3>Typography & icons</h3>
        <p>Newsreader and Figtree (SIL Open Font License). Icons by Phosphor (MIT).</p>
        <h3>Photography</h3>
        <p>Every photograph is a real place, chosen by hand: public-domain work by park rangers and foresters, and photographers who share their work freely. Each is gently graded and resized for the app. Thank you to each of them.</p>
        <ul role="list" className={styles.credits}>
          {PHOTO_CREDITS.map((c) => (
            <li key={c.id}>
              <span className={styles.creditPlace}>{c.description}</span>
              <span className={styles.small}>
                <a href={c.page} target="_blank" rel="noreferrer">
                  “{c.title.trim()}”
                </a>
                {' by '}
                <a href={c.creatorUrl} target="_blank" rel="noreferrer">
                  {c.creator}
                </a>
                {' · '}
                <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                  {c.license}
                </a>
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.small}>Version {APP_VERSION}</p>
      </div>
      <Button variant="secondary" onClick={() => navigate('/about')}>
        Visit the Bless Them home page
      </Button>
    </div>
  );
}
