/**
 * Content model for Bless Them's curated Scripture layer.
 *
 * Scripture text is NEVER written in content files. Entries reference passages
 * by canonical reference (USFM book code + chapter:verse) and the verified text
 * is resolved at build time from the public-domain source (see scripts/).
 */

export type AgeGroup = 'baby' | 'preschool' | 'elementary' | 'tween' | 'teen' | 'young-adult' | 'adult';

export const AGE_GROUPS: AgeGroup[] = ['baby', 'preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult'];

export type RelationshipKind = 'child' | 'grandchild' | 'spouse' | 'family' | 'parent' | 'friend' | 'other';

export type CategoryId = 'faith' | 'heart' | 'mind' | 'relationships' | 'uniquely-made' | 'hard-seasons' | 'future' | 'everyday';

export type TopicId =
  // Their Faith
  | 'faith' | 'trust' | 'prayer' | 'scripture' | 'faithfulness'
  // Their Heart
  | 'identity' | 'confidence' | 'kindness' | 'compassion' | 'forgiveness' | 'gratitude'
  | 'humility' | 'honesty' | 'self-control' | 'character' | 'temptation'
  // Their Mind
  | 'wisdom' | 'focus' | 'discernment' | 'learning' | 'peace'
  // Their Relationships
  | 'friendship' | 'siblings' | 'family' | 'teachers' | 'love' | 'dating' | 'conflict'
  // Uniquely Made (disability, autism and special needs)
  | 'wonderfully-made' | 'seen-and-understood' | 'healing' | 'caregiver-strength' | 'worry-and-future'
  // Hard Seasons
  | 'fear' | 'anxiety' | 'grief' | 'loneliness' | 'failure' | 'rejection' | 'change' | 'bullying' | 'health'
  // Their Future
  | 'purpose' | 'calling' | 'courage' | 'work' | 'responsibility' | 'leadership'
  // Everyday Life
  | 'school' | 'exams' | 'sports' | 'sleep' | 'protection' | 'travel' | 'new-experiences' | 'birthdays';

export type OccasionId =
  | 'birthday' | 'first-day-of-school' | 'new-school' | 'exam' | 'graduation' | 'drivers-test'
  | 'new-job' | 'sports-event' | 'moving' | 'travel' | 'surgery' | 'illness' | 'breakup'
  | 'friendship-trouble' | 'loss' | 'baptism' | 'wedding' | 'new-baby';

export interface TalkPrompts {
  /** Baby / preschool: a tender action or a short phrase to say together (≤ 16 words). */
  little?: string;
  /** Elementary / tween: one open question (≤ 20 words). */
  child: string;
  /** Teen / young adult: one open question (≤ 22 words). */
  teen: string;
  /** Adult (spouse, parent, friend): one open question or invitation (≤ 22 words). */
  adult: string;
}

export interface CuratedEntry {
  /** Stable id: `${topic}-${book}-${chapter}-${firstVerse}` in lowercase, e.g. "courage-jos-1-9". */
  id: string;
  topic: TopicId;
  /** Passage shown on the card, e.g. "JOS 1:9" or "PHP 4:6-7". 1–3 verses (max 4). */
  ref: string;
  /** Wider passage for "Read context"; must contain `ref`. Usually 4–12 verses. */
  contextRef: string;
  /** Who is speaking, to whom, and what is happening — so the verse is not misread. */
  contextNote: string;
  /** "Hold onto this" — for the one praying. 2–4 sentences. */
  reflection: string;
  /** "Speak this over {name}" — second person, written to be read aloud. */
  blessing: string;
  /** "Pray" — addressed to God. 40–100 words. Uses {name}, {them}, {their}. */
  prayer: string;
  talk: TalkPrompts;
  ages: AgeGroup[];
  /** Restrict to certain relationships; omit when suitable for anyone. */
  relationships?: RelationshipKind[];
  occasions?: OccasionId[];
  /** Search words a parent might type (lowercase). Never shown. */
  keywords: string[];
  /** Reviewer notes: interpretive guardrails. Never shown. */
  notes: string;
}
