# Bless Them — Content Guide

Bless Them helps a parent (or grandparent, spouse, caregiver) speak Scripture over someone they love in under two minutes. Every curated entry is one complete moment:

**Person → Need → Scripture → Blessing → Prayer → Done**

This guide is the standard every entry in `src/content/blessings/` must meet. The linter (`node scripts/lint-content.mjs`) enforces the mechanical rules; this document explains the spirit behind them.

---

## 1. The non-negotiables

1. **Scripture is never typed by hand.** Entries reference passages (`ref`, `contextRef`). The verified text is pulled at build time from the public-domain Berean Standard Bible (default) and World English Bible. Use `npm run verse -- "PHP 4:6-7"` (add `web` for the WEB) to read the text before you write.
2. **Theological humility.** We never speak *for* God. We say what a passage *reminds us*, what we *might pray*, what we *hope*. We never claim revelation, predict the future, or promise specific outcomes.
3. **Context first.** Every verse is read in its setting. If a promise was spoken to a specific person or nation (Joshua, the exiles in Jeremiah 29), say so in `contextNote` and apply it *by principle*, not as a personal guarantee.
4. **No guilt, no hype.** No shame, no fear-based motivation, no prosperity framing, no gamified language. Calm, warm, reverent, human.

## 2. Voice

Imagine a parent sitting on the edge of a child's bed at 7:10 on a school morning. They have ninety seconds. They read the verse, then speak the blessing aloud, then pray.

- **Warm, short, human.** Plain words. Short sentences that sound good aloud.
- **Reverent, not religious-sounding.** Avoid church jargon ("traveling mercies", "hedge of protection", "quiet time", "fellowship", "sanctification"). Say what you mean.
- **Calm.** No exclamation marks. No hype.
- **Specific and concrete** where it helps: "when your heart beats fast", "in the hallway", "at the lunch table", "at the end of a long day".
- **Typography:** curly apostrophes and quotes (’ “ ”), em dashes (—) without spaces around them in prose is fine either way, but never a spaced hyphen ( - ).

## 3. Fields and budgets

| Field | Shown as | Budget | Notes |
|---|---|---|---|
| `ref` | The Scripture on the card | 1–3 verses (max 4) | Must exist in both BSB and WEB. |
| `contextRef` | “Read context” | Usually 4–12 verses, < 20 | Same book; must contain `ref`. |
| `contextNote` | Under the context passage | 15–80 words | Who is speaking, to whom, what is happening, and how it applies today. |
| `reflection` | **Hold onto this** | 2–4 sentences, ~30–80 words | For the one praying. Explain the principle simply and faithfully. No mini-sermons. |
| `blessing` | **Speak this over {name}** | ~45–90 words | Second person (“May you…”). Written to be read aloud. 2–4 sentences. |
| `prayer` | **Pray** | 40–100 words | Addressed to God. Names the person with `{name}`. Ends with “Amen.” |
| `talk.little` | **Talk about it** (baby/preschool) | ≤ 16 words | A tender action or a phrase to say together. Required if ages include baby/preschool. |
| `talk.child` | (elementary/tween) | ≤ 20 words | One open question. |
| `talk.teen` | (teen/young adult) | ≤ 22 words | One open, respectful question. Never an interrogation. |
| `talk.adult` | (spouse, parent, friend) | ≤ 22 words | An invitation, often “How can I pray for you?” |
| `ages` | — | | Only the ages this entry truly suits. |
| `relationships` | — | optional | Restrict only when needed (e.g. siblings → child, grandchild). |
| `occasions` | — | optional | Special moments this entry fits (e.g. `first-day-of-school`). |
| `keywords` | — | 4–10, lowercase | Words a worried parent might actually type: “scared”, “mean kids”, “can’t sleep”. |
| `notes` | — | 1–2 sentences | Reviewer guardrails: what this passage does *not* mean. Never shown, and stripped from production builds. |

**Ids** are `${topic}-${book}-${chapter}-${firstVerse}` in lowercase: `courage-jos-1-9`, `anxiety-php-4-6`.

## 4. Template tokens

The app fills these in. Only these tokens are allowed:

| Token | Becomes |
|---|---|
| `{name}` / `{Name}` | “Gabriel” — or “our family” / “Our family” for a family |
| `{them}` / `{Them}` | him / her / them |
| `{their}` / `{Their}` | his / her / their |
| `{theirs}` | his / hers / theirs |
| `{themselves}` | himself / herself / themselves |

**Never use `{they}`** — verb agreement breaks (“he are”). Use `{name}` as the subject instead: “When {name} feels afraid, remind {them} that…”

Write so the sentence works for a 4-year-old son, a 16-year-old daughter, a spouse, and “our family”:
- ✅ “Father, give {name} courage today.”
- ✅ “Help {name} rest, and let {their} heart be quiet.”
- ❌ “Help your son…” (assumes relationship) · ❌ “as his mother I…” (assumes speaker)

Never assume who is speaking (mom, dad, grandparent). Never assume family structure.

## 5. Theological guardrails

**Never write:**
- “God told me…”, “The Lord revealed…”, “God says you will…”
- “God promises you will pass / be healed / win / never be hurt.”
- “Nothing bad will ever happen to you.” “No harm will come to you.”
- “Everything happens for a reason.” “God needed another angel.”
- Anything implying outcomes depend on the *amount* of faith.
- Anything implying anxiety, depression, or illness is a sin or a faith failure.
- Prosperity framing: wealth, “abundance”, success as proof of blessing.
- “Manifest”, “speak it into existence”, “claim it”.

**Prefer:**
- “This passage reminds us…”, “May you know…”, “May God give you…”, “You might pray…”, “We trust you with what we cannot control.”
- Truths that are broadly held across Christian traditions: God’s presence, love, care, wisdom, forgiveness through Jesus, the Spirit’s help.
- Avoid denominational flashpoints (baptism mode, spiritual gifts, end times).

**Psalms of protection** (e.g. Psalm 91, 121) are songs of trust, not insurance policies. Pray for safety *and* entrust the person to God’s care — never promise immunity from harm.

**Paraphrase, don’t quote.** Wording differs between translations. If you echo the verse in the reflection or blessing, paraphrase or use a short phrase that appears in both BSB and WEB.

## 6. Ages and relationships

- Blessings are spoken *to* the person, so they should be understandable by the youngest age in `ages`. Simple words work for everyone.
- For babies and preschoolers the blessing is aspirational (“May you grow to know…”) and `talk.little` is a tender action: “Rest your hand on their back and whisper: ‘You are so loved.’”
- Teens deserve respect. Questions invite, never interrogate. Avoid moralising.
- For a spouse or adult, the blessing should still feel natural spoken across a kitchen table.

## 7. Sensitive topics

Grief, health, anxiety, bullying, rejection, failure and loneliness are where trust is won or lost.

- **Grief:** honour lament. Jesus wept. Don’t rush to silver linings. Comfort is presence before explanation.
- **Health:** pray for healing humbly, for skilled doctors and nurses, for comfort and courage. Never promise healing.
- **Anxiety:** God cares about worry; worry is not sin. Where natural, the prayer can ask for wisdom to seek help and for people who listen well.
- **Bullying:** the child is never to blame. Pray for safety, for wise adults who notice and act, for courage to tell someone. Never counsel passivity.
- **Failure / rejection:** worth is not earned. Grace, not shame.
- **Disability, autism and special needs** (*Uniquely Made*): the child is whole and loved now, never a problem to fix or a burden. Never link disability to sin, punishment or anyone’s faith (John 9:3). Pray for healing honestly, especially for pain and illness, but never promise it, and never suggest a child must change to be fully loved. A meltdown is distress, not defiance. Avoid pity and clichés (“special kids for special parents”, “angels”). Leave room in **Talk about it** for children who answer without words: “tell me or show me”.
- The app separately detects crisis language (self-harm, abuse, emergencies) and shows professional help — content should never imply prayer replaces care.

## 8. Process

1. Pick a passage that genuinely speaks to the topic **in context**. Read the surrounding chapter: `npm run verse -- "JOS 1:1-18"`.
2. Check it exists in both translations: `npm run verse -- "JOS 1:9" web`.
3. Write the entry. Read the blessing and prayer **aloud**. If you stumble, rewrite.
4. Run `node scripts/lint-content.mjs src/content/blessings/<your-file>.ts` until it reports 0 errors. Take warnings seriously.
5. Re-read once more as a tired parent. Can anything be shorter?

## 9. Gold-standard examples

```ts
{
  id: 'courage-jos-1-9',
  topic: 'courage',
  ref: 'JOS 1:9',
  contextRef: 'JOS 1:1-9',
  contextNote:
    'Moses has died, and Joshua must lead Israel into an unknown land. God’s call to be strong rests on his promise to be present, not on Joshua’s own ability.',
  reflection:
    'Courage in Scripture is not the absence of fear. It is moving forward because God is with us. Joshua faced an assignment far bigger than himself, and God met him with a promise of presence, not a pep talk.',
  blessing:
    'May you remember today that courage does not mean never feeling afraid. May you know that God is near when something feels difficult, and may his nearness give you strength for the next right step. When your heart beats fast, may you breathe, stand tall, and walk forward, knowing you are never alone.',
  prayer:
    'Father, give {name} courage today. When something feels too big, remind {them} that you are near. Help {name} do what is right even when it is hard, and ask for help without shame. Steady {their} heart, and let {them} sense your presence in every room {name} walks into. Thank you that {name} is never alone. Amen.',
  talk: {
    little: 'Hold their hand and say together: “God is with me wherever I go.”',
    child: 'What is one thing that feels scary today where you might need courage?',
    teen: 'Is there anywhere this week you feel pressure to back down from what is right?',
    adult: 'What is one hard thing ahead where you could use courage? How can I pray for you?',
  },
  ages: ['baby', 'preschool', 'elementary', 'tween', 'teen', 'young-adult', 'adult'],
  occasions: ['first-day-of-school', 'new-job', 'new-school'],
  keywords: ['brave', 'scared', 'afraid', 'nervous', 'strong', 'hard thing', 'new'],
  notes:
    'Originally addressed to Joshua at a unique moment in Israel’s history; apply by principle (God’s presence with his people, cf. Heb 13:5), never as a promise of success.',
}
```

```ts
{
  id: 'anxiety-php-4-6',
  topic: 'anxiety',
  ref: 'PHP 4:6-7',
  contextRef: 'PHP 4:4-9',
  contextNote:
    'Paul writes to a church he loves while he himself is in prison. His invitation to bring every worry to God comes from someone who knew real hardship, not easy circumstances.',
  reflection:
    'Paul does not shame worry; he gives it somewhere to go. Every anxious thought can become a prayer, and God’s peace is pictured as a guard around the heart. That peace often arrives before the problem is solved.',
  blessing:
    'May you know that you never have to carry your worries alone. May every anxious thought find its way into a prayer, and may God’s peace stand guard over your heart and mind. Even on heavy days, may you find room to breathe, and eyes to notice what is good.',
  prayer:
    'Lord, you see the worries {name} carries, even the ones {name} has no words for. Teach {them} to bring each one to you. Guard {their} heart and mind with your peace, the kind that does not depend on everything going right. Give us wisdom to know when {name} needs extra help, and surround {them} with people who listen well. Amen.',
  talk: {
    child: 'If your worries were in a backpack today, which one could we hand to God together?',
    teen: 'What has been taking up the most space in your mind lately?',
    adult: 'What is weighing on you most this week? I would love to pray about it with you.',
  },
  ages: ['elementary', 'tween', 'teen', 'young-adult', 'adult'],
  keywords: ['anxious', 'worried', 'worry', 'stress', 'panic', 'nervous', 'overwhelmed'],
  notes:
    'Do not imply anxiety is sin or that prayer replaces care; the prayer gently names seeking help. Peace is a gift, not a reward for praying correctly.',
}
```
