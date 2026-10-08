import { entriesForTopic } from '@/content/blessings';
import { TOPICS, TOPIC_BY_ID } from '@/content/taxonomy';
import type { Journey } from '@/content/journeys';
import type { CuratedEntry } from '@/content/types';
import type { JourneyProgress, Person } from '@/data/models';
import { seeded } from '@/lib/random';
import { relationshipKind } from './compose';
import { entrySuits } from './personalize';

export function journeySuits(journey: Journey, person: Person): boolean {
  if (journey.relationships && !journey.relationships.includes(relationshipKind(person))) return false;
  if (journey.ages && person.ageGroup && !journey.ages.includes(person.ageGroup)) return false;
  return true;
}

export interface PlannedDay {
  index: number;
  title: string;
  entry: CuratedEntry | null;
}

/** The whole journey for one person: deterministic, no passage repeated. */
export function journeyPlan(journey: Journey, person: Person): PlannedDay[] {
  const rand = seeded(`${journey.id}:${person.id}`);
  const usedIds = new Set<string>();
  const usedRefs = new Set<string>();
  return journey.days.map((day, index) => {
    const candidates = (topic: typeof day.topic) =>
      entriesForTopic(topic).filter((e) => entrySuits(e, person) && !usedIds.has(e.id) && !usedRefs.has(e.ref));
    let pool = candidates(day.topic);
    if (!pool.length) {
      for (const related of TOPIC_BY_ID[day.topic]?.related ?? []) {
        pool = candidates(related);
        if (pool.length) break;
      }
    }
    if (!pool.length) {
      // Then anything suitable in the same part of the library (e.g. “Their Heart”).
      const category = TOPIC_BY_ID[day.topic]?.category;
      for (const t of TOPICS.filter((x) => x.category === category && x.id !== day.topic)) {
        pool = candidates(t.id);
        if (pool.length) break;
      }
    }
    if (!pool.length) {
      // Last resort: allow a passage already used earlier in the journey.
      pool = entriesForTopic(day.topic).filter((e) => entrySuits(e, person));
    }
    const entry = pool.length ? pool[Math.floor(rand() * pool.length)] : null;
    if (entry) {
      usedIds.add(entry.id);
      usedRefs.add(entry.ref);
    }
    return { index, title: day.title, entry };
  });
}

export function nextJourneyDay(journey: Journey, progress: JourneyProgress | undefined): number {
  if (!progress) return 0;
  for (let i = 0; i < journey.days.length; i++) if (!progress.completedDays.includes(i)) return i;
  return journey.days.length;
}
