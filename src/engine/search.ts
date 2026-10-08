import { ENTRIES } from '@/content/blessings';
import { BOOKS } from '@/content/scripture/books';
import { TOPICS, TOPIC_BY_ID } from '@/content/taxonomy';
import type { AgeGroup, CuratedEntry, TopicId } from '@/content/types';

/**
 * Natural-language search across curated topics and passages, entirely on device.
 *   “My daughter is afraid of starting middle school.”
 *   “Prayer for my son who is being bullied.”
 * Results are suggestions of Scripture to pray with — never presented as answers from God.
 */

type Weights = Partial<Record<TopicId, number>>;

/** Phrase → topic weights. Multi-word phrases are matched before single words. */
const LEXICON: Array<[string, Weights]> = [
  // fear & worry
  ['afraid', { fear: 1, courage: 0.6 }], ['scared', { fear: 1, courage: 0.6 }], ['fear', { fear: 1 }],
  ['frightened', { fear: 1 }], ['terrified', { fear: 1, anxiety: 0.5 }], ['brave', { courage: 1 }],
  ['courage', { courage: 1 }], ['nervous', { anxiety: 0.8, fear: 0.6, courage: 0.4 }],
  ['anxious', { anxiety: 1, peace: 0.5 }], ['anxiety', { anxiety: 1, peace: 0.5 }], ['worry', { anxiety: 1, trust: 0.4 }],
  ['worried', { anxiety: 1, trust: 0.4 }], ['worries', { anxiety: 1 }], ['stress', { anxiety: 0.9, peace: 0.6 }],
  ['stressed', { anxiety: 0.9, peace: 0.6 }], ['overwhelmed', { anxiety: 0.9, peace: 0.7 }], ['panic', { anxiety: 1, peace: 0.5 }],
  ['dark', { fear: 0.8, sleep: 0.6 }], ['nightmare', { sleep: 1, fear: 0.8 }], ['nightmares', { sleep: 1, fear: 0.8 }],
  // sleep & peace
  ['sleep', { sleep: 1, peace: 0.5 }], ['bedtime', { sleep: 1, peace: 0.4 }], ['bed', { sleep: 0.7 }], ['rest', { peace: 0.8, sleep: 0.6 }],
  ['tired', { peace: 0.6, sleep: 0.5 }], ['peace', { peace: 1 }], ['calm', { peace: 1, 'self-control': 0.3 }], ['night', { sleep: 0.7 }],
  // school & learning
  ['middle school', { school: 0.8, change: 0.6, 'new-experiences': 0.6, friendship: 0.3 }],
  ['high school', { school: 0.8, identity: 0.3, friendship: 0.3 }], ['new school', { change: 0.9, school: 0.8, friendship: 0.5 }],
  ['first day', { school: 0.8, courage: 0.7, 'new-experiences': 0.8 }], ['kindergarten', { school: 0.9, 'new-experiences': 0.6 }],
  ['school', { school: 1 }], ['class', { school: 0.6, learning: 0.4 }], ['homework', { focus: 0.7, school: 0.6, learning: 0.5 }],
  ['learn', { learning: 1 }], ['learning', { learning: 1 }], ['reading', { learning: 0.6 }], ['grades', { exams: 0.7, school: 0.5, identity: 0.3 }],
  ['exam', { exams: 1, focus: 0.5, anxiety: 0.3 }], ['exams', { exams: 1, focus: 0.5 }], ['test', { exams: 1, focus: 0.5, anxiety: 0.3 }],
  ['quiz', { exams: 0.8 }], ['finals', { exams: 1, focus: 0.6 }], ['sat', { exams: 0.9 }], ['act', { exams: 0.5 }],
  ['focus', { focus: 1 }], ['distracted', { focus: 1, 'self-control': 0.4 }], ['concentrate', { focus: 1 }],
  ['teacher', { teachers: 1, school: 0.4 }], ['teachers', { teachers: 1 }], ['coach', { sports: 0.6, teachers: 0.4 }],
  ['college', { calling: 0.7, purpose: 0.6, change: 0.4 }], ['graduation', { purpose: 0.8, calling: 0.7, gratitude: 0.4 }],
  // friendship & belonging
  ['friend', { friendship: 1 }], ['friends', { friendship: 1 }], ['friendship', { friendship: 1 }],
  ['no friends', { loneliness: 1, friendship: 0.8, rejection: 0.5 }], ['left out', { rejection: 1, loneliness: 0.7, friendship: 0.5 }],
  ['excluded', { rejection: 1, loneliness: 0.6 }], ['lonely', { loneliness: 1, friendship: 0.6 }], ['alone', { loneliness: 0.9 }],
  ['rejected', { rejection: 1, identity: 0.5 }], ['rejection', { rejection: 1, identity: 0.5 }], ['popular', { identity: 0.6, friendship: 0.5 }],
  ['bullied', { bullying: 1, rejection: 0.5, identity: 0.4, courage: 0.3 }], ['bullying', { bullying: 1, rejection: 0.4 }],
  ['bully', { bullying: 1 }], ['picked on', { bullying: 1, rejection: 0.5 }], ['teased', { bullying: 0.9, identity: 0.4 }],
  ['mean kids', { bullying: 0.9, rejection: 0.6, kindness: 0.3 }], ['mean', { kindness: 0.5, bullying: 0.4 }],
  ['peer pressure', { temptation: 1, discernment: 0.8, courage: 0.4 }],
  // character
  ['bad choices', { temptation: 0.9, wisdom: 0.8, discernment: 0.7, 'self-control': 0.6 }],
  ['wrong crowd', { discernment: 1, friendship: 0.6, temptation: 0.6 }], ['rebellious', { wisdom: 0.7, temptation: 0.6, family: 0.4 }],
  ['choices', { wisdom: 0.8, discernment: 0.6 }], ['decision', { wisdom: 1, discernment: 0.6 }], ['wisdom', { wisdom: 1 }], ['wise', { wisdom: 1 }],
  ['temptation', { temptation: 1 }], ['tempted', { temptation: 1, 'self-control': 0.5 }], ['phone', { 'self-control': 0.6, focus: 0.5 }],
  ['screen', { 'self-control': 0.6, focus: 0.5 }], ['screens', { 'self-control': 0.6, focus: 0.5 }], ['video games', { 'self-control': 0.6 }],
  ['angry', { 'self-control': 1, peace: 0.4 }], ['anger', { 'self-control': 1 }], ['temper', { 'self-control': 1 }],
  ['tantrum', { 'self-control': 1, peace: 0.4 }], ['tantrums', { 'self-control': 1 }],
  // A meltdown is often distress, not defiance: comfort comes before self-control.
  ['meltdown', { 'seen-and-understood': 0.9, peace: 0.7, 'self-control': 0.4 }], ['meltdowns', { 'seen-and-understood': 0.9, peace: 0.7, 'self-control': 0.4 }], ['patience', { 'self-control': 0.8, peace: 0.4 }], ['impulsive', { 'self-control': 1 }],
  ['lying', { honesty: 1, character: 0.5 }], ['lie', { honesty: 1 }], ['lies', { honesty: 1 }], ['honest', { honesty: 1 }], ['truth', { honesty: 0.8 }],
  ['kind', { kindness: 1 }], ['kindness', { kindness: 1 }], ['selfish', { kindness: 0.7, humility: 0.6, compassion: 0.5 }],
  ['empathy', { compassion: 1 }], ['compassion', { compassion: 1 }], ['proud', { humility: 0.8 }], ['humble', { humility: 1 }], ['arrogant', { humility: 1 }],
  ['grateful', { gratitude: 1 }], ['thankful', { gratitude: 1 }], ['ungrateful', { gratitude: 1 }], ['entitled', { gratitude: 0.8, humility: 0.6 }],
  ['forgive', { forgiveness: 1 }], ['forgiveness', { forgiveness: 1 }], ['sorry', { forgiveness: 0.8 }], ['apologize', { forgiveness: 0.8 }],
  ['grudge', { forgiveness: 1 }], ['character', { character: 1 }], ['integrity', { character: 1, honesty: 0.6 }],
  ['responsible', { responsibility: 1 }], ['responsibility', { responsibility: 1 }], ['chores', { responsibility: 1 }], ['lazy', { responsibility: 0.8 }],
  ['leader', { leadership: 1 }], ['leadership', { leadership: 1 }], ['captain', { leadership: 0.8, sports: 0.5 }],
  // identity
  ['confidence', { confidence: 1, identity: 0.6 }], ['confident', { confidence: 1 }], ['insecure', { identity: 1, confidence: 0.8 }],
  ['self esteem', { identity: 1, confidence: 0.8 }], ['self-esteem', { identity: 1, confidence: 0.8 }], ['shy', { confidence: 1, courage: 0.5 }],
  ['not good enough', { identity: 1, confidence: 0.7, failure: 0.4 }], ['compares', { identity: 1, confidence: 0.6 }],
  ['comparison', { identity: 1 }], ['body image', { identity: 1 }], ['worth', { identity: 1 }], ['identity', { identity: 1 }],
  ['who they are', { identity: 1 }], ['failed', { failure: 1, identity: 0.4 }], ['failure', { failure: 1 }], ['mistake', { failure: 0.9, forgiveness: 0.5 }],
  ['mistakes', { failure: 0.9, forgiveness: 0.5 }], ['perfectionist', { failure: 0.8, identity: 0.7, anxiety: 0.4 }], ['cut from', { rejection: 0.9, failure: 0.6 }],
  // family & relationships
  ['brother', { siblings: 1 }], ['sister', { siblings: 1 }], ['siblings', { siblings: 1 }], ['sibling', { siblings: 1 }],
  ['fighting', { conflict: 1, siblings: 0.4 }], ['arguing', { conflict: 1 }], ['conflict', { conflict: 1 }], ['argument', { conflict: 1 }],
  ['family', { family: 1 }], ['home', { family: 0.7 }], ['divorce', { family: 0.8, peace: 0.6, change: 0.6 }], ['new baby', { family: 0.8, gratitude: 0.6 }],
  ['marriage', { love: 1 }], ['husband', { love: 0.9 }], ['wife', { love: 0.9 }], ['spouse', { love: 0.9 }], ['anniversary', { love: 1, gratitude: 0.6 }],
  ['dating', { dating: 1 }], ['boyfriend', { dating: 1 }], ['girlfriend', { dating: 1 }], ['crush', { dating: 0.9, identity: 0.4 }],
  ['breakup', { rejection: 0.9, dating: 0.8, identity: 0.5 }], ['broke up', { rejection: 0.9, dating: 0.8 }], ['heartbroken', { rejection: 0.8, grief: 0.5 }],
  // hard seasons
  ['sick', { health: 1, peace: 0.4 }], ['illness', { health: 1 }], ['ill', { health: 0.9 }], ['hospital', { health: 1, fear: 0.4 }],
  ['surgery', { health: 1, peace: 0.6, fear: 0.5 }], ['cancer', { health: 1, fear: 0.5, peace: 0.5 }], ['diagnosis', { health: 1, trust: 0.6, 'wonderfully-made': 0.5 }],
  ['healing', { healing: 1, health: 0.9 }], ['health', { health: 1 }], ['pain', { health: 0.8, healing: 0.5 }], ['injury', { health: 0.9 }], ['injured', { health: 0.9 }],
  ['died', { grief: 1 }], ['death', { grief: 1 }], ['passed away', { grief: 1 }], ['funeral', { grief: 1 }], ['grief', { grief: 1 }],
  ['grieving', { grief: 1 }], ['loss', { grief: 0.9 }], ['miss', { grief: 0.6, loneliness: 0.5 }], ['pet died', { grief: 1 }],
  ['moving', { change: 1, 'new-experiences': 0.6 }], ['move', { change: 0.9 }], ['moved', { change: 0.9 }], ['change', { change: 1 }],
  ['transition', { change: 1 }], ['new town', { change: 1, friendship: 0.5 }], ['deployment', { protection: 0.8, loneliness: 0.6, peace: 0.5 }],
  ['struggling', { trust: 0.6, peace: 0.6, failure: 0.4, anxiety: 0.4 }], ['hard day', { peace: 0.8, courage: 0.4 }], ['sad', { grief: 0.6, peace: 0.6 }],
  ['depressed', { peace: 0.6, health: 0.6 }], ['crying', { peace: 0.7, grief: 0.4 }],
  // disability, autism and special needs
  ['special needs', { 'wonderfully-made': 1, 'seen-and-understood': 0.7, 'worry-and-future': 0.5 }],
  ['disability', { 'wonderfully-made': 1, healing: 0.5 }], ['disabilities', { 'wonderfully-made': 1, healing: 0.5 }],
  ['disabled', { 'wonderfully-made': 1, healing: 0.4 }], ['autism', { 'wonderfully-made': 1, 'seen-and-understood': 0.9 }],
  ['autistic', { 'wonderfully-made': 1, 'seen-and-understood': 0.9 }], ['asd', { 'wonderfully-made': 0.9, 'seen-and-understood': 0.8 }],
  ['adhd', { 'wonderfully-made': 0.8, focus: 0.6 }], ['down syndrome', { 'wonderfully-made': 1, healing: 0.4 }],
  ['cerebral palsy', { 'wonderfully-made': 1, healing: 0.6 }], ['wheelchair', { 'wonderfully-made': 0.9 }],
  ['syndrome', { 'wonderfully-made': 0.8, healing: 0.5 }], ['genetic', { healing: 0.7, 'wonderfully-made': 0.6 }],
  ['rare disease', { healing: 1, 'worry-and-future': 0.6 }], ['epilepsy', { healing: 1, 'worry-and-future': 0.5 }],
  ['seizures', { healing: 1, 'worry-and-future': 0.5 }], ['chronic', { healing: 1, 'caregiver-strength': 0.4 }],
  ['deaf', { 'seen-and-understood': 1, 'wonderfully-made': 0.7 }], ['blind', { 'wonderfully-made': 0.9, healing: 0.5 }],
  ['nonverbal', { 'seen-and-understood': 1 }], ['non-verbal', { 'seen-and-understood': 1 }], ['non-speaking', { 'seen-and-understood': 1 }],
  ['speech delay', { 'seen-and-understood': 1, 'worry-and-future': 0.4 }], ['speech', { 'seen-and-understood': 0.7 }],
  ['sensory', { 'seen-and-understood': 1, peace: 0.6 }], ['overstimulated', { 'seen-and-understood': 1, peace: 0.8 }],
  ['developmental delay', { 'worry-and-future': 0.9, 'seen-and-understood': 0.6 }], ['delayed', { 'worry-and-future': 0.7 }],
  ['milestones', { 'worry-and-future': 0.9 }], ['regression', { 'worry-and-future': 1, healing: 0.5 }],
  ['therapy', { healing: 0.7, 'caregiver-strength': 0.5 }], ['therapies', { healing: 0.7, 'caregiver-strength': 0.5 }],
  ['iep', { 'caregiver-strength': 0.8, school: 0.6, 'worry-and-future': 0.5 }], ['caregiver', { 'caregiver-strength': 1 }],
  ['caregiving', { 'caregiver-strength': 1 }], ['caring for', { 'caregiver-strength': 0.8 }], ['respite', { 'caregiver-strength': 1 }],
  ['exhausted', { 'caregiver-strength': 0.9, peace: 0.6 }], ['burnout', { 'caregiver-strength': 1 }], ['burned out', { 'caregiver-strength': 1 }],
  ['what if', { 'worry-and-future': 0.8, anxiety: 0.6 }], ['who will care', { 'worry-and-future': 1 }], ['guardianship', { 'worry-and-future': 1 }],
  ['different', { 'wonderfully-made': 0.6, identity: 0.5 }], ['included', { 'wonderfully-made': 0.7, friendship: 0.4 }],
  // future & purpose
  ['purpose', { purpose: 1 }], ['future', { purpose: 1, calling: 0.7, 'worry-and-future': 0.4 }], ['calling', { calling: 1 }], ['career', { calling: 1, work: 0.7 }],
  ['job', { work: 1 }], ['work', { work: 1 }], ['new job', { work: 1, courage: 0.6 }], ['interview', { work: 0.8, courage: 0.6 }],
  ['what should', { calling: 0.6, wisdom: 0.6 }],
  // everyday
  ['birthday', { birthdays: 1, gratitude: 0.4 }], ['turning', { birthdays: 0.7 }], ['trip', { travel: 1, protection: 0.5 }],
  ['travel', { travel: 1 }], ['flight', { travel: 1, fear: 0.3 }], ['road trip', { travel: 1 }], ['vacation', { travel: 0.9 }],
  ['camp', { 'new-experiences': 0.9, protection: 0.5 }], ['sleepover', { 'new-experiences': 0.7, friendship: 0.5 }],
  ['game', { sports: 1 }], ['sports', { sports: 1 }], ['team', { sports: 0.8, friendship: 0.3 }], ['tryouts', { sports: 1, courage: 0.6 }],
  ['soccer', { sports: 1 }], ['basketball', { sports: 1 }], ['baseball', { sports: 1 }], ['football', { sports: 1 }], ['swim', { sports: 0.8 }],
  ['dance', { sports: 0.6, confidence: 0.4 }], ['recital', { courage: 0.8, confidence: 0.7 }], ['performance', { courage: 0.8, confidence: 0.6 }],
  ['driving', { protection: 0.8, focus: 0.6 }], ['drive', { protection: 0.7, focus: 0.5 }], ['safe', { protection: 1 }], ['safety', { protection: 1 }],
  ['protect', { protection: 1 }], ['protection', { protection: 1 }], ['new', { 'new-experiences': 0.4 }],
  // faith
  ['faith', { faith: 1 }], ['believe', { faith: 0.9 }], ['doubt', { faith: 0.8, trust: 0.7 }], ['doubts', { faith: 0.8, trust: 0.7 }],
  ['god', { faith: 0.5 }], ['jesus', { faith: 0.7 }], ['trust', { trust: 1 }], ['pray', { prayer: 0.9 }], ['prayer', { prayer: 0.7 }],
  ['bible', { scripture: 1 }], ['scripture', { scripture: 0.8 }], ['baptism', { faith: 1, faithfulness: 0.5 }], ['church', { faith: 0.6 }],
];

const AGE_HINTS: Array<[RegExp, AgeGroup]> = [
  [/\b(baby|infant|newborn)\b/, 'baby'],
  [/\b(toddler|preschool(er)?|kindergarten)\b/, 'preschool'],
  [/\b(elementary|grade school|\d(st|nd|rd|th) grade)\b/, 'elementary'],
  [/\b(middle school|tween|preteen)\b/, 'tween'],
  [/\b(teen(ager)?|high school|teens)\b/, 'teen'],
  [/\b(college|university|young adult|adult (son|daughter|child))\b/, 'young-adult'],
];

const STOP = new Set(['a', 'an', 'the', 'my', 'our', 'for', 'to', 'of', 'and', 'or', 'is', 'are', 'who', 'that', 'with', 'about', 'in', 'on', 'at', 'be', 'being', 'has', 'have', 'it', 'he', 'she', 'they', 'his', 'her', 'their', 'me', 'i', 'we', 'prayer', 'pray', 'praying', 'scripture', 'verse', 'verses', 'bible', 'son', 'daughter', 'child', 'kid', 'kids', 'children']);

export function normalize(q: string): string {
  return q
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface TopicScore {
  topic: TopicId;
  score: number;
  matched: string[];
}

/** Maps free text to topics. Used by search and to weight a parent’s optional note. */
/** “Prayer for my son who…”, “scripture about…” — the framing, not the need. */
const FRAMING = /\b(a |an |some )?(prayers?|scriptures?|bible verses?|verses?|blessings?|passages?)\s+(for|about|over|on|when|before|after|to help|to)\b/g;

export function classifyTopics(text: string): TopicScore[] {
  const q = ` ${normalize(text).replace(FRAMING, ' ')} `;
  const scores = new Map<TopicId, TopicScore>();
  const bump = (topic: TopicId, w: number, term: string) => {
    const cur = scores.get(topic) ?? { topic, score: 0, matched: [] };
    cur.score += w;
    if (!cur.matched.includes(term)) cur.matched.push(term);
    scores.set(topic, cur);
  };
  let rest = q;
  const sorted = [...LEXICON].sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, weights] of sorted) {
    const needle = ` ${phrase} `;
    if (rest.includes(needle) || rest.includes(` ${phrase}s `) || rest.includes(` ${phrase}ed `) || rest.includes(` ${phrase}ing `)) {
      for (const [t, w] of Object.entries(weights)) bump(t as TopicId, w!, phrase);
      if (phrase.includes(' ')) rest = rest.replace(needle, ' ');
    }
  }
  for (const t of TOPICS) {
    const title = normalize(t.title);
    if (q.includes(` ${title} `)) bump(t.id, 1, title);
  }
  return [...scores.values()].sort((a, b) => b.score - a.score);
}

export function detectAge(text: string): AgeGroup | undefined {
  const q = normalize(text);
  return AGE_HINTS.find(([re]) => re.test(q))?.[1];
}

export interface EntryResult {
  entry: CuratedEntry;
  score: number;
  why: string;
}

export interface SearchResults {
  query: string;
  topics: TopicScore[];
  entries: EntryResult[];
  age?: AgeGroup;
  /** A reference like “Psalm 23” or “John 3:16” was recognised. */
  reference?: string;
}

const BOOK_ALIASES: Array<[RegExp, string]> = Object.values(BOOKS).flatMap((b) => {
  const names = new Set([b.name.toLowerCase(), b.citeName.toLowerCase()]);
  return [...names].map((n) => [new RegExp(`\\b${n.replace(/ /g, '\\s?')}\\s+(\\d+)(?::(\\d+))?`), b.id] as [RegExp, string]);
});

export function search(query: string, opts: { limit?: number } = {}): SearchResults {
  const limit = opts.limit ?? 12;
  const q = normalize(query);
  if (!q) return { query, topics: [], entries: [] };

  const topics = classifyTopics(query);
  const age = detectAge(query);
  const words = q.split(' ').filter((w) => w.length > 2 && !STOP.has(w));

  // Scripture references, e.g. "psalm 23" or "joshua 1:9".
  let refBook: string | undefined;
  let refChapter: number | undefined;
  let refVerse: number | undefined;
  for (const [re, id] of BOOK_ALIASES) {
    const m = q.match(re);
    if (m) {
      refBook = id;
      refChapter = Number(m[1]);
      refVerse = m[2] ? Number(m[2]) : undefined;
      break;
    }
  }

  const topicWeight = new Map(topics.map((t) => [t.topic, t.score]));
  const results: EntryResult[] = [];
  for (const entry of ENTRIES) {
    let score = 0;
    let why = '';
    const tw = topicWeight.get(entry.topic);
    if (tw) {
      score += tw * 2;
      why = TOPIC_BY_ID[entry.topic].title;
    }
    const kw = entry.keywords.filter((k) => q.includes(normalize(k)));
    if (kw.length) {
      score += 1.6 * kw.length;
      why = why || `“${kw[0]}”`;
    }
    const hay = normalize(`${entry.reflection} ${entry.blessing}`);
    const hits = words.filter((w) => hay.includes(w));
    score += hits.length * 0.25;
    if (refBook) {
      const [book, cv] = entry.ref.split(' ');
      const [c, v] = cv.split(':');
      if (book === refBook && Number(c) === refChapter) {
        const [vs, ve] = v.split('-').map(Number);
        const inRange = refVerse === undefined || (refVerse >= vs && refVerse <= (ve || vs));
        score += inRange ? 8 : 3;
        why = 'Scripture reference';
      }
    }
    if (age && !entry.ages.includes(age)) score *= 0.35;
    if (score > 0.6) results.push({ entry, score, why });
  }
  results.sort((a, b) => b.score - a.score);

  // Keep variety: at most three passages from any one topic in the top results.
  const perTopic = new Map<TopicId, number>();
  const entries = results.filter((r) => {
    const n = perTopic.get(r.entry.topic) ?? 0;
    perTopic.set(r.entry.topic, n + 1);
    return n < 3;
  });

  return {
    query,
    topics: topics.slice(0, 4),
    entries: entries.slice(0, limit),
    age,
    reference: refBook ? `${BOOKS[refBook].citeName} ${refChapter}${refVerse ? `:${refVerse}` : ''}` : undefined,
  };
}
