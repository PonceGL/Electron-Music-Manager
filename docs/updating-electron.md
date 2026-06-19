# Updating Electron / electron-builder

`electron` and `electron-builder` are excluded from Dependabot's grouped
updates (see [`.github/dependabot.yml`](../.github/dependabot.yml)) — each
gets its own PR, and none of them should be merged without going through
this checklist first. They drive the native runtime and the packaging
pipeline, so a bad bump breaks the app for every user on the next release,
not just the build.

## Procedure

1. **Read the release notes** for the target version (and every version in
   between, for a major bump) — look specifically for Node/Chromium ABI
   changes, deprecated/removed APIs, and changes to `electron-builder`'s
   `build` config keys in `package.json`.
2. **Bump the version** in `package.json` and run `pnpm install`.
3. **Re-run the standard checks**: `pnpm typecheck`, `pnpm lint`,
   `pnpm test:run`. These catch type-level breakage (e.g. removed/renamed
   Electron APIs used in `src/main` or `src/preload`) but not runtime
   behavior.
4. **Smoke-test `pnpm dev` manually**: app launches, the native menu works
   (including platform-specific items), and the "About" window opens with
   styles. Electron version bumps are exactly the kind of change that can
   silently break native menu roles or window chrome.
5. **Build and smoke-test the installer on both platforms** —
   `pnpm package:mac` and `pnpm package:win`. The pre-push hook already
   runs both on every push, so a failing build is caught automatically;
   what it does **not** catch is whether the packaged app actually opens
   and runs correctly. Install and launch the produced `.dmg`/`.exe` on at
   least the platform you're on, and have someone on the other platform do
   the same before merging.
6. **Only merge once both platforms have been smoke-tested.** If you can't
   test a platform yourself, ask someone who can, or hold the merge until
   you're able to.

## Scope

This applies to every `electron`/`electron-builder` bump, not just majors —
patch releases have shipped native-module ABI breaks before. The risk is
just higher for majors, where steps 1 and 4 deserve the most time.
