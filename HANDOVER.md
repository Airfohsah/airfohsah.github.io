# Watin Be This? — Handover Note

Last updated: 2026-09-21

## What this project is

Native Android rebuild (Expo/React Native/TypeScript) of the Naija charades
game, replacing the old single-file web PWA (`index.html`, still present at
repo root, not yet retired) and its `admin.html` word editor (retired —
deleted). Full app source lives in `mobile/`; see `mobile/README.md` for
architecture and build docs.

## Current status

**Built and working:**
- All game screens ported and functional (Home → Mode Select → Players →
  Category → Round Setup → Turn → Game → Results → Leaderboard).
- Fixed a real bug from the original: "Number of Rounds" never actually
  looped the match past round 1 — now it does.
- In-app Admin panel (`/admin`), flow as of today: tap Admin → **enter
  GitHub token first** (verified live against the repo before it's
  accepted) → **then set a local PIN** → both "lock in" after that; later
  visits only ask for the PIN. Token is what actually authorizes publishing
  word-list changes; PIN is just a per-device convenience lock.
- Word content sync: public `words.json` at repo root (served via GitHub
  Pages), fetched read-only by every install; admin pushes update it via
  GitHub's Contents API using a token stored only in that device's
  `expo-secure-store`.
- Backup/restore (export/import a single file via OS share sheet + document
  picker) covering words, history, and settings.
- **Live-tested on a real device** (Infinix X6837, Android 13) via Expo Go,
  connected over wireless ADB — confirmed loading and running.

**Fully-local build pipeline (no Expo/EAS cloud at all, per explicit
request):**
- `expo prebuild` generates `mobile/android/` (gitignored, regenerated
  every time).
- `mobile/plugins/withReleaseSigning.js` — a custom Expo config plugin that
  re-injects a release `signingConfig` into `build.gradle` on every
  prebuild (since prebuild wipes hand-edits otherwise), reading credentials
  from a local `keystore.properties` file.
- `mobile/keystore.properties` + `mobile/release.keystore` — generated
  locally via `keytool` inside WSL2, random passwords, **gitignored, never
  committed**. Back these up somewhere safe outside git — losing them means
  you can never sign an update under the same app identity again.
- Verified: a clean `expo prebuild` correctly produces a `build.gradle`
  pointing `buildTypes.release` at `signingConfigs.release`.
- **Not yet done**: an actual `./gradlew assembleRelease` run was started
  and deliberately stopped partway through (at your request, to avoid
  burning time/resources on a full build when we were really just doing
  Expo Go dev testing). The pipeline is set up and should work — next time,
  from WSL2: `cd /mnt/c/.../mobile/android && export
  ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk &&
  ./gradlew assembleRelease --no-daemon`.
- `eas-cli` is logged in (`airfohsah` account) but **unused** for the actual
  build — kept only in case you want EAS-hosted builds later. Not required
  for the local pipeline.

## Word list content — cleaned up today

Reviewed all ~930 words across all 10 categories for typos, duplicates,
unclear/ambiguous entries, and off-theme phrasing. Applied fixes via
`mobile/scripts/apply-word-fixes.js` (kept for the record — shows exactly
what changed and why). Result: **917 words**, zero duplicates.

Fixed: typo'd duplicates ("Eguisi Soup"/"Egusi soup", "Osogbo"/"Oshogbo",
"Draft"/"Draught", "Mai Suya"/"Suya seller"), capitalization inconsistencies,
awkward phrasing ("buying Mama put" → "Buying food from Mama put"),
unclear/off-theme entries removed or replaced (e.g. "Grass snake" → "Puff
adder", "Ogun"/"Cross River" [whole states] → "Olumo Rock"/"Obudu Mountain
Resort" [actual specific landmarks]).

**⚠️ Not yet committed.** These word-list changes are sitting in the working
tree (`mobile/src/data/words.default.json` and root `words.json`). Say the
word and I'll commit + push (which also makes the corrected `words.json`
live for every install).

## Open question, not yet decided

Asked whether each category could realistically be expanded to 500 words
(from ~80–115 currently). Short answer given: technically yes for raw count
in categories like Activities/Slangs/Occupations/Locations, but several
categories (Movies, Animals, Sports, Food) would likely have to sacrifice
recognizability/quality to hit that number — charades words need to stay
guessable, and depth runs out faster than 500 for some categories before
hitting obscure/niche territory. Full reasoning was given in chat; no
decision made yet on whether/how far to push this.

## Next up (per your instruction)

**Tomorrow: rebuild the UI.** No further scope defined yet beyond that —
pick up with what specifically needs to change.

## Known loose ends from earlier (still open)

- App icon (`Icon.png`) isn't padded for Android's adaptive-icon safe
  zone — may crop slightly. Fix before real launch.
- Fate of the old web PWA (`index.html`, still live on GitHub Pages) not
  decided — keep, retire, or redirect.
- iOS is out of scope for now (Android-only target).
