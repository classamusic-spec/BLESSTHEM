/**
 * Content safety for free text a parent types (search, notes, journal prompts).
 *
 * When someone describes self-harm, abuse, violence or a medical emergency, the app
 * must not simply answer with a Bible verse. We respond with compassion and point
 * to real help first; Scripture may follow, gently, as a complement — never a substitute.
 *
 * Detection is deliberately conservative and runs only on device. Nothing typed is
 * logged or sent anywhere.
 */

export type SafetyCategory = 'self-harm' | 'abuse' | 'violence' | 'medical' | 'mental-health';

export interface SafetyResult {
  category: SafetyCategory;
  urgent: boolean;
}

const PATTERNS: Array<[SafetyCategory, boolean, RegExp]> = [
  [
    'self-harm',
    true,
    /\b(suicid\w*|kill(ing)? (my|him|her|them)sel(f|ves)|end (my|his|her|their) (own )?life|take (my|his|her|their) (own )?life|wants? to die|want(s|ed)? to be dead|self[\s-]?harm\w*|cutting (my|him|her|them)sel(f|ves)|hurt(ing|s)? (my|him|her|them)sel(f|ves)|no reason to live)\b/i,
  ],
  [
    'abuse',
    true,
    /\b(abus(e|ed|ing|ive)|molest\w*|sexual(ly)? (abus\w*|assault\w*)|rape[ds]?|raping|groom(ed|ing)|touch(ed|es|ing) (him|her|them|me) inappropriately|inappropriate touch\w*)\b/i,
  ],
  [
    'violence',
    true,
    /\b(domestic violence|(hits|hitting|beats|beating|chokes|choking|punch(es|ing)) (me|him|her|them|my)|threaten(s|ed|ing)? to (kill|hurt)|afraid (he|she|they)('ll| will) hurt|not safe at home|unsafe at home|(gun|knife|weapon) (at|to) school)\b/i,
  ],
  [
    'medical',
    true,
    /\b(not breathing|stopped breathing|can'?t breathe|unconscious|unresponsive|overdos\w*|swallowed (pills|poison|chemicals)|poison(ed|ing)|seizure|chest pain|severe bleeding|choking|anaphyla\w*|allergic reaction)\b/i,
  ],
  [
    'mental-health',
    false,
    /\b(eating disorder|anorexi\w*|bulimi\w*|starving (him|her|them)sel(f|ves)|hearing voices|psychosis|deeply depressed|severe depression)\b/i,
  ],
];

export function checkSafety(text: string): SafetyResult | null {
  if (!text || text.trim().length < 3) return null;
  for (const [category, urgent, re] of PATTERNS) {
    if (re.test(text)) return { category, urgent };
  }
  return null;
}

export interface HelpResource {
  name: string;
  detail: string;
  /** tel:, sms: or https: link */
  href: string;
  action: string;
  categories: SafetyCategory[] | 'all';
}

/** United States resources. Shown with a note for readers elsewhere. */
export const HELP_RESOURCES: HelpResource[] = [
  { name: 'Emergency services', detail: 'If anyone is in immediate danger', href: 'tel:911', action: 'Call 911', categories: 'all' },
  { name: '988 Suicide & Crisis Lifeline', detail: 'Call or text, 24/7, free and confidential', href: 'tel:988', action: 'Call or text 988', categories: ['self-harm', 'mental-health', 'abuse', 'violence'] },
  { name: 'Crisis Text Line', detail: 'Text with a trained crisis counselor', href: 'sms:741741&body=HOME', action: 'Text HOME to 741741', categories: ['self-harm', 'mental-health'] },
  { name: 'Childhelp National Child Abuse Hotline', detail: 'For children, parents and concerned adults, 24/7', href: 'tel:18004224453', action: 'Call 1-800-422-4453', categories: ['abuse', 'violence'] },
  { name: 'National Domestic Violence Hotline', detail: 'Call, or text START to 88788', href: 'tel:18007997233', action: 'Call 1-800-799-7233', categories: ['violence', 'abuse'] },
  { name: 'Poison Control', detail: 'Free, expert help for poisonings and overdoses', href: 'tel:18002221222', action: 'Call 1-800-222-1222', categories: ['medical'] },
  { name: 'Outside the United States', detail: 'Find a free, local helpline', href: 'https://findahelpline.com', action: 'findahelpline.com', categories: 'all' },
];

export function resourcesFor(category: SafetyCategory): HelpResource[] {
  return HELP_RESOURCES.filter((r) => r.categories === 'all' || r.categories.includes(category));
}

export const SAFETY_COPY: Record<SafetyCategory, { title: string; body: string }> = {
  'self-harm': {
    title: 'You don’t have to carry this alone.',
    body: 'What you’ve shared sounds serious, and it matters. Please reach out to someone who can help right now. Prayer belongs here too — alongside real, immediate care.',
  },
  abuse: {
    title: 'Safety comes first.',
    body: 'If a child or anyone you love is being harmed, please contact people trained to help today. You are not overreacting by asking. God cares deeply about the vulnerable, and so do the people at these numbers.',
  },
  violence: {
    title: 'Your safety matters.',
    body: 'If you or someone you love is being threatened or hurt, please reach out for help now. You deserve to be safe, and there are people ready to listen.',
  },
  medical: {
    title: 'Please get help right away.',
    body: 'This sounds like it may be a medical emergency. Call emergency services first. When everyone is safe, we’ll be here to pray with you.',
  },
  'mental-health': {
    title: 'Hard seasons deserve real support.',
    body: 'Prayer and professional care belong together. A doctor, counselor or pastor can walk with you. If anyone is in danger, please call for help right away.',
  },
};
