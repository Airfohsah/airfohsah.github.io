# Watin Be This? — native app

Native Android rebuild of the Naija charades game (React Native / Expo,
TypeScript). See `../index.html` for the original web/PWA version this was
ported from, and the plan this was built against at
`C:\Users\Airfohsah\.claude\plans\c-users-airfohsah-downloads-local-eas-b-wondrous-journal.md`.

## Architecture

- **No backend/database.** Game history, settings, and the word-list cache
  live in `AsyncStorage` on-device. The admin PIN and GitHub token live in
  `expo-secure-store` (Android Keystore-backed) — never bundled into the app,
  never sent anywhere except GitHub's own API when the admin explicitly pushes.
- **Word content** is a public JSON file (`words.json`, published via the
  repo's GitHub Pages site) that every install fetches on launch — see
  `src/lib/words.ts`. Only a device holding a valid GitHub token (entered in
  the in-app Admin screen, `src/app/admin/`) can push updates to it —
  `src/lib/github.ts`.
- **Backup/restore**: `src/lib/backup.ts` exports a single JSON file (words +
  history + settings) via the OS share sheet, and imports one back via the
  document picker. No cloud storage involved — the user picks where it goes.

## Local development

```bash
npm install
npx expo start
```

## Regenerating word content / sounds

- `node scripts/merge-words.js` — re-run only if `../index.html`'s
  `DEFAULT_WORDS` changes and needs re-syncing into `src/data/words.default.json`
  and the repo-root `words.json`.
- `node scripts/generate-sounds.js` — regenerates the WAV sound effects under
  `assets/sounds/` (pure synthesis, no external audio files needed).

## Building a signed APK (Windows + WSL2)

`eas build --local` requires macOS/Linux — on Windows this means WSL2, which
this machine also needs regardless, to route around a local loopback-socket
bug affecting Windows-native Android tooling. Full steps live in
`C:\Users\Airfohsah\Downloads\local-eas-build-windows-wsl2-setup.md`; summary:

1. Inside WSL2 (Ubuntu), with Node + a Linux-side Android SDK installed:
   ```bash
   git config --global --add safe.directory /mnt/c/Users/Airfohsah/Desktop/watinbethis
   export ANDROID_HOME=/path/to/android-sdk
   export ANDROID_SDK_ROOT=/path/to/android-sdk
   mkdir -p ~/.gradle
   printf 'org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m\n' > ~/.gradle/gradle.properties
   ```
2. From `/mnt/c/Users/Airfohsah/Desktop/watinbethis/mobile`:
   ```bash
   eas build --profile <profile> --platform android --local --non-interactive --output ~/build-output.apk
   cp ~/build-output.apk /mnt/c/Users/Airfohsah/Desktop/watinbethis/mobile/build-output.apk
   ```
   (Output to a native WSL2 path first, not directly to `/mnt/c/...` — a
   known `EPERM` bug in the local-build plugin's cross-filesystem copy step.)
3. Get the signing cert's SHA256 fingerprint (for `.well-known/assetlinks.json`)
   with `apksigner`, not `keytool`:
   ```bash
   apksigner verify --print-certs build-output.apk
   ```
4. `adb install build-output.apk` on a physical device to test.

Never commit the resulting `.apk`/`.aab` — `.gitignore` already excludes them
(GitHub hard-rejects anything over 100MB, and they're regenerated on every
build anyway).

## What's intentionally not here

- iOS — out of scope for now (Android-only target).
- Any ads/analytics SDK — the original web version had Google AdSense slots;
  those weren't carried over since a native ads integration wasn't requested.
