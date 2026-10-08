/**
 * Privacy-conscious product analytics.
 *
 * Product events are deliberately separated from private content: events carry
 * only coarse, non-identifying properties (counts, topic ids, plan names). They
 * NEVER include names, prayer text, journal text, search queries or notes.
 *
 * In this build events are kept in a small on-device buffer (so the metrics in
 * docs/ARCHITECTURE.md can be computed) and forwarded to a sink when one is
 * configured. Users can switch analytics off in Settings › Privacy.
 */

export type ProductEvent =
  | { name: 'app_opened'; props?: { source?: string } }
  | { name: 'week_summarized'; props: { week: string; activeDays: number; blessings: number; peopleBlessed: number; peopleBlessed3Plus: number } }
  | { name: 'onboarding_started' }
  | { name: 'onboarding_step'; props: { step: string } }
  | { name: 'onboarding_completed'; props: { signedUp: boolean } }
  | { name: 'person_added'; props: { count: number; relationship: string; hasAge: boolean } }
  | { name: 'person_removed' }
  | { name: 'blessing_viewed'; props: { topic: string; source: string } }
  | { name: 'blessing_completed'; props: { topic: string; source: string; first: boolean } }
  | { name: 'blessing_moment_opened' }
  | { name: 'focus_changed'; props: { topic: string } }
  | { name: 'library_opened' }
  | { name: 'topic_opened'; props: { topic: string; premium: boolean } }
  | { name: 'search_performed'; props: { results: number; topics: number; safety: boolean } }
  | { name: 'safety_support_shown'; props: { category: string } }
  | { name: 'journal_entry_created'; props: { kind: string; withPerson: boolean; withPhoto: boolean } }
  | { name: 'prayer_answered' }
  | { name: 'favorite_added' }
  | { name: 'share_opened' }
  | { name: 'share_completed'; props: { channel: string } }
  | { name: 'audio_played'; props: { part: string } }
  | { name: 'notification_prompt'; props: { result: string } }
  | { name: 'notification_opened'; props: { kind: string } }
  | { name: 'journey_started'; props: { journey: string } }
  | { name: 'journey_day_completed'; props: { journey: string; day: number } }
  | { name: 'paywall_viewed'; props: { source: string } }
  | { name: 'paywall_dismissed'; props: { source: string } }
  | { name: 'trial_started'; props: { plan: string } }
  | { name: 'subscription_started'; props: { plan: string } }
  | { name: 'subscription_canceled' }
  | { name: 'account_created'; props: { provider: string } }
  | { name: 'data_exported' }
  | { name: 'data_deleted' };

export interface LoggedEvent {
  name: ProductEvent['name'];
  props?: Record<string, string | number | boolean>;
  at: string;
  installId: string;
}

type Sink = (event: LoggedEvent) => void;

const BUFFER_KEY = 'blessthem:events';
const MAX_EVENTS = 400;

let enabled = true;
let installId = 'anonymous';
const sinks: Sink[] = [];

export function configureAnalytics(opts: { enabled: boolean; installId: string }) {
  enabled = opts.enabled;
  installId = opts.installId;
}

export function addAnalyticsSink(sink: Sink) {
  sinks.push(sink);
}

export function track(event: ProductEvent): void {
  if (!enabled) return;
  const logged: LoggedEvent = {
    name: event.name,
    props: 'props' in event ? (event.props as LoggedEvent['props']) : undefined,
    at: new Date().toISOString(),
    installId,
  };
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    const list: LoggedEvent[] = raw ? JSON.parse(raw) : [];
    list.push(logged);
    localStorage.setItem(BUFFER_KEY, JSON.stringify(list.slice(-MAX_EVENTS)));
  } catch {
    /* storage unavailable — analytics is best-effort */
  }
  for (const sink of sinks) {
    try {
      sink(logged);
    } catch {
      /* never let analytics break the product */
    }
  }
  if (import.meta.env.DEV) console.debug('[analytics]', logged.name, logged.props ?? '');
}

export function readEvents(): LoggedEvent[] {
  try {
    return JSON.parse(localStorage.getItem(BUFFER_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function clearEvents(): void {
  try {
    localStorage.removeItem(BUFFER_KEY);
  } catch {
    /* ignore */
  }
}
