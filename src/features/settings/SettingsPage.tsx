import { BellSimple, BookOpen, Crown, Info, Lifebuoy, Palette, ShieldCheck, SignIn, TextAa, UserCircle } from '@phosphor-icons/react';
import { Logo } from '@/brand/Logo';
import { translationMeta } from '@/content/scripture';
import { isPlus, useStore } from '@/data/store';
import { Page, PageHeader, SettingsGroup, SettingsRow } from '@/design/Layout';
import { PROVIDER_LABEL } from '@/services/auth';
import { PLANS } from '@/services/purchases';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const account = useStore((s) => s.account);
  const settings = useStore((s) => s.settings);
  const notifications = useStore((s) => s.notifications);
  const subscription = useStore((s) => s.subscription);
  const plus = useStore(isPlus);

  const reminder = notifications.morning.enabled ? `Mornings` : notifications.evening.enabled ? 'Evenings' : 'Off';

  return (
    <Page>
      <PageHeader back title="Settings" />

      <SettingsGroup title="You">
        {account && account.provider !== 'guest' ? (
          <SettingsRow icon={<UserCircle weight="duotone" />} label={account.name || 'Your account'} detail={account.email ?? `Signed in with ${PROVIDER_LABEL[account.provider]}`} to="/settings/account" />
        ) : (
          <SettingsRow icon={<SignIn weight="duotone" />} label="Create a free account" detail="Keep your people and prayers safe" to="/settings/account" />
        )}
        <SettingsRow
          icon={<Crown weight="duotone" />}
          label={plus ? 'Bless Them+' : 'Bless Them+'}
          detail={plus ? `${PLANS[subscription.plan ?? 'annual'].name} plan${subscription.status === 'trial' ? ' · free trial' : ''}` : 'Unlimited people, journeys and audio'}
          to={plus ? '/settings/subscription' : '/plus'}
        />
      </SettingsGroup>

      <SettingsGroup title="Practice">
        <SettingsRow icon={<BellSimple weight="duotone" />} label="Reminders" value={reminder} to="/settings/notifications" />
        <SettingsRow icon={<BookOpen weight="duotone" />} label="Bible translation" value={translationMeta(settings.translation).abbreviation} to="/settings/scripture" />
      </SettingsGroup>

      <SettingsGroup title="Comfort">
        <SettingsRow icon={<Palette weight="duotone" />} label="Appearance" value={settings.theme === 'system' ? 'Automatic' : settings.theme === 'dark' ? 'Dark' : 'Light'} to="/settings/appearance" />
        <SettingsRow icon={<TextAa weight="duotone" />} label="Text, motion & haptics" to="/settings/accessibility" />
      </SettingsGroup>

      <SettingsGroup title="Trust">
        <SettingsRow icon={<ShieldCheck weight="duotone" />} label="Privacy & your data" detail="Export, delete, analytics" to="/settings/privacy" />
        <SettingsRow icon={<Lifebuoy weight="duotone" />} label="Help & support" to="/settings/support" />
        <SettingsRow icon={<Info weight="duotone" />} label="About Bless Them" to="/settings/about" />
      </SettingsGroup>

      <div className={styles.signature}>
        <Logo size={26} />
        <p>Speak Scripture over the people you love.</p>
      </div>
    </Page>
  );
}
