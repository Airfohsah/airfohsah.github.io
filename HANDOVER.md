# Watin Be This? — Handover Note

Last updated: 2026-09-21 (session 3)

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
- In-app Admin panel (`/admin`): tap Admin → enter GitHub token first
  (verified live against the repo) → then set a local PIN → both "lock in"
  after that; later visits only ask for the PIN.
- Word content sync: public `words.json` at repo root (served via GitHub
  Pages), fetched read-only by every install; admin pushes update it via
  GitHub's Contents API using a token stored only in that device's
  `expo-secure-store`.
- Backup/restore (export/import a single file via OS share sheet + document
  picker) covering words, history, and settings.
- **Light/dark mode**, fully implemented — two palettes in
  `constants/theme.ts`, `store/ThemeContext.tsx` driven by system
  preference or an explicit override in Settings → Appearance. Every screen
  migrated onto it. **Exception, deliberate**: Home and Mode Select stay
  pinned to the dark illustrated look always (they're branded artwork, not
  a themeable background) — same logic as the app icon not flipping.
- Home and Mode Select **rebuilt against your reference designs**: custom
  SVG dusk-mountain-and-river illustration (`components/HomeBackground.tsx`,
  react-native-svg), brush-script title (Permanent Marker font), glowing
  icon-badge rows with chevrons.
- **Live-tested on a real device** (Infinix X6837, Android 13) via Expo Go
  over wireless ADB.

**Three real bugs found and fixed during this session** (not just
cosmetic — worth knowing about if anything feels off later):
1. **Game history silently never saved.** `endActiveGame()` tried to read
   the computed next-state back out of a `setState` updater via a captured
   outer variable — React doesn't guarantee that updater runs synchronously,
   so the history-save check always saw `null`. Rewritten to compute the
   next state directly instead of round-tripping through setState.
2. **Orientation stuck in landscape after a game finished.** `unlockAsync()`
   sets policy to `DEFAULT`, which in Expo Go doesn't reliably fall back to
   the app.json `"portrait"` setting (that's only baked into
   `AndroidManifest.xml` in a real prebuilt/standalone build). Now locks
   back to `PORTRAIT_UP` explicitly.
3. **Every screen except Home rendered under the status bar.** Only Home
   had `SafeAreaView`. Moved safe-area top-inset handling into the shared
   `Screen` component (`components/ui.tsx`) so every screen gets it
   automatically.

**Word list**: expanded every category to **150 words each** (1500 total),
common/relatable Nigerian words only, zero duplicates. Script kept at
`mobile/scripts/expand-words.js` for the record. (Earlier in the session,
also did a full typo/duplicate/clarity cleanup pass — see
`mobile/scripts/apply-word-fixes.js`.)

**UI reference screenshots**: every screen captured to `Screenshots/` at
repo root (Home, Mode Select, Players, Category, Round Setup, Turn +
countdown, Game, mid/final Results, How to Play, Leaderboard, Settings,
Admin PIN entry) for use as before/after reference during the UI rebuild.

**Committed and pushed** — everything above is on `main` as of this
session (commit includes the bugfixes, word expansion, screenshots, theme
system, and Home/Mode Select redesigns).

**Fully-local build pipeline (no Expo/EAS cloud, per explicit request):**
- `expo prebuild` generates `mobile/android/` (gitignored, regenerated
  every time).
- `mobile/plugins/withReleaseSigning.js` — custom Expo config plugin that
  re-injects a release `signingConfig` into `build.gradle` on every
  prebuild, reading credentials from a local `keystore.properties` file.
- `mobile/keystore.properties` + `mobile/release.keystore` — generated
  locally via `keytool` inside WSL2, random passwords, **gitignored, never
  committed**. Back these up somewhere safe outside git — losing them means
  you can never sign an update under the same app identity again.
- Verified: a clean `expo prebuild` correctly produces a `build.gradle`
  pointing `buildTypes.release` at `signingConfigs.release`.
- **Not yet done**: an actual `./gradlew assembleRelease` run hasn't been
  completed (started once, stopped deliberately to avoid burning time on a
  full build during dev-loop testing). Next time, from WSL2:
  `cd /mnt/c/.../mobile/android && export ANDROID_HOME=/opt/android-sdk
  ANDROID_SDK_ROOT=/opt/android-sdk && ./gradlew assembleRelease --no-daemon`.
- `eas-cli` is logged in (`airfohsah` account) but **unused** for the actual
  build — kept only in case EAS-hosted builds are wanted later.

## Next up

UI rebuild is now **in progress** — Home and Mode Select are done against
supplied reference images. Remaining screens (Players, Category, Round
Setup, Turn, Game, Results, How to Play, Leaderboard, Settings, Admin)
still use the earlier flat-dark design and haven't been restyled to match
the new illustrated/brush aesthetic yet.

## Known loose ends from earlier (still open)

- App icon (`Icon.png`) isn't padded for Android's adaptive-icon safe
  zone — may crop slightly. Fix before real launch.
- Fate of the old web PWA (`index.html`, still live on GitHub Pages) not
  decided — keep, retire, or redirect.
- iOS is out of scope for now (Android-only target).
- Status bar background color doesn't follow the light/dark theme on
  Android (only icon color does) — `expo-status-bar` in this SDK doesn't
  expose a `backgroundColor` prop. Minor cosmetic gap, not chased further.
