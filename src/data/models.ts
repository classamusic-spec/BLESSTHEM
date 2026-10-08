import type { AgeGroup, OccasionId, RelationshipKind, TopicId } from '@/content/types';
import type { DayKey } from '@/lib/dates';

/**
 * Bless Them's local-first data model. Everything lives on the device and is
 * owned by the parent. The production schema (supabase/schema.sql) mirrors
 * these shapes one-to-one so guest data can migrate into an account.
 */

export type Relationship =
  | 'son' | 'daughter' | 'child'
  | 'grandson' | 'granddaughter' | 'grandchild'
  | 'husband' | 'wife' | 'spouse'
  | 'family'
  | 'mother' | 'father' | 'parent'
  | 'friend' | 'other';

export type Pronouns = 'he' | 'she' | 'they';

export type AvatarHue = 'sage' | 'sky' | 'sand' | 'rose' | 'lavender' | 'clay' | 'moss' | 'gold';

export interface Person {
  id: string;
  name: string;
  relationship: Relationship;
  ageGroup?: AgeGroup;
  pronouns: Pronouns;
  focusTopics: TopicId[];
  /** Optional short note from the parent ("Big math test Thursday"). Never sent anywhere. */
  concern?: string;
  hue: AvatarHue;
  order: number;
  createdAt: string;
}

export interface SpecialDate {
  id: string;
  personId: string;
  occasion: OccasionId;
  date: DayKey;
  yearly: boolean;
  note?: string;
  createdAt: string;
}

export type BlessingSource = 'daily' | 'library' | 'journey' | 'search' | 'occasion' | 'onboarding';

/** A blessing prepared for one person on one day — cached so it is stable and works offline. */
export interface Blessing {
  id: string;
  personId: string;
  date: DayKey;
  entryId: string;
  topicId: TopicId;
  occasionId?: OccasionId;
  source: BlessingSource;
  journeyId?: string;
  journeyDay?: number;
  /** A newer blessing replaced this one as the person's blessing for the day. */
  replaced?: boolean;
  createdAt: string;
  prayedAt?: string;
}

export type JournalKind = 'reflection' | 'request' | 'gratitude' | 'note';

export interface JournalEntry {
  id: string;
  kind: JournalKind;
  personId?: string;
  blessingId?: string;
  entryId?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  /** Prayer requests can later be marked answered. */
  answeredAt?: string;
  answerNote?: string;
  photoId?: string;
  favorite?: boolean;
}

export interface Favorite {
  id: string;
  entryId: string;
  personId?: string;
  createdAt: string;
}

export interface JourneyProgress {
  id: string;
  journeyId: string;
  personId: string;
  startedAt: string;
  completedDays: number[];
  lastCompletedAt?: string;
  finishedAt?: string;
}

export type AuthProvider = 'guest' | 'apple' | 'google' | 'email';

export interface Account {
  id: string;
  name: string;
  email?: string;
  provider: AuthProvider;
  createdAt: string;
}

export type PlanId = 'monthly' | 'annual';

export interface Subscription {
  tier: 'free' | 'plus';
  plan?: PlanId;
  status: 'none' | 'trial' | 'active' | 'canceled';
  startedAt?: string;
  trialEndsAt?: string;
  renewsAt?: string;
}

export interface NotificationPrefs {
  morning: { enabled: boolean; time: string };
  evening: { enabled: boolean; time: string };
  specialMoments: boolean;
  permission: 'default' | 'granted' | 'denied' | 'unsupported';
  asked: boolean;
}

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  textScale: number;
  motion: 'system' | 'reduce';
  /** Solid surfaces instead of glass. Older saved settings may lack it (treated as 'system'). */
  transparency?: 'system' | 'reduce';
  haptics: boolean;
  translation: 'bsb' | 'web';
  audioRate: number;
  voiceURI?: string;
  analytics: boolean;
  dynamicType: boolean;
}

export type OnboardingIntent = 'child' | 'children' | 'spouse' | 'grandchild' | 'family' | 'other';

export interface PersistedState {
  version: number;
  installId: string;
  onboarded: boolean;
  intent?: OnboardingIntent;
  account: Account | null;
  people: Person[];
  specialDates: SpecialDate[];
  blessings: Blessing[];
  journal: JournalEntry[];
  favorites: Favorite[];
  journeys: JourneyProgress[];
  subscription: Subscription;
  notifications: NotificationPrefs;
  settings: Settings;
  selectedPersonId?: string;
  firstOpenedAt?: string;
  openDays: DayKey[];
  /** Monday of the last week whose aggregate summary was sent to analytics. */
  summarizedWeek?: DayKey;
  dismissed: string[];
}

export const RELATIONSHIP_KIND: Record<Relationship, RelationshipKind> = {
  son: 'child',
  daughter: 'child',
  child: 'child',
  grandson: 'grandchild',
  granddaughter: 'grandchild',
  grandchild: 'grandchild',
  husband: 'spouse',
  wife: 'spouse',
  spouse: 'spouse',
  family: 'family',
  mother: 'parent',
  father: 'parent',
  parent: 'parent',
  friend: 'friend',
  other: 'other',
};

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  son: 'Son',
  daughter: 'Daughter',
  child: 'Child',
  grandson: 'Grandson',
  granddaughter: 'Granddaughter',
  grandchild: 'Grandchild',
  husband: 'Husband',
  wife: 'Wife',
  spouse: 'Spouse',
  family: 'Family',
  mother: 'Mother',
  father: 'Father',
  parent: 'Parent',
  friend: 'Friend',
  other: 'Someone I love',
};

/** Pronouns implied by a relationship; `undefined` means ask (or default to they). */
export const RELATIONSHIP_PRONOUNS: Partial<Record<Relationship, Pronouns>> = {
  son: 'he',
  daughter: 'she',
  grandson: 'he',
  granddaughter: 'she',
  husband: 'he',
  wife: 'she',
  mother: 'she',
  father: 'he',
  family: 'they',
};

export const AVATAR_HUES: AvatarHue[] = ['sage', 'sky', 'sand', 'rose', 'lavender', 'clay', 'moss', 'gold'];

export const FREE_LIMITS = {
  people: 2,
  favorites: 10,
} as const;
