import type { CuratedEntry, TopicId } from '../types.ts';

/**
 * The curated Scripture-blessing library. Every entry was written to the
 * standard in docs/CONTENT_GUIDE.md and validated by scripts/lint-content.mjs.
 * Batches are discovered automatically: add a file exporting `entries`.
 */
const modules = import.meta.glob<{ entries: CuratedEntry[] }>(['./*.ts', '!./index.ts'], { eager: true });

export const ENTRIES: CuratedEntry[] = Object.keys(modules)
  .sort()
  .flatMap((path) => modules[path].entries);

export const ENTRY_BY_ID: ReadonlyMap<string, CuratedEntry> = new Map(ENTRIES.map((e) => [e.id, e]));

export const ENTRIES_BY_TOPIC: ReadonlyMap<TopicId, CuratedEntry[]> = ENTRIES.reduce((map, e) => {
  map.set(e.topic, [...(map.get(e.topic) ?? []), e]);
  return map;
}, new Map<TopicId, CuratedEntry[]>());

export function entriesForTopic(topic: TopicId): CuratedEntry[] {
  return ENTRIES_BY_TOPIC.get(topic) ?? [];
}
