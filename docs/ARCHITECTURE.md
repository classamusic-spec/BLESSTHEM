# Architecture

Bless Them helps a parent spend one quiet minute blessing someone they love, and the architecture is built to protect that minute. It has to open instantly, work offline, never show unverified Scripture, and never let private prayers leave the device without the parent's consent.

This document records the decisions behind the build: what ships today, what the production system adds, and where the seams between them are.

- [Principles](#principles)
- [Platform: a web-first PWA, native next](#platform-a-web-first-pwa-native-next)
- [Code layout and dependency rules](#code-layout-and-dependency-rules)
- [Scripture](#scripture)
- [Curated content](#curated-content)
- [Scenery](#scenery)
- [The personalization engine](#the-personalization-engine)
- [AI boundaries](#ai-boundaries)
- [Data, state and offline](#data-state-and-offline)
- [Backend: Supabase](#backend-supabase)
- [Authentication](#authentication)
- [Subscriptions](#subscriptions)
- [Notifications](#notifications)
- [Analytics and the north-star metric](#analytics-and-the-north-star-metric)
- [Safety](#safety)
- [Performance](#performance)
- [Security and privacy](#security-and-privacy)
- [Testing and quality gates](#testing-and-quality-gates)
- [Home-screen widget](#home-screen-widget)
- [Built to grow: V2](#built-to-grow-v2)

## Principles

1. **Scripture is data, never generated.** Every verse shown comes from a verified, public-domain source file. If a passage cannot be loaded, the app says so and shows nothing in its place.
2. **Local-first.** Today's blessing is prepared and stored on the device, so the core ritual needs no network, no account and no server.
3. **Content is reviewed code.** Blessings, prayers and context notes are written and reviewed by people, linted mechanically, and versioned in git.
4. **Seams, not stubs.** Auth, purchases, analytics and notifications sit behind small interfaces. This build ships honest local implementations, and production providers plug into the same interfaces.
5. **Spend as little of the user's time as possible.** Success is a parent who blesses their child and puts the phone down. Nothing in the architecture optimizes for time in the app.

## Platform: a web-first PWA, native next

**Decision:** ship a responsive, installable Progressive Web App first. It is built with React 19, TypeScript (strict) and Vite, and keeps a clear path to native iOS and Android through Capacitor.

**Why:**

- **One codebase reaches every parent today.** That covers iPhone, Android and desktop, with no app-store review in the critical path while the content and the ritual are refined.
- **The product is mostly typography, light and motion,** which the web renders beautifully. CSS gives precise control over the design system: variable fonts, `color-mix`, safe areas and Dynamic Type through `-apple-system-body`.
- **Offline is first-class.** A Workbox service worker precaches the app shell, fonts and every verified passage, so the app opens instantly on a plane.
- **The core is pure TypeScript and portable.** Content, Scripture, engine and store have no DOM dependencies. They run unchanged in a Capacitor shell, and could move to React Native if that were ever warranted.

**Path to native (Capacitor):**

| Capability | Web today | Native |
| --- | --- | --- |
| Haptics | `navigator.vibrate`, plus the iOS switch-toggle tick | `@capacitor/haptics` (UIImpactFeedbackGenerator) |
| Reminders | Scheduled while the app is open, shown by the service worker | `@capacitor/local-notifications` scheduled 7 days ahead, then APNs/FCM for special moments |
| Purchases | Preview provider (never charges) | RevenueCat (StoreKit 2 / Play Billing) |
| Sign in | Local accounts | Sign in with Apple, Google, email magic link through Supabase Auth |
| Read aloud | Web Speech API | `@capacitor-community/text-to-speech`, or parent-recorded audio (V2) |
| Share cards | Canvas, then the Web Share API or a download | Same canvas, then `@capacitor/share` |
| Widget | n/a | WidgetKit / Glance. See [Home-screen widget](#home-screen-widget). |

The services in `src/services/` are the only modules that change for native. Features never touch platform APIs directly.

## Code layout and dependency rules

```
content  →  engine  →  data  →  services  →  features / design / app
```

| Layer | Path | Rules |
| --- | --- | --- |
| Content | `src/content/` | Plain data and lookups: taxonomy, journeys, curated entries, Scripture and the scenery manifest. No React, and readable by the Node build scripts. |
| Engine | `src/engine/` | Pure functions: compose, personalize, search, safety, rhythm, journeys. Deterministic, no I/O, unit-tested. |
| Data | `src/data/` | The model (`models.ts`) and the Zustand store (`store.ts`). This is the only place state changes. |
| Services | `src/services/` | Platform seams: auth, purchases, analytics, notifications, haptics, speech, photos, theme, share, service worker. |
| Design | `src/design/`, `src/styles/` | Tokens and components. No product knowledge. |
| Features | `src/features/` | Screens composed from the layers above. Routes are lazy-loaded except Today. |

Features read state through store selectors and call store actions; they never mutate state themselves. Every analytics event is a typed union member (`ProductEvent`), so an event carrying free text is a compile error, not a code-review catch.

## Scripture

**Translations.** The Berean Standard Bible (BSB, default) and the World English Bible (WEB) are both public domain, so they can be redistributed commercially. Copyrighted translations such as NIV, ESV, NLT, CSB or NKJV are deliberately absent until they are licensed.

**Pipeline** (`scripts/build-scripture.mjs`, run on every `npm run build`):

1. Download the publisher's USFM and plain-text (VPL) editions from eBible.org into `scripture-src/`, which is gitignored.
2. Parse USFM with `scripts/lib/usfm.mjs`. It keeps poetry structure as `[text, indent, flags]` segments (new line, stanza break) and psalm superscriptions.
3. **Verify every verse in the Bible** against the publisher's plain text. All 31,086 BSB verses match exactly. In the WEB, 26 verses differ only in formatting (Psalm 119's acrostic letters, the Song of Songs' speaker labels, and one dash in Psalm 68:32), and those are allow-listed by name. Any other difference fails the build.
4. Extract only the verses that content references (passages, context passages and a few system references) into `src/content/scripture/{bsb,web}.json`. That is 1,388 verses for 386 references.
5. Without the sources (a fresh clone, or CI without network), the script instead verifies that the committed JSON covers every reference.

**Runtime** (`src/content/scripture/index.ts`):

- `getPassage(ref, translation)` returns a passage only if **every** verse in the range exists. There are no partial passages and no fallbacks to other text.
- BSB ships in the main bundle. WEB is loaded lazily the first time someone chooses it.
- Excerpts may drop an unbalanced quotation mark at a cut point (`balanceQuotes`). The words themselves are never altered.

**Adding a licensed translation** means:

1. Add its source to `scripts/lib/sources.mjs`, including licence metadata.
2. Extend `TranslationId` and `TRANSLATIONS`.
3. Rebuild.

The licence string is shown in the context sheet beside every passage.

## Curated content

Content lives in `src/content/blessings/*.ts`. Each file exports `entries: CuratedEntry[]`, and files are discovered automatically by `import.meta.glob`. Each entry has the following fields:

- `ref` and `contextRef`: the passage on the card, and the wider passage for *Read context*.
- `contextNote`: who is speaking, to whom, and why. It exists so a verse is never misread.
- `reflection`: *Hold onto this*, for the person praying.
- `blessing`: *Speak this over {name}*, written in the second person to be read aloud.
- `prayer`: addressed to God, using `{name}`, `{them}`, `{their}` and related tokens.
- `talk`: conversation prompts by stage (`little`, `child`, `teen`, `adult`).
- Suitability: `ages`, `relationships` and `occasions`.
- `keywords`: for search. Never shown.
- `notes`: reviewer guardrails. Kept in source and **stripped from production bundles** by the `trimBundle` plugin in `vite.config.ts`.

Today the library holds **198 entries across 51 topics in 7 categories**, plus 9 journeys, 6 seasonal collections and 18 special-moment occasions. `scripts/lint-content.mjs` enforces the schema, verified references, word budgets, template tokens, and theological and tonal guardrails. The guardrails cover divine-revelation claims, promised outcomes, prosperity framing, church clichés and gamified language. [CONTENT_GUIDE.md](CONTENT_GUIDE.md) is the editorial standard.

## Scenery

Every screen sits on a real photograph: nineteen hand-picked landscapes, each public domain, CC0 or CC BY, with its source, licence and credit recorded in [`src/content/scenery/sources.json`](../src/content/scenery/sources.json) and shown in *Settings › About › Photography*. None is generated.

**Pipeline.** `npm run scenery` ([`scripts/build-scenery.mjs`](../scripts/build-scenery.mjs)) runs at authoring time, not in the app build:

1. It downloads each original once into `/scenery-src` (git-ignored).
2. It applies one shared grade (warm, cool or night) so the set feels like one collection.
3. It encodes AVIF (quality 46) with a WebP fallback (quality 68, a whisper of softening on dense foliage) at 640, 1200 and 1800 px for the four daypart heroes, and 480, 800 and 1200 px for the rest, into `public/scenery/`.
4. It generates [`scenes.ts`](../src/content/scenery/scenes.ts): a typed `SceneId` union and, per scene, its widths, aspect, focal point, average colour, a 24-pixel blurred WebP placeholder (about 240 bytes) and the darkest and brightest tenth of its tones.

It only re-encodes what is missing or older than `sources.json`; `--force` re-encodes everything. The output is committed, so builds need no network and no image tooling.

**In the app.** `SceneImage` renders a `<picture>` (AVIF source, WebP `img` with `srcset` and `sizes`), shows the inline placeholder at once, and fades the photograph in over it. Only above-the-fold scenes load eagerly with high fetch priority. `DAYPART_SCENE` maps the hour to the backdrop and the Today hero; journeys, collections and topic categories each name a scene; `sceneForPerson` picks a person's from a stable hash of their id.

**Contrast.** The manifest's tonal extremes let `npm run contrast` check every text token on glass over the darkest and brightest part of each photograph. Words set straight onto photographs are measured as rendered by `e2e/scenery.spec.ts` (see [QA.md](QA.md#words-on-photographs)).

**Caching.** Photographs are not precached. The service worker caches them on first view (`CacheFirst`, `scenery-v1`, up to 90 files for a year, purged on quota pressure), so the install stays small. Offline, an unseen photograph shows its placeholder, which ships in the JavaScript.

## The personalization engine

`chooseDaily({ person, date, history, ... })` in `src/engine/personalize.ts` picks one entry per person per day. It is **deterministic**: the random stream is seeded by `(person, date, focus)`, so the same inputs always give the same blessing. That makes the result stable across reloads, testable, and possible to compute on any device without a server.

1. **Special moments first.** If a saved occasion falls today or tomorrow (a birthday, surgery or first day of school), choose from entries tagged for it. This is a Plus feature.
2. **Weight topics.**
   - The person's focus topics, or age- and relationship-appropriate defaults, start at 1.0.
   - Topics detected in the parent's private note ("big test Thursday") get a boost.
   - Related topics get a whisper of weight, 0.18.
   - Topics used in the last few days rest, at 0.15 to 0.85.
   - Time of day matters: sleep and peace rise in the evening, and courage and school rise on weekday mornings.
3. **Pick a topic, then a passage.**
   - The first pass never repeats a passage from the past 7 days.
   - Entries used in the last month are down-weighted, and the same passage under a different topic counts as a repeat.
   - Only if every topic is exhausted does a second pass allow an older passage back.
4. **Suitability always applies.** An entry must suit the person's age group and relationship. A family is prayed for as "our family", and a spouse never receives a passage written for a toddler.

The chosen entry is stored as a `Blessing { personId, date, entryId, topicId, source }`. Today's blessing is therefore a cached record, not a recomputation, and stays the same even if content changes.

Journeys (`src/engine/journeys.ts`) plan all their days at once for a given person. They never repeat a passage within a journey, and fall back in order to related topics, the same category, and finally a repeat.

## AI boundaries

**This build uses no generative model at runtime.** Every word a parent reads was written or reviewed by a person, and every verse was verified mechanically. That is deliberate: it is the safest way to honour the product's promise.

Where AI may be added later, it must work inside these boundaries:

| AI may | AI must never |
| --- | --- |
| Suggest passage–topic pairings for human review | Generate, paraphrase into quotation marks, or "complete" verse text |
| Draft blessings, prayers and talk prompts in the house voice, offline, for editors | Claim divine revelation, or say what God has told someone to do |
| Adapt the reading level of reviewed text for an age group | Predict the future or promise outcomes ("you will be healed") |
| Summarize a parent's own journal themes, on device or with explicit consent | Replace pastoral, medical, legal or mental-health care |
| Help rank existing entries for a typed concern | Shame, manipulate, or use Scripture as pressure |

**Required architecture:**

1. **Retrieve first.** Verified Scripture comes from the database, and the model only ever receives a reference and the verified text as read-only context.
2. **Generated text holds no verse text.** Output must be checked so that no run of more than six words matches Scripture outside the verified passage, and every reference must be validated against the verse index.
3. **Same gates as human content.** Every generated draft passes `lint-content`, then the safety classifier, then human review before it can ship.
4. **No open-ended chatbot in the MVP.**

## Data, state and offline

**Model.** `src/data/models.ts` defines these records:

- `Person`, `SpecialDate` and `Blessing`
- `JournalEntry`, where a prayer request becomes an answered prayer through `answeredAt`
- `Favorite` and `JourneyProgress`
- `Account`, `Subscription`, `NotificationPrefs` and `Settings`

Topics, occasions, journeys, collections and Scripture are content, not user data.

**Persistence.** A single Zustand store is persisted to `localStorage` under the key `blessthem:v1`. It is versioned (`STORE_VERSION`), and `migrate()` upgrades older shapes. Journal photos are resized on device and stored in IndexedDB (`idb-keyval`); only a `photoId` lives in the store. State changes are synchronous and optimistic, so the UI never waits on I/O.

**Offline.**

- The service worker precaches the app shell, fonts, icons and both Scripture files.
- Photographs are cached the first time they are seen. Until then, each shows its blurred placeholder.
- Navigation falls back to the cached `index.html`.
- Today's blessings are stored records, so the full ritual works with no connection.
- A calm banner notes when the device is offline. Nothing else changes.

**Export and delete.** *Settings › Privacy & your data* exports everything, photos included, as one JSON file, or erases everything from the device after a confirmation.

## Backend: Supabase

**Decision:** Supabase (managed Postgres, Auth, Storage and Edge Functions) is the production backend. It was chosen over Firebase and a custom service because:

- **Postgres with row-level security.** Data that belongs to a household is protected in the database itself, not only in application code.
- **First-class Sign in with Apple, Google and passwordless email,** which is exactly the brief.
- **Plain SQL and open source.** The data model stays portable, with no proprietary query language and no lock-in.
- **Edge Functions** handle the few server tasks: purchase webhooks, push notification fan-out and account deletion.

The schema is in [`supabase/schema.sql`](../supabase/schema.sql):

- **Ownership.** A `households` table owns `people`, `special_dates`, `blessings`, `journal_entries`, `favorites` and `journey_progress`. `household_members` links auth users to a household. Spouse collaboration in V2 is a second member row, not a migration.
- **Isolation.** Every table has RLS policies that allow access only to members of the owning household.
- **Identifiers.** Client-generated text ids (`newId()`) are the primary keys, so records created offline or as a guest keep their identity when synced.
- **Entitlements** live in `subscriptions` and are written only by the service role (webhooks), never by clients.
- **Photos** go in a private Storage bucket, with paths prefixed by household id and RLS on `storage.objects`.

**Sync** (planned):

- Local-first, with the store remaining the source of truth for the UI.
- Changes are pushed as upserts with `updated_at`. Conflicts resolve last-writer-wins per row, which suits single-household data where concurrent edits are rare.
- Deletes are tombstones (`deleted_at`) so they propagate across devices.
- Pulls are incremental by `updated_at`.

**Guest migration.** Guest data already uses stable ids. On first sign-in the client creates a household, uploads every local record under it, and marks the store as synced. Nothing is re-keyed, so nothing can be lost.

## Authentication

- **Production:** Supabase Auth with Sign in with Apple, Google OAuth and email magic link. There are no passwords.
- **This build:** `LocalAuthService` (`src/services/auth.ts`) creates a device-local account with the same shape.
- **Onboarding:** the parent receives a real, personal blessing *before* any account is offered. Choosing "Not now" is a first-class path. An account adds backup and sync and is never a gate.

## Subscriptions

- **Plans:** Bless Them+ costs $34.99 a year with a 7-day free trial, or $4.99 a month. The paywall shows the renewal terms in plain words before purchase.
- **Free tier:** daily blessings for 2 people, the free topics, and 10 favorites. Free use stays meaningful forever.
- **Plus:** the full library, journeys, seasonal collections, read-aloud, journal photos, special-moment blessings, and unlimited people and favorites.
- **Production:** RevenueCat on iOS and Android (StoreKit 2 / Play Billing) and Stripe Checkout on the web. Webhooks reach a Supabase Edge Function that writes the `subscriptions` row. The client reads entitlements and never grants them.
- **This build:** `PreviewPurchaseService` runs the full flow (paywall, confirmation, unlock, restore, cancel) and **never charges**.

## Notifications

Reminders are pastoral, never manipulative. Copy reads like "A blessing for Noah is ready." Nothing ever threatens a streak.

- **Planner.** `src/services/notifications.ts` turns preferences, people and special dates into `PlannedNotice[]`. That covers a morning reminder, an optional evening reminder, and special moments the day before. It is a pure function, so it can be reused by native schedulers.
- **Web.** While the app is open, notices are scheduled and shown through the service worker. Tapping one deep-links to `/today?person=…&from=notification&kind=…`. If the app is already open, the service worker posts a navigate message instead of opening a new window.
- **Native.** The same planned notices are handed to the OS scheduler for the next 7 days and refreshed on every open. Special-moment pushes for closed apps go through APNs/FCM from an Edge Function.
- **Permission.** Permission is requested after the first completed blessing, when its value is obvious, with a soft pre-prompt first.

## Analytics and the north-star metric

Product events are separate from private content. `ProductEvent` in `src/services/analytics.ts` is a closed, typed union whose properties are only counts, booleans, topic ids, plan names and sources. **No names, prayer or journal text, notes or search queries can be represented.** Events are tied to a random install id. They are buffered on device and forwarded to a sink when one is configured (PostHog or a Supabase table). Settings has an off switch.

| Metric (from the brief) | How it is measured |
| --- | --- |
| Onboarding completion | `onboarding_completed` ÷ `onboarding_started` |
| First person added | First `person_added` per install (`count: 1`) |
| First blessing viewed / completed | First `blessing_viewed`, and `blessing_completed` with `first: true` |
| D1 / D7 / D30 retention | `app_opened`, grouped by install and day since the first open |
| Blessings per active user | `blessing_completed` ÷ installs with `app_opened`, per week |
| People added per user | Maximum `person_added.count` per install |
| Library usage | `library_opened`, `topic_opened`, `search_performed` |
| Journal usage | `journal_entry_created`, `prayer_answered` |
| Notification conversion | `notification_prompt.result`, and `notification_opened` ÷ notices delivered |
| Paywall viewed, trial started, conversion | `paywall_viewed`, `trial_started`, `subscription_started` (by `source`) |
| Annual vs monthly | `plan` on `trial_started` and `subscription_started` |
| Churn | `subscription_canceled`, plus store-side renewal data |

**North star: weekly meaningful blessings completed per active household.** Once a week the app sends `week_summarized` for the previous Monday-to-Sunday week. It contains `{ week, activeDays, blessings, peopleBlessed, peopleBlessed3Plus }`: counts only, computed on device by `weekSummary()` in `src/engine/rhythm.ts`.

- **Primary:** the mean of `blessings` across summaries where `activeDays > 0`.
- **Secondary:** the share of active households where `peopleBlessed3Plus ≥ 1`, meaning they blessed at least one person 3 or more times that week.

Time in the app is deliberately not a goal metric. A great week is seven short visits.

## Safety

`src/engine/safety.ts` checks free text a parent types (search, notes, journal) for signs of self-harm, abuse, violence, medical emergency or serious mental-health concerns. Detection runs **only on device**.

When it matches, the app responds with compassion and real help *first*: 911, 988, Crisis Text Line, Childhelp, the National Domestic Violence Hotline, Poison Control, and findahelpline.com outside the US. Scripture may follow, gently, as a complement and never a substitute. The analytics event records only the category.

The patterns are deliberately conservative to avoid false alarms. "Hopeless" or "neglected" in ordinary speech do not trigger it.

## Performance

The targets come from the brief: instant launch, no layout shift, 60fps, cached blessings, and skeletons instead of spinners.

- **Precache.** After the first visit everything loads from the service worker, so launches are instant and work offline. The precache holds 76 files, about 2.7 MB uncompressed. Most of that is fonts, icons and both Scripture files, kept for offline use.
- **Photographs.** AVIF where supported (all 19 at every width total 2.4 MB, or 4.3 MB as WebP). The browser picks the smallest width that covers the slot at its pixel density. A header on a phone is the 800 or 1200 px AVIF, about 30 KB and 60 KB on average. The ones out of view load lazily, and each is cached on first view.
- **First visit.** The download is about 415 KB of gzipped JavaScript plus 15 KB of CSS, split by how often each part changes:

  | Chunk | gzip |
  | --- | --- |
  | Curated content | ~124 KB |
  | React and the router | ~81 KB |
  | Verified BSB Scripture | ~75 KB |
  | Icons | ~47 KB |
  | Motion | ~43 KB |
  | App code, including the scenery manifest | ~54 KB |

  A content update therefore re-downloads only the content chunk. WEB Scripture (~74 KB) loads only if chosen.
- **Trims.** Reviewer notes and two unused icon weights (thin and light) are removed from the bundle at build time.
- **Lazy routes.** Every route except Today is lazy-loaded, and Today renders from stored state with no network.
- **Animation.** Motion animates `transform` and `opacity`, which stay on the compositor. Interface transitions run 180–300 ms; only the scenes' slow drift and celebratory moments move more slowly.
- **Glass.** `backdrop-filter` is limited to floating surfaces (the tab bar, sheets, the Today tray, the blessing card, photo-card captions, the condensed title bar and controls on photographs). Cards in long lists use a plain translucent fill over the already-blurred backdrop, so scrolling never re-blurs a whole page.
- **Fonts.** The variable fonts are self-hosted and precached, with system serif and sans fallbacks. The splash in `index.html` paints before React mounts and fades out once the app is ready.
- **Next steps:**
  - Split content by category and load the rest of the library after first paint.
  - Use `LazyMotion` to defer motion features.
  - Subset the fonts to Latin.

## Security and privacy

- **Private content stays on device.** No third-party scripts, no ads and no trackers. Analytics carries no content.
- **Production.**
  - Supabase RLS on every table.
  - Entitlements are written only by the service role.
  - Storage is private, with signed URLs.
  - TLS everywhere, and encryption at rest.
  - The account deletion endpoint erases the household's rows and photos.
- **Recommended headers:**
  - A strict CSP: `default-src 'self'`, no inline script except the hashed theme bootstrap, `img-src 'self' data: blob:`.
  - `Referrer-Policy: same-origin`, and a `Permissions-Policy` that disables unused features.
- **Children.**
  - There are no child accounts. Parents enter only a first name and an age range, plus optional pronouns and a private note.
  - Nothing about a child is ever public.
  - A share card holds one line, such as “Today I’m praying courage over Noah,” plus the Scripture. Parents can switch the name off (“…over my son”). Journal entries and notes are never shared.

## Testing and quality gates

| Gate | Command | What it protects |
| --- | --- | --- |
| Scripture verification | `npm run scripture` (runs in `build`) | Every verse matches the publisher's text, and every reference resolves |
| Content lint | `npm run lint:content` | Schema, references, budgets, tokens, theological and tonal guardrails |
| Type check | `npm run typecheck` | Strict TypeScript across the app, service worker, config and e2e |
| Unit tests | `npm test` | Content invariants, Scripture lookups, the engine (composition, personalization, search, safety, rhythm), and store actions |
| Contrast | `npm run contrast` | Every text and surface token pairing meets WCAG targets in both themes, including glass over every photograph |
| End-to-end | `npm run e2e` | Flows A–G from the brief on an iPhone 13 viewport, an axe audit of key screens, and the contrast of words set on photographs, measured as rendered in both themes |
| Database | `npm run test:schema` | Household isolation under RLS, free-plan limits, server-only entitlements, private photos, and the analytics content guard, on a real Postgres |

Suggested CI runs `npm ci && npm run check && npm run lint:content && npm run e2e && npm run build` on every pull request, plus `npm run test:schema` against a Postgres service container.

## Home-screen widget

The widget is planned, and the MVP does not wait on it. The app already exposes everything it needs:

- **Snapshot.** After choosing or completing a blessing, the native shell writes a small JSON snapshot to the shared App Group (iOS) or DataStore (Android):

  ```json
  { "date": "2026-10-08", "people": [{ "name": "Noah", "topic": "Courage", "reference": "Joshua 1:9", "prayed": false, "url": "blessthem://today?person=p_…" }] }
  ```
- **Rendering.** WidgetKit (iOS) and Glance (Android) render the person's name, topic and reference. A tap opens the deep link, which the router already handles at `/today?person=…`.
- **Refresh.** The widget refreshes at midnight, when a blessing is prayed, and when people change. No network is needed.

## Built to grow: V2

The model already leaves room for the V2 list in the brief:

- **Spouse collaboration, grandparents and shared prayer circles:** add household members. RLS is already household-scoped.
- **Parent-recorded audio blessings:** a private Storage bucket, plus an `audio_id` on `blessings`.
- **Church plans and pastor-curated collections:** collections are already data (`COLLECTIONS`). Move them to a table with an `organization_id`.
- **Custom journeys, and adoption, foster or pregnancy journeys:** journeys are already data. Their day plans resolve through the same engine.
- **Lock-screen widgets, Apple Watch and bedtime mode:** they read the same snapshot as the home-screen widget.
- **Printable cards:** the share-card renderer already draws at 1080×1350 and can target print sizes.
