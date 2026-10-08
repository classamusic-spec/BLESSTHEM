import type { AgeGroup, CuratedEntry, RelationshipKind } from '@/content/types';
import { TOPIC_BY_ID, type Topic } from '@/content/taxonomy';
import { getPassage, type Passage, type TranslationId } from '@/content/scripture';
import { RELATIONSHIP_KIND, type Person, type Pronouns, type Relationship } from '@/data/models';
import { capitalize } from '@/lib/text';

/**
 * Turns a curated entry into the words shown for one person.
 * Only these tokens exist: {name} {Name} {them} {Them} {their} {Their} {theirs} {themselves}.
 * Scripture is never part of a template — it is resolved separately from verified data.
 */

const PRONOUN_FORMS: Record<Pronouns | 'plural', { them: string; their: string; theirs: string; themselves: string }> = {
  he: { them: 'him', their: 'his', theirs: 'his', themselves: 'himself' },
  she: { them: 'her', their: 'her', theirs: 'hers', themselves: 'herself' },
  they: { them: 'them', their: 'their', theirs: 'theirs', themselves: 'themselves' },
  plural: { them: 'them', their: 'their', theirs: 'theirs', themselves: 'themselves' },
};

export type PersonLike = Pick<Person, 'name' | 'relationship' | 'pronouns' | 'ageGroup'>;

export function relationshipKind(person: PersonLike): RelationshipKind {
  return RELATIONSHIP_KIND[person.relationship];
}

/** How the person is named inside a prayer. A family is prayed for as “our family”. */
export function prayerName(person: PersonLike): string {
  return relationshipKind(person) === 'family' ? 'our family' : person.name.trim();
}

/** How the person is named in headings: “Speak this over Gabriel” / “…over your family”. */
export function headingName(person: PersonLike): string {
  return relationshipKind(person) === 'family' ? 'your family' : person.name.trim();
}

export function fillTemplate(template: string, person: PersonLike): string {
  const name = prayerName(person);
  const forms = PRONOUN_FORMS[relationshipKind(person) === 'family' ? 'plural' : person.pronouns];
  return template
    .replace(/\{name\}/g, name)
    .replace(/\{Name\}/g, capitalize(name))
    .replace(/\{them\}/g, forms.them)
    .replace(/\{Them\}/g, capitalize(forms.them))
    .replace(/\{their\}/g, forms.their)
    .replace(/\{Their\}/g, capitalize(forms.their))
    .replace(/\{theirs\}/g, forms.theirs)
    .replace(/\{themselves\}/g, forms.themselves)
    // “our family” can land at the start of a sentence when a template used {name}.
    .replace(/(^|[.!?]\s+)our family/g, '$1Our family');
}

export type TalkStage = 'little' | 'child' | 'teen' | 'adult';

export function talkStage(person: PersonLike): TalkStage {
  const age: AgeGroup | undefined = person.ageGroup;
  if (age === 'baby' || age === 'preschool') return 'little';
  if (age === 'elementary' || age === 'tween') return 'child';
  if (age === 'teen' || age === 'young-adult') return 'teen';
  if (age === 'adult') return 'adult';
  const kind = relationshipKind(person);
  if (kind === 'spouse' || kind === 'parent' || kind === 'friend') return 'adult';
  return 'child';
}

export function pickTalk(entry: CuratedEntry, person: PersonLike): string | undefined {
  const stage = talkStage(person);
  if (stage === 'little') return entry.talk.little; // babies: only when written for them
  return entry.talk[stage];
}

export interface ComposedBlessing {
  entry: CuratedEntry;
  topic: Topic;
  /** null when verified Scripture could not be loaded — the UI must not invent a substitute. */
  passage: Passage | null;
  reflection: string;
  blessing: string;
  prayer: string;
  talk?: string;
  speakHeading: string;
  /** e.g. “Today I’m praying courage over Gabriel.” — share-card line, no private content. */
  shareLine: string;
  /** The same line without the person’s name, e.g. “Today I’m praying courage over my son.” */
  shareLineWithoutName: string;
}

export function composeBlessing(entry: CuratedEntry, person: PersonLike, translation: TranslationId = 'bsb'): ComposedBlessing {
  const topic = TOPIC_BY_ID[entry.topic];
  const heading = headingName(person);
  return {
    entry,
    topic,
    passage: getPassage(entry.ref, translation),
    reflection: entry.reflection,
    blessing: fillTemplate(entry.blessing, person),
    prayer: fillTemplate(entry.prayer, person),
    talk: pickTalk(entry, person),
    speakHeading: `Speak this over ${heading}`,
    shareLine: shareLine(topic, person),
    shareLineWithoutName: shareLine(topic, person, false),
  };
}

const SHARE_NOUNS: Partial<Record<string, string>> = {
  'self-control': 'self-control',
  'new-experiences': 'courage for new things',
  birthdays: 'a birthday blessing',
  exams: 'peace for a big test',
  school: 'a blessing for school',
  sports: 'joy in the game',
  sleep: 'peaceful sleep',
  travel: 'a safe journey',
  family: 'love in our home',
  siblings: 'love between siblings',
  teachers: 'good teachers',
  dating: 'wisdom in love',
  bullying: 'safety and courage',
  grief: 'comfort',
  health: 'strength and healing',
  failure: 'grace to begin again',
  rejection: 'belonging',
  loneliness: 'friendship and belonging',
  anxiety: 'peace',
  fear: 'courage',
  change: 'steady hearts',
  conflict: 'peace',
  temptation: 'wise choices',
  work: 'good work',
  love: 'faithful love',
};

const UNNAMED: Record<Relationship, string> = {
  son: 'my son',
  daughter: 'my daughter',
  child: 'my child',
  grandson: 'my grandson',
  granddaughter: 'my granddaughter',
  grandchild: 'my grandchild',
  husband: 'my husband',
  wife: 'my wife',
  spouse: 'my spouse',
  family: 'our family',
  mother: 'my mother',
  father: 'my father',
  parent: 'my parent',
  friend: 'my friend',
  other: 'someone I love',
};

function shareLine(topic: Topic, person: PersonLike, withName = true): string {
  const noun = SHARE_NOUNS[topic.id] ?? topic.title.toLowerCase();
  const who = relationshipKind(person) === 'family' ? 'our family' : withName ? person.name.trim() : UNNAMED[person.relationship];
  return `Today I’m praying ${noun} over ${who}.`;
}
