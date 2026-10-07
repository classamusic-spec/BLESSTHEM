import { ENTRIES, entriesForTopic } from '@/content/blessings';
import { OCCASION_BY_ID, TOPIC_BY_ID } from '@/content/taxonomy';
import type { AgeGroup, CuratedEntry, OccasionId, TopicId } from '@/content/types';
import type { Blessing, Person, SpecialDate } from '@/data/models';
import { daysBetween, nextOccurrence, parseDayKey, type DayKey } from '@/lib/dates';
import { seeded, weightedPick } from '@/lib/random';
import { relationshipKind } from './compose';
import { classifyTopics } from './search';

/**
 * Chooses a person's blessing for a day.
 *
 * Inputs: relationship, age group, chosen focus topics, the parent's optional note,
 * recent history (to avoid repetition), special dates, and time of day.
 * Output is deterministic for (person, day) so the blessing is stable all day and
 * can be cached for offline use. Nothing here infers sensitive facts: topics only
 * come from what the parent chose or typed.
 */

export interface DailyChoice {
  entry: CuratedEntry;
  topicId: TopicId;
  occasionId?: OccasionId;
  /** Why this was chosen — shown quietly, e.g. “Because you’re praying about courage”. */
  reason: string;
}

export interface ChooseOptions {
  person: Person;
  date: DayKey;
  history: Blessing[];
  specialDates?: SpecialDate[];
  /** Occasion-aware blessings are part of Bless Them+. */
  occasionsEnabled?: boolean;
  hour?: number;
  /** Restrict to a topic (e.g. “choose a different focus”). */
  topic?: TopicId;
  /** Entries to avoid even if not in history (e.g. the one being replaced). */
  avoid?: string[];
}

const DEFAULT_TOPICS: Record<string, TopicId[]> = {
  little: ['faith', 'protection', 'sleep', 'kindness', 'gratitude'],
  child: ['faith', 'courage', 'kindness', 'wisdom', 'friendship'],
  teen: ['identity', 'wisdom', 'courage', 'faith', 'purpose'],
  spouse: ['love', 'peace', 'wisdom', 'faith', 'gratitude'],
  adult: ['faith', 'peace', 'wisdom', 'trust', 'gratitude'],
  family: ['family', 'gratitude', 'peace', 'faith', 'kindness'],
};

export function entrySuits(entry: CuratedEntry, person: Person): boolean {
  if (person.ageGroup && !entry.ages.includes(person.ageGroup)) return false;
  if (entry.relationships && !entry.relationships.includes(relationshipKind(person))) return false;
  return true;
}

export function topicSuits(topicId: TopicId, person: Pick<Person, 'ageGroup' | 'relationship'>): boolean {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic) return false;
  if (person.ageGroup && !topic.ages.includes(person.ageGroup)) return false;
  if (topic.relationships && !topic.relationships.includes(relationshipKind(person as Person))) return false;
  return entriesForTopic(topicId).some((e) => entrySuits(e, person as Person));
}

export function defaultTopicsFor(person: Pick<Person, 'ageGroup' | 'relationship'>): TopicId[] {
  const kind = relationshipKind(person as Person);
  const age: AgeGroup | undefined = person.ageGroup;
  let key = 'child';
  if (kind === 'family') key = 'family';
  else if (kind === 'spouse') key = 'spouse';
  else if (age === 'baby' || age === 'preschool') key = 'little';
  else if (age === 'teen' || age === 'young-adult') key = 'teen';
  else if (age === 'adult' || kind === 'parent' || kind === 'friend') key = 'adult';
  return DEFAULT_TOPICS[key].filter((t) => topicSuits(t, person));
}

/** The occasion for this person today or tomorrow, if any. */
export function occasionFor(person: Person, date: DayKey, specialDates: SpecialDate[] = []): SpecialDate | undefined {
  return specialDates
    .filter((s) => s.personId === person.id)
    .map((s) => ({ s, next: nextOccurrence(s.date, s.yearly, date) }))
    .filter(({ next }) => next !== null && daysBetween(date, next) <= 1)
    .sort((a, b) => daysBetween(date, a.next!) - daysBetween(date, b.next!))[0]?.s;
}

export function chooseDaily(opts: ChooseOptions): DailyChoice | null {
  const { person, date, history } = opts;
  const rand = seeded(`${person.id}:${date}:${opts.topic ?? ''}:${(opts.avoid ?? []).join(',')}`);
  const hour = opts.hour ?? new Date().getHours();
  const mine = history.filter((b) => b.personId === person.id && b.date <= date);

  // 1 ─ Special moments come first.
  if (!opts.topic && opts.occasionsEnabled) {
    const special = occasionFor(person, date, opts.specialDates);
    if (special) {
      const occasion = OCCASION_BY_ID[special.occasion];
      const tagged = ENTRIES.filter((e) => e.occasions?.includes(special.occasion) && entrySuits(e, person));
      const pool = tagged.length ? tagged : occasion.topics.flatMap((t) => entriesForTopic(t)).filter((e) => entrySuits(e, person));
      const entry = pickEntry(pool, mine, date, rand, opts.avoid);
      if (entry) {
        return { entry, topicId: entry.topic, occasionId: special.occasion, reason: occasion.eyebrow };
      }
    }
  }

  // 2 ─ Weight candidate topics.
  const weights = new Map<TopicId, number>();
  const add = (t: TopicId, w: number) => {
    if (!topicSuits(t, person)) return;
    weights.set(t, Math.max(weights.get(t) ?? 0, w));
  };

  if (opts.topic) {
    add(opts.topic, 1);
  } else {
    const focus = person.focusTopics.length ? person.focusTopics : defaultTopicsFor(person);
    focus.forEach((t) => add(t, 1));
    if (person.concern) classifyTopics(person.concern).slice(0, 3).forEach(({ topic, score }) => add(topic, 1 + Math.min(score, 1) * 0.3));
    for (const t of focus) for (const r of TOPIC_BY_ID[t]?.related ?? []) if (!weights.has(r)) add(r, 0.18);

    // Gentle variety: rest topics used very recently.
    for (const [t, w] of weights) {
      const last = mine.filter((b) => b.topicId === t).map((b) => b.date).sort().pop();
      const ago = last ? daysBetween(last, date) : Infinity;
      const factor = ago <= 0 ? 0.15 : ago === 1 ? 0.3 : ago === 2 ? 0.6 : ago <= 4 ? 0.85 : 1;
      weights.set(t, w * factor);
    }

    // Time of day: bedtime topics in the evening, courage for school mornings.
    const evening = hour >= 18 || hour < 4;
    const weekday = parseDayKey(date).getDay() % 6 !== 0;
    for (const [t, w] of weights) {
      if (evening && (t === 'sleep' || t === 'peace')) weights.set(t, w * 1.7);
      if (!evening && weekday && hour < 11 && (t === 'school' || t === 'courage' || t === 'focus')) weights.set(t, w * 1.25);
      if (!evening && t === 'sleep') weights.set(t, w * 0.5);
    }
  }

  const topicOrder = [...weights.entries()].filter(([, w]) => w > 0);
  if (!topicOrder.length) {
    const fallback = ENTRIES.filter((e) => entrySuits(e, person));
    const entry = pickEntry(fallback, mine, date, rand, opts.avoid);
    return entry ? { entry, topicId: entry.topic, reason: 'A blessing for today' } : null;
  }

  // 3 ─ Pick a topic, then a passage within it (falling back across topics if a topic is exhausted).
  const tried = new Set<TopicId>();
  while (tried.size < topicOrder.length) {
    const remaining = topicOrder.filter(([t]) => !tried.has(t)).map(([item, weight]) => ({ item, weight }));
    const topicId = weightedPick(remaining, rand)!;
    tried.add(topicId);
    const entry = pickEntry(entriesForTopic(topicId).filter((e) => entrySuits(e, person)), mine, date, rand, opts.avoid);
    if (entry) {
      const focusHit = person.focusTopics.includes(topicId) || opts.topic === topicId;
      return {
        entry,
        topicId,
        reason: focusHit ? `Because you’re praying about ${TOPIC_BY_ID[topicId].title.toLowerCase()}` : 'A blessing for today',
      };
    }
  }
  return null;
}

/** Chooses an entry, preferring ones not used for this person in the last month. */
function pickEntry(pool: CuratedEntry[], history: Blessing[], date: DayKey, rand: () => number, avoid: string[] = []): CuratedEntry | undefined {
  if (!pool.length) return undefined;
  const lastUsed = new Map<string, DayKey>();
  for (const b of history) {
    const prev = lastUsed.get(b.entryId);
    if (!prev || b.date > prev) lastUsed.set(b.entryId, b.date);
  }
  const recentRefs = new Set(
    history.filter((b) => daysBetween(b.date, date) <= 21).map((b) => ENTRIES.find((e) => e.id === b.entryId)?.ref),
  );
  const candidates = pool
    .filter((e) => !avoid.includes(e.id))
    .map((e) => {
      const used = lastUsed.get(e.id);
      const ago = used ? daysBetween(used, date) : 999;
      let weight = ago >= 30 ? 1 : ago >= 14 ? 0.35 : ago >= 7 ? 0.08 : 0.01;
      if (recentRefs.has(e.ref) && ago < 999) weight *= 0.5;
      if (recentRefs.has(e.ref) && ago === 999) weight *= 0.4; // same passage under another topic
      return { item: e, weight };
    });
  if (!candidates.length) return undefined;
  return weightedPick(candidates, rand);
}

/** Days within the next week that have a saved special moment, for the Today screen. */
export function upcomingMoments(people: Person[], specialDates: SpecialDate[], today: DayKey, horizonDays = 14) {
  return specialDates
    .map((s) => {
      const next = nextOccurrence(s.date, s.yearly, today);
      return next ? { special: s, next, inDays: daysBetween(today, next), person: people.find((p) => p.id === s.personId) } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x && x.person && x.inDays <= horizonDays))
    .sort((a, b) => a.inDays - b.inDays);
}

