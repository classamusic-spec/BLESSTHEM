# Quality assurance

This page records how Bless Them is checked, what passed in the latest run, and what is knowingly left for later. Re-run everything with the commands in [Automated checks](#automated-checks).

**Latest run** (October 2026, on the commit that added this page):

| Check | Result |
| --- | --- |
| Scripture verification | ✅ BSB: 31,086 verses cross-checked, all identical. WEB: 36,078 verses cross-checked, 26 known formatting-only differences. 1,388 verified verses ship. |
| Content lint | ✅ 198 entries across 51 topics, with 0 errors and 0 warnings |
| Type check | ✅ App, service worker, build config and end-to-end tests |
| Unit tests | ✅ 46 / 46 |
| Contrast audit | ✅ Every text and surface pairing meets its target, in light and dark |
| End-to-end flows A–G | ✅ 7 / 7 (iPhone 13 viewport, Chromium) |
| Accessibility (axe) | ✅ 0 serious or critical violations on 8 screens |
| Database schema | ✅ 31 / 31 row-level security, limits and privacy checks on Postgres 16 |
| Production build and offline | ✅ The service worker precaches the app. Today's blessing opens with the network off. |

## Automated checks

```bash
npm run scripture       # verify every verse against the publisher's text
npm run lint:content    # schema, references, word budgets, theology and tone
npm run check           # typecheck, contrast audit and unit tests
npm run e2e             # flows A–G and the axe audit (starts the dev server)
npm run build           # production bundle and service worker
DATABASE_URL=postgres://… npm run test:schema   # RLS and limits on a real Postgres
```

## Required flows

Each flow from the brief is an end-to-end test in [`e2e/flows.spec.ts`](../e2e/flows.spec.ts). Each runs from a clean install on an iPhone 13 viewport.

| Flow | What the test does | Result |
| --- | --- | --- |
| **A** Install → onboarding → add child → personalized blessing → mark as prayed | Welcome, "My child", name and age, two needs, then a real blessing for Noah *before* any account. The parent continues without an account, taps **I prayed this**, and sees *Covered in prayer today.* | ✅ |
| **B** Open tomorrow → new blessing → reflection | Simulates the next day by moving every stored date back one day. Today shows a different passage, and the parent writes a reflection that appears in the journal. | ✅ |
| **C** Hard day → search "friendship rejection" → blessing → share | Plain-language search returns friendship and rejection passages. The parent opens one, chooses who it is for, and the share card renders. Switching off *Show their name* changes it to "…over my son." | ✅ |
| **D** Second child → individual needs → switch between children | Adds Ella, a preschooler, with her own needs. Switching between Noah and Ella on Today shows each child's own blessing. | ✅ |
| **E** Premium topic → paywall → subscribe → content unlocks | A Plus topic opens the paywall with the brief's headline, both prices and *Continue free*. *Start my family plan* (preview purchase) unlocks the topic immediately. | ✅ |
| **F** Prayer marked answered → gratitude | A prayer request in the journal is marked answered with a note ("He met Sam at lunch"). A *Thank you, God.* moment follows, and the entry shows when and how it was answered. | ✅ |
| **G** Notification → tap → the right blessing | The reminder deep link (`/today?person=…&from=notification`) opens directly on that person's blessing. | ✅ |

**Notification delivery** is not covered by automated tests, because headless browsers cannot tap a system notification. The service worker shows each reminder with `showNotification`. On tap it focuses an open window and posts a navigate message, or opens a new window on the deep link. Flow G verifies that the deep link lands on the right blessing.

**Offline.** Checked against `npm run preview`. After the first visit, switching the network off and reloading still opens Today with the day's blessing and verified Scripture, plus a calm offline notice. Journal entries made offline are saved immediately.

## Design QA

The brief's checklist was applied to every screen. Notes on how each question is answered:

| Question | How it is met |
| --- | --- |
| **Hierarchy:** is the primary action clear in under two seconds? | One primary (sage) button per screen. On Today, the person row comes first, then the blessing card, ending in **I prayed this**. |
| **Spacing:** does every screen breathe? | A 4/8 grid with fluid gutters. Cards have 28–36 px radii and generous inner padding, and reading width is capped at 600 px. |
| **Typography:** editorial, not templated? | Newsreader with optical sizes for Scripture and prayers, and Figtree for the interface. Poetry keeps its line breaks. |
| **Contrast:** is everything readable? | AAA for body text in both themes. `npm run contrast` fails the build below target. |
| **Motion:** polish, not distraction? | Transitions take 180–300 ms with damped springs. The one celebration is soft light, never confetti, and everything respects reduced motion. |
| **Copy:** can anything be shortened? | Microcopy was reviewed for length and tone. There is no "just", no guilt, no streaks, and "unlock" language was softened. |
| **Accessibility:** large text and assistive technology? | At 140% text, no screen scrolls sideways. Controls carry accessible names (axe). Radiogroups, live regions, focus traps in sheets and a skip link are in place. |
| **Emotional tone:** does it feel peaceful? | Time-of-day light, warm neutrals and Pip used sparingly. In hard seasons, Pip stays tender rather than cheerful. |
| **Faithfulness:** is Scripture contextual and trustworthy? | Every verse is verified, every card has *Read context* with a note on who is speaking, and the linter blocks promised outcomes and claims of revelation. |
| **Monetization:** is trust protected? | No countdowns or fake urgency. Prices and renewal terms show before purchase, *Continue free* is always visible, and free use stays meaningful. |

**Visual review.** Screenshots of the major screens are in [`docs/screenshots/`](screenshots/): phone and desktop, light and dark, morning and night. These issues were found and fixed during review:

- Chip icon spacing
- A decorative quote mark colliding with the reference
- Navigation bar transparency over content
- Ambient light clipped at the page edge
- Paywall close-button alignment
- Search results spacing
- Long references wrapping on the person page
- Share-card verse sizing
- Pip's pose after praying about something hard
- The unused sleep pose

## Accessibility

- **Automated:** axe-core runs on Welcome, the first blessing in onboarding, Today, Library, Journal, People, Settings and search results, with WCAG 2.0, 2.1 and 2.2 A/AA rules. There are 0 serious or critical violations.
- **Keyboard:** every control is a native button, link or input in a logical tab order. Arrow keys move between people, Escape closes sheets, and focus returns to where it was.
- **Screen readers:** people are announced with their state ("Noah, prayed for today"). Scripture is a blockquote with its reference, and saves and toasts are announced politely.
- **Text size and motion:** at 140% text, Today, Library, Journal, People, Settings and a topic page were checked with no horizontal overflow. Reduced motion removes all transforms.

## Content QA

- **198 curated entries** span all 51 topics. Every topic has at least three entries, and the age-sensitive topics have entries written for little ones.
- **Linting:** every entry passes the linter. It checks references, context ranges, word budgets, allowed template tokens, and theological and tonal guardrails.
- **Editorial review:** every entry was read for theology and tone.
  - Passages that are easily misused have explicit context notes. Philippians 4:13 is never a promise of winning, and Jeremiah 29:11 is addressed to exiles.
  - A few were adjusted in review. The Colossians 3 context note was softened. Psalm 31 is no longer offered on surgery days, because its card asks for rescue "from my enemies". Psalm 3's context now stops before its imprecatory verse.
  - Items to confirm with a pastor before launch:
    - The Numbers 6 note says Jewish parents traditionally speak this blessing over their children on the Sabbath.
    - Using 2 Timothy 2:15 for exam days is a stretch, and its note says so.
    - The Matthew 25 context includes the third servant.

## Known limitations

These are deliberate in this build, and each sits behind a seam described in [ARCHITECTURE.md](ARCHITECTURE.md):

1. **Accounts are local.** Sign in with Apple, Google and email creates an account on this device only, with no sync. Supabase Auth and sync are designed and the schema is ready and tested, but they are not connected.
2. **Purchases are a preview.** The paywall flow is complete and **never charges**. RevenueCat and Stripe plug into `PurchaseService`.
3. **Web reminders need the app open,** or the browser keeping the service worker alive. Native builds and push will deliver reminders reliably when the app is closed.
4. **Read-aloud uses the device's voices** (Web Speech API), so quality varies by platform. Parent-recorded audio is a V2 idea.
5. **iOS haptics** rely on the native switch-toggle tick in Safari 18 and later. Earlier versions are silent.
6. **Crisis resources are US-first,** with findahelpline.com for everywhere else. Localized lists should come with localization.
7. **English only,** with two public-domain translations. Licensed translations need permission before they are added.
8. **First load is about 415 KB of gzipped JavaScript.** It is split into cacheable chunks and is instant after the first visit. Splitting the library by category is the next optimization.
