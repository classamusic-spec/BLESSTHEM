import type { AgeGroup, CategoryId, OccasionId, RelationshipKind, TopicId } from './types.ts';

/**
 * The single source of truth for how Bless Them organises prayer topics.
 * Icons are Phosphor icon names, resolved to components in the UI layer so
 * content stays framework-free (and readable by the Node build scripts).
 */

export interface Category {
  id: CategoryId;
  title: string;
  subtitle: string;
  icon: string;
}

export interface Topic {
  id: TopicId;
  title: string;
  category: CategoryId;
  /** One warm line shown on the topic page. */
  description: string;
  icon: string;
  ages: AgeGroup[];
  relationships?: RelationshipKind[];
  /** Included in the free library. Daily blessings may use any topic. */
  free: boolean;
  /** Related topics the engine may borrow from for variety. */
  related: TopicId[];
}

const ALL: AgeGroup[] = ['baby', 'preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult'];
const FROM_PRESCHOOL: AgeGroup[] = ['preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult'];
const FROM_ELEMENTARY: AgeGroup[] = ['elementary', 'tween', 'teen', 'young-adult', 'adult'];
const FROM_TWEEN: AgeGroup[] = ['tween', 'teen', 'young-adult', 'adult'];
const FROM_TEEN: AgeGroup[] = ['teen', 'young-adult', 'adult'];

export const CATEGORIES: Category[] = [
  { id: 'faith', title: 'Their Faith', subtitle: 'Knowing and trusting God', icon: 'SunHorizon' },
  { id: 'heart', title: 'Their Heart', subtitle: 'Character that grows from within', icon: 'HeartStraight' },
  { id: 'mind', title: 'Their Mind', subtitle: 'Wisdom, focus, and peace', icon: 'Compass' },
  { id: 'relationships', title: 'Their Relationships', subtitle: 'Friends, family, and love', icon: 'UsersThree' },
  { id: 'hard-seasons', title: 'Hard Seasons', subtitle: 'When life feels heavy', icon: 'Lighthouse' },
  { id: 'future', title: 'Their Future', subtitle: 'Purpose, calling, and courage', icon: 'Mountains' },
  { id: 'everyday', title: 'Everyday Life', subtitle: 'School, sleep, and new adventures', icon: 'Backpack' },
];

export const TOPICS: Topic[] = [
  // ── Their Faith ────────────────────────────────────────────────
  { id: 'faith', title: 'Faith', category: 'faith', icon: 'SunHorizon', free: true, ages: ALL,
    description: 'That they would know God’s love for themselves.', related: ['trust', 'prayer', 'identity'] },
  { id: 'trust', title: 'Trust', category: 'faith', icon: 'Anchor', free: true, ages: ALL,
    description: 'Leaning on God when the way isn’t clear.', related: ['faith', 'anxiety', 'peace'] },
  { id: 'prayer', title: 'Prayer', category: 'faith', icon: 'Feather', free: true, ages: ALL,
    description: 'A heart that talks with God, and listens.', related: ['faith', 'scripture', 'peace'] },
  { id: 'scripture', title: 'Scripture', category: 'faith', icon: 'BookOpen', free: false, ages: ALL,
    description: 'A growing love for God’s Word.', related: ['wisdom', 'faith', 'learning'] },
  { id: 'faithfulness', title: 'Faithfulness', category: 'faith', icon: 'Tree', free: false, ages: FROM_ELEMENTARY,
    description: 'Steady faith, one ordinary day at a time.', related: ['character', 'trust', 'responsibility'] },

  // ── Their Heart ────────────────────────────────────────────────
  { id: 'identity', title: 'Identity', category: 'heart', icon: 'Fingerprint', free: true, ages: ALL,
    description: 'Knowing who they are, and whose they are.', related: ['confidence', 'rejection', 'faith'] },
  { id: 'confidence', title: 'Confidence', category: 'heart', icon: 'StarFour', free: false, ages: FROM_PRESCHOOL,
    description: 'Quiet strength that doesn’t depend on applause.', related: ['identity', 'courage', 'failure'] },
  { id: 'kindness', title: 'Kindness', category: 'heart', icon: 'HandHeart', free: true, ages: ALL,
    description: 'Gentle words and generous hands.', related: ['compassion', 'friendship', 'siblings'] },
  { id: 'compassion', title: 'Compassion', category: 'heart', icon: 'Heart', free: false, ages: FROM_PRESCHOOL,
    description: 'Eyes that notice and hearts that help.', related: ['kindness', 'humility', 'friendship'] },
  { id: 'forgiveness', title: 'Forgiveness', category: 'heart', icon: 'Butterfly', free: true, ages: FROM_PRESCHOOL,
    description: 'Grace received, and grace given.', related: ['conflict', 'siblings', 'failure'] },
  { id: 'gratitude', title: 'Gratitude', category: 'heart', icon: 'FlowerTulip', free: true, ages: ALL,
    description: 'Noticing good gifts, big and small.', related: ['faith', 'birthdays', 'peace'] },
  { id: 'humility', title: 'Humility', category: 'heart', icon: 'Leaf', free: false, ages: FROM_ELEMENTARY,
    description: 'Secure enough to serve, and to listen.', related: ['character', 'leadership', 'compassion'] },
  { id: 'honesty', title: 'Honesty', category: 'heart', icon: 'Sun', free: false, ages: FROM_PRESCHOOL,
    description: 'Truth spoken with love.', related: ['character', 'temptation', 'self-control'] },
  { id: 'self-control', title: 'Self-control', category: 'heart', icon: 'Hourglass', free: false, ages: FROM_PRESCHOOL,
    description: 'Calm choices in heated moments.', related: ['character', 'temptation', 'peace'] },
  { id: 'character', title: 'Character', category: 'heart', icon: 'TreeEvergreen', free: false, ages: FROM_ELEMENTARY,
    description: 'Doing what is right, even when no one is watching.', related: ['honesty', 'self-control', 'faithfulness'] },
  { id: 'temptation', title: 'Temptation', category: 'heart', icon: 'Path', free: false, ages: FROM_TWEEN,
    description: 'Strength to choose the better way.', related: ['self-control', 'discernment', 'character'] },

  // ── Their Mind ─────────────────────────────────────────────────
  { id: 'wisdom', title: 'Wisdom', category: 'mind', icon: 'Compass', free: true, ages: ALL,
    description: 'Good judgment, and the humility to ask for it.', related: ['discernment', 'learning', 'scripture'] },
  { id: 'focus', title: 'Focus', category: 'mind', icon: 'Target', free: false, ages: FROM_ELEMENTARY,
    description: 'A steady mind in a distracted world.', related: ['learning', 'exams', 'school'] },
  { id: 'discernment', title: 'Discernment', category: 'mind', icon: 'Eye', free: false, ages: FROM_TWEEN,
    description: 'Seeing clearly what is true and good.', related: ['wisdom', 'temptation', 'friendship'] },
  { id: 'learning', title: 'Learning', category: 'mind', icon: 'Notebook', free: false, ages: ALL,
    description: 'Curiosity, patience, and joy in growing.', related: ['school', 'wisdom', 'focus'] },
  { id: 'peace', title: 'Peace', category: 'mind', icon: 'Waves', free: true, ages: ALL,
    description: 'A settled heart that rests in God.', related: ['anxiety', 'sleep', 'trust'] },

  // ── Their Relationships ────────────────────────────────────────
  { id: 'friendship', title: 'Friendship', category: 'relationships', icon: 'UsersThree', free: true, ages: FROM_PRESCHOOL,
    description: 'Good friends, and the grace to be one.', related: ['kindness', 'loneliness', 'rejection'] },
  { id: 'siblings', title: 'Siblings', category: 'relationships', icon: 'Users', free: false,
    ages: ['preschool', 'elementary', 'tween', 'teen', 'young-adult'], relationships: ['child', 'grandchild'],
    description: 'Brothers and sisters learning to love well.', related: ['family', 'conflict', 'forgiveness'] },
  { id: 'family', title: 'Family', category: 'relationships', icon: 'HouseLine', free: true, ages: ALL,
    description: 'A home where love is learned and lived.', related: ['siblings', 'conflict', 'gratitude'] },
  { id: 'teachers', title: 'Teachers', category: 'relationships', icon: 'ChalkboardTeacher', free: false,
    ages: ['preschool', 'elementary', 'tween', 'teen'], relationships: ['child', 'grandchild', 'other'],
    description: 'Respect, and good guides for the journey.', related: ['school', 'learning', 'humility'] },
  { id: 'love', title: 'Love', category: 'relationships', icon: 'HeartStraight', free: false, ages: ['young-adult', 'adult'],
    description: 'Patient, faithful love that lasts.', related: ['family', 'forgiveness', 'gratitude'] },
  { id: 'dating', title: 'Dating', category: 'relationships', icon: 'Flower', free: false, ages: ['teen', 'young-adult'],
    relationships: ['child', 'grandchild', 'friend', 'other'],
    description: 'Wisdom and worth in matters of the heart.', related: ['identity', 'discernment', 'self-control'] },
  { id: 'conflict', title: 'Conflict', category: 'relationships', icon: 'Handshake', free: false, ages: FROM_PRESCHOOL,
    description: 'Peacemaking when relationships are strained.', related: ['forgiveness', 'self-control', 'family'] },

  // ── Hard Seasons ───────────────────────────────────────────────
  { id: 'fear', title: 'Fear', category: 'hard-seasons', icon: 'Lighthouse', free: true, ages: ALL,
    description: 'When something feels too big, God is near.', related: ['courage', 'anxiety', 'protection'] },
  { id: 'anxiety', title: 'Anxiety', category: 'hard-seasons', icon: 'CloudSun', free: false, ages: FROM_ELEMENTARY,
    description: 'Carrying worries to the One who cares.', related: ['peace', 'fear', 'trust'] },
  { id: 'grief', title: 'Grief', category: 'hard-seasons', icon: 'Drop', free: false, ages: FROM_PRESCHOOL,
    description: 'Comfort for hearts that are hurting.', related: ['peace', 'loneliness', 'trust'] },
  { id: 'loneliness', title: 'Loneliness', category: 'hard-seasons', icon: 'Moon', free: false, ages: FROM_ELEMENTARY,
    description: 'Never truly alone, even on quiet days.', related: ['friendship', 'identity', 'rejection'] },
  { id: 'failure', title: 'Failure', category: 'hard-seasons', icon: 'Plant', free: false, ages: FROM_ELEMENTARY,
    description: 'Grace to get back up and try again.', related: ['confidence', 'identity', 'forgiveness'] },
  { id: 'rejection', title: 'Rejection', category: 'hard-seasons', icon: 'DoorOpen', free: false, ages: FROM_ELEMENTARY,
    description: 'Fully loved, even when left out.', related: ['identity', 'loneliness', 'friendship'] },
  { id: 'change', title: 'Change', category: 'hard-seasons', icon: 'Wind', free: false, ages: ALL,
    description: 'Steady ground when everything is moving.', related: ['new-experiences', 'trust', 'fear'] },
  { id: 'bullying', title: 'Bullying', category: 'hard-seasons', icon: 'Shield', free: false,
    ages: ['elementary', 'tween', 'teen'], relationships: ['child', 'grandchild', 'other'],
    description: 'Safety, worth, and wise help when others are unkind.', related: ['identity', 'rejection', 'courage'] },
  { id: 'health', title: 'Health', category: 'hard-seasons', icon: 'Heartbeat', free: false, ages: ALL,
    description: 'Strength and comfort for body and mind.', related: ['peace', 'fear', 'trust'] },

  // ── Their Future ───────────────────────────────────────────────
  { id: 'purpose', title: 'Purpose', category: 'future', icon: 'MapTrifold', free: false, ages: FROM_ELEMENTARY,
    description: 'A life that matters, held in God’s hands.', related: ['calling', 'identity', 'work'] },
  { id: 'calling', title: 'Calling', category: 'future', icon: 'Signpost', free: false, ages: FROM_TEEN,
    description: 'Listening for how God may lead.', related: ['purpose', 'wisdom', 'work'] },
  { id: 'courage', title: 'Courage', category: 'future', icon: 'Mountains', free: true, ages: ALL,
    description: 'Strength to do what is right when it is hard.', related: ['fear', 'confidence', 'leadership'] },
  { id: 'work', title: 'Work', category: 'future', icon: 'Briefcase', free: false, ages: FROM_TEEN,
    description: 'Good work, done with a good heart.', related: ['purpose', 'responsibility', 'calling'] },
  { id: 'responsibility', title: 'Responsibility', category: 'future', icon: 'Key', free: false, ages: FROM_ELEMENTARY,
    description: 'Trustworthy in little things and big ones.', related: ['character', 'faithfulness', 'work'] },
  { id: 'leadership', title: 'Leadership', category: 'future', icon: 'Flag', free: false, ages: FROM_ELEMENTARY,
    description: 'Leading others by serving them well.', related: ['humility', 'courage', 'character'] },

  // ── Everyday Life ──────────────────────────────────────────────
  { id: 'school', title: 'School', category: 'everyday', icon: 'Backpack', free: true,
    ages: ['preschool', 'elementary', 'tween', 'teen', 'young-adult'],
    description: 'Learning, friendships, and courage for the day.', related: ['learning', 'friendship', 'focus'] },
  { id: 'exams', title: 'Exams', category: 'everyday', icon: 'Exam', free: false,
    ages: ['elementary', 'tween', 'teen', 'young-adult'],
    description: 'A calm mind and honest effort.', related: ['focus', 'anxiety', 'school'] },
  { id: 'sports', title: 'Sports', category: 'everyday', icon: 'PersonSimpleRun', free: false, ages: FROM_PRESCHOOL,
    description: 'Joy in the game, and character in the competition.', related: ['character', 'courage', 'humility'] },
  { id: 'sleep', title: 'Sleep', category: 'everyday', icon: 'MoonStars', free: true, ages: ALL,
    description: 'Rest that comes from a quiet heart.', related: ['peace', 'fear', 'protection'] },
  { id: 'protection', title: 'Protection', category: 'everyday', icon: 'ShieldCheck', free: true, ages: ALL,
    description: 'Held in God’s care, wherever they go.', related: ['fear', 'travel', 'peace'] },
  { id: 'travel', title: 'Travel', category: 'everyday', icon: 'SuitcaseRolling', free: false, ages: ALL,
    description: 'Going out and coming in, in God’s care.', related: ['protection', 'change', 'peace'] },
  { id: 'new-experiences', title: 'New experiences', category: 'everyday', icon: 'Sparkle', free: false, ages: ALL,
    description: 'Brave first steps into new places.', related: ['courage', 'change', 'fear'] },
  { id: 'birthdays', title: 'Birthdays', category: 'everyday', icon: 'Cake', free: false, ages: ALL,
    description: 'Celebrating another year of God’s goodness.', related: ['gratitude', 'identity', 'purpose'] },
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, Topic>;
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

/** Onboarding / “What are you praying about?” choices. Filtered by age at runtime. */
export interface FocusChoice {
  label: string;
  topics: TopicId[];
}

export const FOCUS_CHOICES: FocusChoice[] = [
  { label: 'Faith', topics: ['faith'] },
  { label: 'Wisdom', topics: ['wisdom'] },
  { label: 'Friendships', topics: ['friendship'] },
  { label: 'Confidence', topics: ['confidence'] },
  { label: 'Fear', topics: ['fear'] },
  { label: 'School', topics: ['school'] },
  { label: 'Health', topics: ['health'] },
  { label: 'Character', topics: ['character'] },
  { label: 'Kindness', topics: ['kindness'] },
  { label: 'Self-control', topics: ['self-control'] },
  { label: 'Identity', topics: ['identity'] },
  { label: 'Courage', topics: ['courage'] },
  { label: 'Protection', topics: ['protection'] },
  { label: 'Purpose', topics: ['purpose'] },
  { label: 'Gratitude', topics: ['gratitude'] },
  { label: 'Forgiveness', topics: ['forgiveness'] },
  { label: 'Sleep & peace', topics: ['sleep', 'peace'] },
  { label: 'Family', topics: ['family'] },
  { label: 'Trust', topics: ['trust'] },
  { label: 'Anxiety', topics: ['anxiety'] },
  { label: 'Work', topics: ['work'] },
  { label: 'Marriage & love', topics: ['love'] },
];

export interface Occasion {
  id: OccasionId;
  label: string;
  icon: string;
  topics: TopicId[];
  /** Eyebrow shown on the blessing card, e.g. "For the first day of school". */
  eyebrow: string;
  /** Notification title the day before. `{name}` is replaced. */
  noticeTitle: string;
  /** Notification body the day before. */
  noticeBody: string;
  /** Repeats every year on the same date (e.g. birthdays). */
  yearly?: boolean;
  /** Free users can save dates; occasion-aware blessings are part of Bless Them+. */
}

export const OCCASIONS: Occasion[] = [
  { id: 'birthday', label: 'Birthday', icon: 'Cake', topics: ['birthdays', 'gratitude', 'identity'], yearly: true,
    eyebrow: 'For a birthday', noticeTitle: '{name}’s birthday is tomorrow',
    noticeBody: 'Would you like a blessing to celebrate another year?' },
  { id: 'first-day-of-school', label: 'First day of school', icon: 'Backpack', topics: ['school', 'courage', 'new-experiences'],
    eyebrow: 'For the first day of school', noticeTitle: 'First day of school tomorrow',
    noticeBody: 'Would you like a blessing for courage and wisdom?' },
  { id: 'new-school', label: 'New school', icon: 'DoorOpen', topics: ['change', 'friendship', 'school'],
    eyebrow: 'For a new school', noticeTitle: 'A new school is almost here',
    noticeBody: 'Would you like a blessing for new friends and steady courage?' },
  { id: 'exam', label: 'Big test', icon: 'Exam', topics: ['exams', 'focus', 'peace'],
    eyebrow: 'Before a big test', noticeTitle: '{name} has a big test tomorrow',
    noticeBody: 'Would you like a blessing for a calm, clear mind?' },
  { id: 'graduation', label: 'Graduation', icon: 'Flag', topics: ['purpose', 'calling', 'gratitude'],
    eyebrow: 'For graduation', noticeTitle: 'Graduation is tomorrow',
    noticeBody: 'Would you like a blessing for the road ahead?' },
  { id: 'drivers-test', label: 'Driver’s test', icon: 'Path', topics: ['focus', 'courage', 'protection'],
    eyebrow: 'Before a driver’s test', noticeTitle: 'Driver’s test tomorrow',
    noticeBody: 'Would you like a blessing for calm focus and safety?' },
  { id: 'new-job', label: 'New job', icon: 'Briefcase', topics: ['work', 'courage', 'purpose'],
    eyebrow: 'For a new job', noticeTitle: 'A new job starts tomorrow',
    noticeBody: 'Would you like a blessing for good work and a steady heart?' },
  { id: 'sports-event', label: 'Big game', icon: 'PersonSimpleRun', topics: ['sports', 'courage', 'character'],
    eyebrow: 'Before the big game', noticeTitle: 'Big game tomorrow',
    noticeBody: 'Would you like a blessing for joy and good character?' },
  { id: 'moving', label: 'Moving', icon: 'HouseLine', topics: ['change', 'new-experiences', 'family'],
    eyebrow: 'For a move', noticeTitle: 'Moving day is close',
    noticeBody: 'Would you like a blessing for steady ground in a new place?' },
  { id: 'travel', label: 'Travel', icon: 'SuitcaseRolling', topics: ['travel', 'protection', 'peace'],
    eyebrow: 'For the journey', noticeTitle: 'A trip begins tomorrow',
    noticeBody: 'Would you like a blessing for the journey?' },
  { id: 'surgery', label: 'Surgery', icon: 'Heartbeat', topics: ['health', 'peace', 'fear'],
    eyebrow: 'Before surgery', noticeTitle: 'Surgery is tomorrow',
    noticeBody: 'Would you like to pray for peace and skilled hands?' },
  { id: 'illness', label: 'Illness', icon: 'Heartbeat', topics: ['health', 'peace', 'trust'],
    eyebrow: 'In a season of illness', noticeTitle: 'Praying through illness',
    noticeBody: 'Would you like a blessing for comfort and strength today?' },
  { id: 'breakup', label: 'Breakup', icon: 'HeartBreak', topics: ['rejection', 'identity', 'dating'],
    eyebrow: 'After a breakup', noticeTitle: 'A tender season',
    noticeBody: 'Would you like a blessing for a hurting heart?' },
  { id: 'friendship-trouble', label: 'Friendship trouble', icon: 'UsersThree', topics: ['friendship', 'rejection', 'conflict'],
    eyebrow: 'When friendships are hard', noticeTitle: 'Friendships feel hard right now',
    noticeBody: 'Would you like a blessing for belonging and wisdom?' },
  { id: 'loss', label: 'Loss', icon: 'Drop', topics: ['grief', 'peace', 'trust'],
    eyebrow: 'In a season of grief', noticeTitle: 'Carrying grief together',
    noticeBody: 'Would you like a blessing of comfort today?' },
  { id: 'baptism', label: 'Baptism', icon: 'Drop', topics: ['faith', 'faithfulness', 'identity'],
    eyebrow: 'For a baptism', noticeTitle: 'A baptism tomorrow',
    noticeBody: 'Would you like a blessing for this beautiful step of faith?' },
  { id: 'wedding', label: 'Wedding', icon: 'HeartStraight', topics: ['love', 'family', 'gratitude'], yearly: false,
    eyebrow: 'For a wedding', noticeTitle: 'A wedding tomorrow',
    noticeBody: 'Would you like a blessing for a lifetime of love?' },
  { id: 'new-baby', label: 'New baby', icon: 'BabyCarriage', topics: ['gratitude', 'protection', 'family'],
    eyebrow: 'For a new baby', noticeTitle: 'Welcoming a new little one',
    noticeBody: 'Would you like a blessing for this new life?' },
];

export const OCCASION_BY_ID = Object.fromEntries(OCCASIONS.map((o) => [o.id, o])) as Record<OccasionId, Occasion>;

export const AGE_LABELS: Record<AgeGroup, string> = {
  baby: 'Baby',
  preschool: 'Preschool',
  elementary: 'Elementary',
  tween: 'Tween',
  teen: 'Teen',
  'young-adult': 'Young adult',
  adult: 'Adult',
};

export const AGE_HINTS: Record<AgeGroup, string> = {
  baby: '0–2',
  preschool: '3–5',
  elementary: '6–9',
  tween: '10–12',
  teen: '13–17',
  'young-adult': '18–25',
  adult: '26+',
};
