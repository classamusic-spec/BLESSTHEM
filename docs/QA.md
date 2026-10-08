# Quality assurance

This page records how Bless Them is checked, what passed in the latest run, and what is knowingly left for later. Re-run everything with the commands in [Automated checks](#automated-checks).

**Latest run** (October 2026, after the scenery and glass pass):

| Check | Result |
| --- | --- |
| Scripture verification | ✅ BSB: 31,086 verses cross-checked, all identical. WEB: 36,078 verses cross-checked, 26 known formatting-only differences. 1,433 verified verses ship. |
| Content lint | ✅ 218 entries across 56 topics, with 0 errors and 0 warnings |
| Type check | ✅ App, service worker, build config and end-to-end tests |
| Unit tests | ✅ 46 / 46 |
| Contrast audit | ✅ Every text and surface pairing meets its target, in light and dark, including glass over the darkest and brightest part of every photograph |
| Words on photographs | ✅ 432 rendered measurements (every scene, every hour, both themes, 390 and 1280 px) meet their targets. The hardest cases run on every e2e pass. |
| End-to-end | ✅ 10 / 10: flows A–G, the axe audit, and words on photographs in light and dark (iPhone 13 viewport, Chromium) |
| Accessibility (axe) | ✅ 0 serious or critical violations on 8 screens |
| Database schema | ✅ 31 / 31 row-level security, limits and privacy checks on Postgres 16 |
| Production build and offline | ✅ The service worker precaches the app (76 files, 2.7 MB; photographs excluded). With the server stopped, Today, Library and Journal open, photographs already seen show from the cache, and unseen ones show their blurred placeholder. |

## Automated checks

```bash
npm run scripture       # verify every verse against the publisher's text
npm run lint:content    # schema, references, word budgets, theology and tone
npm run check           # typecheck, contrast audit and unit tests
npm run e2e             # flows A–G, the axe audit and words on photographs (starts the dev server)
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

**Offline.** Checked against `npm run preview` with the server stopped, not just emulated offline: Playwright's offline mode lets service-worker fetches through. After the first visit, reloading still opens Today with the day's blessing and verified Scripture, plus a calm offline notice. Journal entries made offline are saved immediately. Photographs already seen come from the `scenery-v1` cache. Any other photograph shows its blurred placeholder, which ships inside the app.

## Words on photographs

axe cannot judge text over an image, so words set straight onto a photograph are measured as rendered. For each element, its text (and text shadow) is hidden, whatever lies behind it is captured, and the text colour is compared with the brightest 2% of those pixels (the darkest 2% for dark text). Ignoring the shadow makes this the worst case.

The full sweep covers 432 measurements. It visits Welcome, Today and the reading view at four hours (one per scene), and the 25 scenic headers (tabs, every journey, collection and topic category). It runs in light and dark, at 390 and 1280 px:

| Words | Target | Worst, light | Worst, dark |
| --- | --- | --- | --- |
| Header titles (37.5 px) | 4.5:1, AAA large | 5.15 · swans, phone | 7.29 · swans, phone |
| The greeting (40 px) | 4.5:1, AAA large | 6.68 · night | 6.68 · night |
| Header subtitles | 7:1, AAA | 7.03 · snowy pine, desktop | 8.41 · autumn trail |
| Names on the Today tray | 7:1, AAA | 9.25 | 9.26 |
| The question on the tray | 7:1, AAA | 13.75 | 11.40 |
| Scripture in the reading view | 7:1, held to body text | 7.77 · dawn | 7.77 · dawn |
| Blessing in the reading view | 7:1, held to body text | 7.50 · dawn | 7.51 · dawn |
| Header eyebrows | 4.5:1, AA as metadata | 5.16 · swans, desktop | 7.29 · swans, desktop |
| The date on Today | 4.5:1, AA as metadata | 4.87 · midday | 6.97 · midday |
| Reading-view eyebrow and hint | 4.5:1, AA as metadata | 5.02 | 5.02 |
| Welcome wordmark | 4.5:1 (logos are exempt) | 5.04 · midday | 5.75 · midday |

The first sweep found titles at 2.2:1 and the greeting at 1.6:1 over the brightest skies. They sat where the photograph was already fading into the cream page. The fix keeps the photograph solid behind the words and dissolves it below them, adds a progressive blur and a deeper scrim behind titles, and uses the stronger glass for the tray. [`e2e/scenery.spec.ts`](../e2e/scenery.spec.ts) re-measures the hardest cases (midday Welcome and Today, the reading view, the swans, snowy pine and Journal headers) in both themes on every run.

## Design QA

The brief's checklist was applied to every screen. Notes on how each question is answered:

| Question | How it is met |
| --- | --- |
| **Hierarchy:** is the primary action clear in under two seconds? | One primary (sage) button per screen. On Today, the person row comes first, then the blessing card, ending in **I prayed this**. |
| **Spacing:** does every screen breathe? | A 4/8 grid with fluid gutters. Cards have 28–36 px radii and generous inner padding, and reading width is capped at 600 px. |
| **Typography:** editorial, not templated? | Newsreader with optical sizes for Scripture and prayers, and Figtree for the interface. Poetry keeps its line breaks. |
| **Contrast:** is everything readable? | AAA for body text in both themes, on solid surfaces and on glass over every photograph. `npm run contrast` fails the build below target, and words set on photographs are measured as rendered ([above](#words-on-photographs)). |
| **Motion:** polish, not distraction? | Transitions take 180–300 ms with damped springs. The one celebration is soft light, never confetti, and everything respects reduced motion. |
| **Copy:** can anything be shortened? | Microcopy was reviewed for length and tone. There is no "just", no guilt, no streaks, and "unlock" language was softened. |
| **Accessibility:** large text and assistive technology? | At 140% text, no screen scrolls sideways. Controls carry accessible names (axe). Radiogroups, live regions, focus traps in sheets and a skip link are in place. |
| **Emotional tone:** does it feel peaceful? | Real, quiet places that follow the time of day, under warm frosted glass. In hard seasons the celebration after a prayer stays quiet. |
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
- The celebration after praying about something hard

The scenery and glass pass found and fixed:

- White titles at about 2:1 where the photograph faded into the page
- The reading view's buttons inheriting the light glass (custom properties resolve where they are declared, so a local tint now re-derives its materials)
- The homepage nav veil stopping short of the window edges
- The night scene's crescent moon sitting under the date
- Swans cropped to two necks on a wide person poster
- Suggestion chips cut off at the end of their row
- A stray bright band where a header's scrim ended before its photograph did
- A test counting the logo's cream leaves as background

## Accessibility

- **Automated:** axe-core runs on Welcome, the first blessing in onboarding, Today, Library, Journal, People, Settings and search results, with WCAG 2.0, 2.1 and 2.2 A/AA rules. There are 0 serious or critical violations.
- **Keyboard:** every control is a native button, link or input in a logical tab order. Arrow keys move between people, Escape closes sheets, and focus returns to where it was.
- **Screen readers:** people are announced with their state ("Noah, prayed for today"). Scripture is a blockquote with its reference, and saves and toasts are announced politely.
- **Text size and motion:** at 140% text, Today, Library, Journal, People, Settings and a topic page were checked with no horizontal overflow. Reduced motion removes all transforms, including the scenes' drift and parallax.
- **Transparency:** Reduce Transparency (in-app or the system setting) makes every glass material and the backdrop solid.
- **Photographs:** decorative throughout (`aria-hidden`, empty `alt`). The words set on them are measured as rendered ([above](#words-on-photographs)).

## Content QA

- **218 curated entries** span all 56 topics. Every topic has at least three entries, and the age-sensitive topics have entries written for little ones.
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
9. **Photographs need a first visit online.** They are cached as they are seen rather than precached, so the install stays at 2.7 MB. Every photograph at every width is another 2.4 MB as AVIF, or 4.3 MB as WebP. Offline, an unseen photograph shows its blurred placeholder.
10. **Each person's scene is chosen for them,** from their id. Letting a parent pick it, like a contact poster, is a natural next step.
