import type { SceneId } from './scenery/scenes.ts';
import type { AgeGroup, RelationshipKind, TopicId } from './types.ts';

/**
 * Prayer journeys (Bless Them+): short, guided sequences built from the curated
 * library. Each day names a topic and a title; the engine resolves a passage that
 * suits the person and never repeats one within the journey.
 */

export interface JourneyDay {
  title: string;
  topic: TopicId;
}

export interface Journey {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  tone: 'sage' | 'gold' | 'blue' | 'rose' | 'sand' | 'night';
  /** The photograph that carries this journey (see scenery/sources.json for credits). */
  scene: SceneId;
  ages?: AgeGroup[];
  relationships?: RelationshipKind[];
  /** Open to everyone, not only Bless Them+. */
  free?: boolean;
  days: JourneyDay[];
}

const d = (title: string, topic: TopicId): JourneyDay => ({ title, topic });

export const JOURNEYS: Journey[] = [
  {
    // For families raising a child with a disability, autism or other special needs. Free,
    // like the Uniquely Made topics it draws on.
    id: 'uniquely-made-7',
    title: '7 Days, Uniquely Made',
    subtitle: 'For a child with special needs',
    description:
      'A week of blessings for a child with a disability, autism or other special needs: loved as they are, understood without words, and carried every day.',
    icon: 'FlowerTulip',
    tone: 'sage',
    scene: 'meadow-dawn',
    free: true,
    days: [
      d('Made with care', 'wonderfully-made'),
      d('Understood completely', 'seen-and-understood'),
      d('You belong here', 'wonderfully-made'),
      d('Gently held', 'seen-and-understood'),
      d('Asking for healing', 'healing'),
      d('Hope that holds', 'healing'),
      d('Carried, one day at a time', 'worry-and-future'),
    ],
  },
  {
    id: 'courage-7',
    title: '7 Days of Courage',
    subtitle: 'Strength for what feels big',
    description: 'A week of blessings for a child facing something hard — a new team, a hard conversation, a brave first step.',
    icon: 'Mountains',
    tone: 'sage',
    scene: 'mountain-sunrise',
    days: [
      d('You are not alone', 'courage'),
      d('When it feels too big', 'fear'),
      d('Quiet strength', 'confidence'),
      d('Held in his hands', 'trust'),
      d('Brave and kind', 'courage'),
      d('Peace in the storm', 'peace'),
      d('The next right step', 'courage'),
    ],
  },
  {
    id: 'bedtime-7',
    title: '7 Days of Peace Before Bed',
    subtitle: 'Hushed blessings for the end of the day',
    description: 'Short, tender blessings to speak at the bedside — for restless minds, the dark, and the comfort of being held.',
    icon: 'MoonStars',
    tone: 'night',
    scene: 'moonrise',
    days: [
      d('Lie down in peace', 'sleep'),
      d('The One who never sleeps', 'protection'),
      d('A quiet heart', 'peace'),
      d('Safe in the dark', 'sleep'),
      d('Rest for the weary', 'peace'),
      d('Watched over', 'sleep'),
      d('Morning will come', 'sleep'),
    ],
  },
  {
    id: 'school-7',
    title: '7 Days Before School Starts',
    subtitle: 'Courage, friends, and a calm first day',
    description: 'A blessing for each of the last seven days before a new school year.',
    icon: 'Backpack',
    tone: 'gold',
    scene: 'autumn-trail',
    ages: ['preschool', 'elementary', 'tween', 'teen'],
    days: [
      d('A new beginning', 'new-experiences'),
      d('Brave for the first day', 'courage'),
      d('A good friend', 'friendship'),
      d('A love for learning', 'learning'),
      d('Good teachers', 'teachers'),
      d('A calm mind', 'peace'),
      d('Sent out with a blessing', 'school'),
    ],
  },
  {
    id: 'struggling-7',
    title: '7 Days for a Child Who Is Struggling',
    subtitle: 'When they are having a hard time',
    description: 'For seasons when something is heavy — friendships, school, worries, or a hurt they can’t yet name.',
    icon: 'Lighthouse',
    tone: 'blue',
    scene: 'lighthouse',
    ages: ['elementary', 'tween', 'teen', 'young-adult'],
    days: [
      d('You are seen', 'identity'),
      d('Worries carried', 'anxiety'),
      d('Never alone', 'loneliness'),
      d('Grace for hard days', 'failure'),
      d('Held steady', 'trust'),
      d('Peace that guards', 'peace'),
      d('Loved, right now', 'faith'),
    ],
  },
  {
    id: 'friendship-14',
    title: '14 Days of Friendship',
    subtitle: 'Good friends, and the grace to be one',
    description: 'Two weeks of blessings for belonging, kindness, forgiveness and wise friendships.',
    icon: 'UsersThree',
    tone: 'rose',
    scene: 'wildflower-hillside',
    ages: ['elementary', 'tween', 'teen', 'young-adult'],
    days: [
      d('A faithful friend', 'friendship'),
      d('Kind words', 'kindness'),
      d('Seen and included', 'loneliness'),
      d('A loyal heart', 'friendship'),
      d('Eyes that notice', 'compassion'),
      d('Grace to forgive', 'forgiveness'),
      d('Making peace', 'conflict'),
      d('When you’re left out', 'rejection'),
      d('Friends who sharpen', 'friendship'),
      d('Gentle and generous', 'kindness'),
      d('Choosing well', 'discernment'),
      d('Thankful for friends', 'gratitude'),
      d('Love one another', 'friendship'),
      d('Loved no matter what', 'identity'),
    ],
  },
  {
    id: 'wisdom-21',
    title: '21 Days of Wisdom',
    subtitle: 'Good judgment, and the humility to ask',
    description: 'Three weeks of blessings for wise hearts, clear minds and steady character.',
    icon: 'Compass',
    tone: 'sand',
    scene: 'forest-river',
    ages: ['elementary', 'tween', 'teen', 'young-adult', 'adult'],
    days: [
      d('Ask for wisdom', 'wisdom'),
      d('A teachable heart', 'learning'),
      d('Seeing clearly', 'discernment'),
      d('A lamp for the path', 'scripture'),
      d('Choosing what is right', 'character'),
      d('Slow to anger', 'self-control'),
      d('Wisdom from above', 'wisdom'),
      d('Humble and wise', 'humility'),
      d('A steady mind', 'focus'),
      d('Growing in wisdom', 'learning'),
      d('Walking with the wise', 'wisdom'),
      d('Hidden in the heart', 'scripture'),
      d('Integrity', 'character'),
      d('Testing what is good', 'discernment'),
      d('The beginning of wisdom', 'wisdom'),
      d('Calm in the moment', 'self-control'),
      d('Learning from correction', 'learning'),
      d('Trust over understanding', 'trust'),
      d('Honest words', 'honesty'),
      d('Serving others', 'humility'),
      d('A life built well', 'wisdom'),
    ],
  },
  {
    id: 'teen-30',
    title: '30 Days of Blessing Your Teen',
    subtitle: 'A month of words for the years in between',
    description: 'Thirty days of blessings for identity, choices, friendships, faith and the future — spoken with respect.',
    icon: 'Path',
    tone: 'sage',
    scene: 'canyon-trail',
    ages: ['teen', 'young-adult'],
    days: [
      d('Who you are', 'identity'),
      d('Made with purpose', 'purpose'),
      d('Courage to stand', 'courage'),
      d('Choosing well', 'discernment'),
      d('Strength in temptation', 'temptation'),
      d('Good friends', 'friendship'),
      d('A faith of your own', 'faith'),
      d('Wisdom for decisions', 'wisdom'),
      d('Self-control', 'self-control'),
      d('Truthful words', 'honesty'),
      d('When you fall short', 'failure'),
      d('Worries carried', 'anxiety'),
      d('Peace in your mind', 'peace'),
      d('Matters of the heart', 'dating'),
      d('Listening for your calling', 'calling'),
      d('Good work', 'work'),
      d('Leading by serving', 'leadership'),
      d('Trustworthy', 'responsibility'),
      d('Quiet confidence', 'confidence'),
      d('Thankfulness', 'gratitude'),
      d('Kindness that costs something', 'kindness'),
      d('Forgiven and forgiving', 'forgiveness'),
      d('Trusting God with tomorrow', 'trust'),
      d('A praying life', 'prayer'),
      d('Rooted in the Word', 'scripture'),
      d('Steady faithfulness', 'faithfulness'),
      d('Seasons of change', 'change'),
      d('Home', 'family'),
      d('Character', 'character'),
      d('Sent out with a blessing', 'protection'),
    ],
  },
  {
    id: 'adult-child-14',
    title: 'Blessing Your Adult Child',
    subtitle: 'Fourteen days of letting go and holding on',
    description: 'For grown children building lives of their own — their work, love, faith and future.',
    icon: 'Signpost',
    tone: 'gold',
    scene: 'lake-sunrise',
    ages: ['young-adult', 'adult'],
    relationships: ['child', 'grandchild'],
    days: [
      d('Known and loved', 'identity'),
      d('Their calling', 'calling'),
      d('Good work', 'work'),
      d('Wisdom for choices', 'wisdom'),
      d('Faith that is theirs', 'faith'),
      d('Peace in busy days', 'peace'),
      d('Through change', 'change'),
      d('Faithful love', 'love'),
      d('Trust for tomorrow', 'trust'),
      d('Safe going out', 'protection'),
      d('Health and strength', 'health'),
      d('Thankful hearts', 'gratitude'),
      d('Steady faithfulness', 'faithfulness'),
      d('Purpose', 'purpose'),
    ],
  },
  {
    id: 'marriage-14',
    title: 'Blessing Your Marriage',
    subtitle: 'Two weeks of prayer for the one you love',
    description: 'Blessings to speak over your spouse — patient love, forgiveness, shared faith and a peaceful home.',
    icon: 'HeartStraight',
    tone: 'rose',
    scene: 'swans',
    relationships: ['spouse'],
    days: [
      d('Patient, kind love', 'love'),
      d('Gratitude for you', 'gratitude'),
      d('Grace for each other', 'forgiveness'),
      d('A peaceful home', 'family'),
      d('Strength for your work', 'work'),
      d('Making peace', 'conflict'),
      d('A cord of three strands', 'love'),
      d('Rest for the weary', 'peace'),
      d('Health and strength', 'health'),
      d('Faith together', 'faith'),
      d('Kindness every day', 'kindness'),
      d('Faithfulness', 'faithfulness'),
      d('Wisdom for decisions', 'wisdom'),
      d('Love that lasts', 'love'),
    ],
  },
];

export const JOURNEY_BY_ID: Record<string, Journey> = Object.fromEntries(JOURNEYS.map((j) => [j.id, j]));

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  topics: TopicId[];
  /** Inclusive MM-DD window when the collection is featured. */
  from: string;
  to: string;
  tone: Journey['tone'];
  icon: string;
  scene: SceneId;
}

export const COLLECTIONS: Collection[] = [
  { id: 'back-to-school', title: 'Back to School', subtitle: 'Courage, friends and focus for a new year', topics: ['school', 'courage', 'new-experiences', 'friendship', 'teachers', 'focus'], from: '08-01', to: '10-15', tone: 'gold', icon: 'Backpack', scene: 'golden-trees' },
  { id: 'thanksgiving', title: 'A Grateful Season', subtitle: 'Blessings of thankfulness', topics: ['gratitude', 'family', 'faithfulness'], from: '10-16', to: '11-30', tone: 'sand', icon: 'FlowerTulip', scene: 'misty-hayfield' },
  { id: 'advent', title: 'Advent', subtitle: 'Waiting, hope and the gift of peace', topics: ['peace', 'faith', 'gratitude', 'trust'], from: '12-01', to: '12-25', tone: 'night', icon: 'Star', scene: 'snowy-pine' },
  { id: 'new-year', title: 'A New Year', subtitle: 'Purpose and steady faithfulness', topics: ['purpose', 'change', 'faithfulness', 'wisdom'], from: '12-26', to: '01-31', tone: 'blue', icon: 'Sparkle', scene: 'snow-sunrise' },
  { id: 'easter', title: 'Lent & Easter', subtitle: 'Grace, forgiveness and new life', topics: ['forgiveness', 'faith', 'trust', 'humility'], from: '02-15', to: '04-30', tone: 'sage', icon: 'Butterfly', scene: 'spring-blossoms' },
  { id: 'summer', title: 'Summer Days', subtitle: 'Adventures, rest and safe travels', topics: ['travel', 'new-experiences', 'peace', 'friendship'], from: '06-01', to: '07-31', tone: 'gold', icon: 'Sun', scene: 'lake-dock' },
];

/** The collection in season on a given MM-DD, if any (windows may wrap the new year). */
export function collectionInSeason(monthDay: string): Collection | undefined {
  return COLLECTIONS.find((c) => (c.from <= c.to ? monthDay >= c.from && monthDay <= c.to : monthDay >= c.from || monthDay <= c.to));
}
