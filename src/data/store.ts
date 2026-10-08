import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { OccasionId, TopicId } from '@/content/types';
import { ENTRY_BY_ID } from '@/content/blessings';
import { JOURNEY_BY_ID } from '@/content/journeys';
import { chooseDaily } from '@/engine/personalize';
import { track } from '@/services/analytics';
import { dayKey, type DayKey } from '@/lib/dates';
import { newId } from '@/lib/id';
import {
  AVATAR_HUES,
  FREE_LIMITS,
  RELATIONSHIP_PRONOUNS,
  type Account,
  type Blessing,
  type BlessingSource,
  type Favorite,
  type JournalEntry,
  type JournalKind,
  type JourneyProgress,
  type NotificationPrefs,
  type OnboardingIntent,
  type Person,
  type PersistedState,
  type Settings,
  type SpecialDate,
  type Subscription,
} from './models';

export const STORE_KEY = 'blessthem:v1';
export const STORE_VERSION = 1;

export function initialState(): PersistedState {
  return {
    version: STORE_VERSION,
    installId: newId('inst'),
    onboarded: false,
    account: null,
    people: [],
    specialDates: [],
    blessings: [],
    journal: [],
    favorites: [],
    journeys: [],
    subscription: { tier: 'free', status: 'none' },
    notifications: {
      morning: { enabled: true, time: '07:00' },
      evening: { enabled: false, time: '20:30' },
      specialMoments: true,
      permission: 'default',
      asked: false,
    },
    settings: {
      theme: 'system',
      textScale: 1,
      motion: 'system',
      haptics: true,
      translation: 'bsb',
      audioRate: 0.95,
      analytics: true,
      dynamicType: true,
    },
    openDays: [],
    dismissed: [],
  };
}

export type NewPerson = Omit<Person, 'id' | 'createdAt' | 'order' | 'hue' | 'pronouns'> & Partial<Pick<Person, 'hue' | 'pronouns'>>;

export interface Actions {
  recordOpen(): void;
  markWeekSummarized(week: DayKey): void;
  setIntent(intent: OnboardingIntent): void;
  completeOnboarding(opts: { signedUp: boolean }): void;

  addPerson(input: NewPerson): Person;
  updatePerson(id: string, patch: Partial<Omit<Person, 'id' | 'createdAt'>>): void;
  removePerson(id: string): void;
  selectPerson(id: string): void;
  reorderPeople(ids: string[]): void;

  addSpecialDate(input: Omit<SpecialDate, 'id' | 'createdAt'>): SpecialDate;
  removeSpecialDate(id: string): void;

  ensureBlessing(personId: string, date?: DayKey): Blessing | null;
  setBlessing(personId: string, entryId: string, source: BlessingSource, extra?: Partial<Pick<Blessing, 'journeyId' | 'journeyDay' | 'occasionId'>>): Blessing | null;
  changeFocus(personId: string, topic?: TopicId): Blessing | null;
  markPrayed(blessingId: string): { first: boolean };
  unmarkPrayed(blessingId: string): void;

  addJournalEntry(input: { kind: JournalKind; text: string; personId?: string; blessingId?: string; entryId?: string; photoId?: string }): JournalEntry;
  updateJournalEntry(id: string, patch: Partial<Pick<JournalEntry, 'text' | 'kind' | 'personId' | 'photoId' | 'favorite'>>): void;
  deleteJournalEntry(id: string): void;
  markAnswered(id: string, note?: string): void;
  unmarkAnswered(id: string): void;

  toggleFavorite(entryId: string, personId?: string): { added: boolean; limited: boolean };

  startJourney(journeyId: string, personId: string): JourneyProgress;
  completeJourneyDay(progressId: string, day: number, totalDays: number): void;
  leaveJourney(progressId: string): void;

  setAccount(account: Account | null): void;
  setSubscription(sub: Subscription): void;
  updateNotifications(patch: Partial<NotificationPrefs>): void;
  updateSettings(patch: Partial<Settings>): void;
  dismiss(key: string): void;
  resetAll(): void;
}

export type AppStore = PersistedState & Actions;

const now = () => new Date().toISOString();

export function isPlus(state: Pick<PersistedState, 'subscription'>): boolean {
  const s = state.subscription;
  if (s.tier !== 'plus') return false;
  if (s.status === 'active' || s.status === 'trial') return true;
  // A canceled plan stays active until the end of the paid period.
  return s.status === 'canceled' && !!s.renewsAt && new Date(s.renewsAt) > new Date();
}

/** The blessing currently shown for a person on a day (the newest not replaced). */
export function currentBlessing(blessings: Blessing[], personId: string, date: DayKey): Blessing | undefined {
  for (let i = blessings.length - 1; i >= 0; i--) {
    const b = blessings[i];
    if (b.personId === personId && b.date === date && !b.replaced) return b;
  }
  return undefined;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      recordOpen() {
        const today = dayKey();
        const s = get();
        if (!s.openDays.includes(today)) {
          set({ openDays: [...s.openDays, today].slice(-400), firstOpenedAt: s.firstOpenedAt ?? now() });
        }
      },

      markWeekSummarized(week) {
        set({ summarizedWeek: week });
      },

      setIntent(intent) {
        set({ intent });
      },

      completeOnboarding({ signedUp }) {
        set({ onboarded: true });
        track({ name: 'onboarding_completed', props: { signedUp } });
      },

      addPerson(input) {
        const s = get();
        const usedHues = new Set(s.people.map((p) => p.hue));
        const hue = input.hue ?? AVATAR_HUES.find((h) => !usedHues.has(h)) ?? AVATAR_HUES[s.people.length % AVATAR_HUES.length];
        const person: Person = {
          ...input,
          name: input.name.trim(),
          pronouns: input.pronouns ?? RELATIONSHIP_PRONOUNS[input.relationship] ?? 'they',
          hue,
          id: newId('per'),
          createdAt: now(),
          order: s.people.length,
        };
        set({ people: [...s.people, person], selectedPersonId: s.selectedPersonId ?? person.id });
        track({ name: 'person_added', props: { count: s.people.length + 1, relationship: person.relationship, hasAge: Boolean(person.ageGroup) } });
        return person;
      },

      updatePerson(id, patch) {
        set((s) => ({
          people: s.people.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  name: patch.name !== undefined ? patch.name.trim() : p.name,
                  pronouns: patch.relationship && !patch.pronouns ? RELATIONSHIP_PRONOUNS[patch.relationship] ?? p.pronouns : patch.pronouns ?? p.pronouns,
                }
              : p,
          ),
        }));
      },

      removePerson(id) {
        set((s) => {
          const people = s.people.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }));
          return {
            people,
            blessings: s.blessings.filter((b) => b.personId !== id),
            specialDates: s.specialDates.filter((d) => d.personId !== id),
            journeys: s.journeys.filter((j) => j.personId !== id),
            favorites: s.favorites.map((f) => (f.personId === id ? { ...f, personId: undefined } : f)),
            // Journal entries are the parent's words; keep them but detach the person.
            journal: s.journal.map((j) => (j.personId === id ? { ...j, personId: undefined } : j)),
            selectedPersonId: s.selectedPersonId === id ? people[0]?.id : s.selectedPersonId,
          };
        });
        track({ name: 'person_removed' });
      },

      selectPerson(id) {
        set({ selectedPersonId: id });
      },

      reorderPeople(ids) {
        set((s) => ({
          people: ids.map((id, order) => ({ ...s.people.find((p) => p.id === id)!, order })).filter((p) => p.id),
        }));
      },

      addSpecialDate(input) {
        const special: SpecialDate = { ...input, id: newId('day'), createdAt: now() };
        set((s) => ({ specialDates: [...s.specialDates, special] }));
        return special;
      },

      removeSpecialDate(id) {
        set((s) => ({ specialDates: s.specialDates.filter((d) => d.id !== id) }));
      },

      ensureBlessing(personId, date = dayKey()) {
        const s = get();
        const existing = currentBlessing(s.blessings, personId, date);
        if (existing && ENTRY_BY_ID.has(existing.entryId)) return existing;
        const person = s.people.find((p) => p.id === personId);
        if (!person) return null;
        const choice = chooseDaily({
          person,
          date,
          history: s.blessings,
          specialDates: s.specialDates,
          occasionsEnabled: isPlus(s),
        });
        if (!choice) return null;
        const blessing: Blessing = {
          id: newId('bls'),
          personId,
          date,
          entryId: choice.entry.id,
          topicId: choice.topicId,
          occasionId: choice.occasionId as OccasionId | undefined,
          source: choice.occasionId ? 'occasion' : 'daily',
          createdAt: now(),
        };
        set((st) => ({ blessings: [...st.blessings, blessing] }));
        return blessing;
      },

      setBlessing(personId, entryId, source, extra) {
        const entry = ENTRY_BY_ID.get(entryId);
        if (!entry) return null;
        const date = dayKey();
        const s = get();
        const current = currentBlessing(s.blessings, personId, date);
        if (current && current.entryId === entryId && !current.prayedAt) return current;
        const blessing: Blessing = {
          id: newId('bls'),
          personId,
          date,
          entryId,
          topicId: entry.topic,
          source,
          createdAt: now(),
          ...extra,
        };
        set((st) => ({
          blessings: [...st.blessings.map((b) => (current && b.id === current.id ? { ...b, replaced: true } : b)), blessing],
          selectedPersonId: personId,
        }));
        return blessing;
      },

      changeFocus(personId, topic) {
        const s = get();
        const person = s.people.find((p) => p.id === personId);
        if (!person) return null;
        const date = dayKey();
        const current = currentBlessing(s.blessings, personId, date);
        const choice = chooseDaily({
          person,
          date,
          history: s.blessings,
          topic,
          avoid: current ? [current.entryId] : [],
          hour: new Date().getHours(),
        });
        if (!choice) return null;
        if (topic) track({ name: 'focus_changed', props: { topic } });
        return get().setBlessing(personId, choice.entry.id, topic ? 'library' : 'daily');
      },

      markPrayed(blessingId) {
        const s = get();
        const first = !s.blessings.some((b) => b.prayedAt);
        const target = s.blessings.find((b) => b.id === blessingId);
        if (!target || target.prayedAt) return { first: false };
        set({ blessings: s.blessings.map((b) => (b.id === blessingId ? { ...b, prayedAt: now() } : b)) });
        track({ name: 'blessing_completed', props: { topic: target.topicId, source: target.source, first } });
        // A journey day is complete when its blessing is prayed, wherever that happens.
        if (target.journeyId !== undefined && target.journeyDay !== undefined) {
          const progress = s.journeys.find((j) => j.journeyId === target.journeyId && j.personId === target.personId && !j.finishedAt);
          const journey = JOURNEY_BY_ID[target.journeyId];
          if (progress && journey) get().completeJourneyDay(progress.id, target.journeyDay, journey.days.length);
        }
        return { first };
      },

      unmarkPrayed(blessingId) {
        set((s) => ({ blessings: s.blessings.map((b) => (b.id === blessingId ? { ...b, prayedAt: undefined } : b)) }));
      },

      addJournalEntry(input) {
        const entry: JournalEntry = { ...input, text: input.text.trim(), id: newId('jrn'), createdAt: now(), updatedAt: now() };
        set((s) => ({ journal: [entry, ...s.journal] }));
        track({ name: 'journal_entry_created', props: { kind: input.kind, withPerson: Boolean(input.personId), withPhoto: Boolean(input.photoId) } });
        return entry;
      },

      updateJournalEntry(id, patch) {
        set((s) => ({
          journal: s.journal.map((j) => {
            if (j.id !== id) return j;
            const next = { ...j, ...patch, updatedAt: now() };
            // Only prayer requests can be answered (the server schema enforces this too).
            return next.kind === 'request' ? next : { ...next, answeredAt: undefined, answerNote: undefined };
          }),
        }));
      },

      deleteJournalEntry(id) {
        set((s) => ({ journal: s.journal.filter((j) => j.id !== id) }));
      },

      markAnswered(id, note) {
        set((s) => ({
          journal: s.journal.map((j) => (j.id === id ? { ...j, answeredAt: now(), answerNote: note?.trim() || undefined, updatedAt: now() } : j)),
        }));
        track({ name: 'prayer_answered' });
      },

      unmarkAnswered(id) {
        set((s) => ({ journal: s.journal.map((j) => (j.id === id ? { ...j, answeredAt: undefined, answerNote: undefined } : j)) }));
      },

      toggleFavorite(entryId, personId) {
        const s = get();
        const existing = s.favorites.find((f) => f.entryId === entryId);
        if (existing) {
          set({ favorites: s.favorites.filter((f) => f.id !== existing.id) });
          return { added: false, limited: false };
        }
        if (!isPlus(s) && s.favorites.length >= FREE_LIMITS.favorites) return { added: false, limited: true };
        const fav: Favorite = { id: newId('fav'), entryId, personId, createdAt: now() };
        set({ favorites: [fav, ...s.favorites] });
        track({ name: 'favorite_added' });
        return { added: true, limited: false };
      },

      startJourney(journeyId, personId) {
        const s = get();
        const existing = s.journeys.find((j) => j.journeyId === journeyId && j.personId === personId && !j.finishedAt);
        if (existing) return existing;
        const progress: JourneyProgress = { id: newId('jny'), journeyId, personId, startedAt: now(), completedDays: [] };
        set({ journeys: [...s.journeys, progress] });
        track({ name: 'journey_started', props: { journey: journeyId } });
        return progress;
      },

      completeJourneyDay(progressId, day, totalDays) {
        set((s) => ({
          journeys: s.journeys.map((j) => {
            if (j.id !== progressId || j.completedDays.includes(day)) return j;
            const completedDays = [...j.completedDays, day].sort((a, b) => a - b);
            return { ...j, completedDays, lastCompletedAt: now(), finishedAt: completedDays.length >= totalDays ? now() : undefined };
          }),
        }));
        const p = get().journeys.find((j) => j.id === progressId);
        if (p) track({ name: 'journey_day_completed', props: { journey: p.journeyId, day } });
      },

      leaveJourney(progressId) {
        set((s) => ({ journeys: s.journeys.filter((j) => j.id !== progressId) }));
      },

      setAccount(account) {
        set({ account });
      },

      setSubscription(subscription) {
        set({ subscription });
      },

      updateNotifications(patch) {
        set((s) => ({ notifications: { ...s.notifications, ...patch } }));
      },

      updateSettings(patch) {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      dismiss(key) {
        set((s) => (s.dismissed.includes(key) ? s : { dismissed: [...s.dismissed, key] }));
      },

      resetAll() {
        const fresh = initialState();
        set({ ...fresh });
      },
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        // Persist data only — never functions.
        const { version, installId, onboarded, intent, account, people, specialDates, blessings, journal, favorites, journeys, subscription, notifications, settings, selectedPersonId, firstOpenedAt, openDays, summarizedWeek, dismissed } = s;
        return { version, installId, onboarded, intent, account, people, specialDates, blessings, journal, favorites, journeys, subscription, notifications, settings, selectedPersonId, firstOpenedAt, openDays, summarizedWeek, dismissed };
      },
      migrate: (persisted, fromVersion) => {
        // Future schema changes are applied here, step by step from `fromVersion`.
        const base = initialState();
        const state = (persisted ?? {}) as Partial<PersistedState>;
        if (fromVersion < 1) return { ...base, ...state, version: STORE_VERSION };
        return { ...base, ...state, settings: { ...base.settings, ...state.settings }, notifications: { ...base.notifications, ...state.notifications } };
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...p.settings },
          notifications: { ...current.notifications, ...p.notifications },
        };
      },
    },
  ),
);

/** Convenience hook: is the household on Bless Them+? */
export const usePlus = () => useStore(isPlus);
