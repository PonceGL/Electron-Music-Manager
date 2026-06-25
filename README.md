# Music Manager

[![CI](https://github.com/PonceGL/Electron-Music-Manager/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/PonceGL/Electron-Music-Manager/actions/workflows/ci.yml)

A music manager desktop app built with Electron, React, and TypeScript.

## Requirements

- Node.js 20+
- pnpm

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Type checking

```bash
pnpm typecheck
```

## Build for distribution

```bash
# macOS (DMG — arm64 + x64)
pnpm package:mac

# Windows (NSIS installer — x64)
pnpm package:win
```

Output is placed in the `dist/` directory.

The NSIS installer (Windows) and DMG (macOS) branding decisions — icons, installer
language, background — are documented in
[`docs/installer-branding.md`](docs/installer-branding.md).

### Windows — Developer Mode required

Building on Windows requires symlink creation privileges. Enable **Developer Mode** before running `pnpm package:win`:

`Settings → System → For developers → Developer Mode → ON`

If the build fails with a symlink error, also clear the electron-builder cache:

```
C:\Users\<user>\AppData\Local\electron-builder\Cache\
```

## Auto-updates

The app uses `electron-updater` configured for GitHub Releases. When a new version is published as a GitHub Release, the app will detect and install the update automatically on the next launch.

To publish a release with build artifacts:

```bash
# Mac
pnpm package:mac -- --publish=always

# Windows
pnpm package:win -- --publish=always
```

This requires a `GH_TOKEN` environment variable with write access to the repository.

## Continuous Integration

GitHub Actions runs on every push and pull request to `main`:

- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): `typecheck`, `lint`,
  `format:check`, `test:run`, plus a build-only check (`electron-vite build`, no
  packaging) on `macos-latest` and `windows-latest` to catch platform-specific
  breakages early.
- **Package** ([`.github/workflows/package.yml`](.github/workflows/package.yml)): full
  `package:mac` / `package:win` builds, uploaded as workflow artifacts. Not run on
  every push — trigger it manually (`workflow_dispatch`) or by pushing a `v*.*.*` tag.

## Dependency updates

Dependabot opens weekly PRs grouped by production vs. development
dependencies (see [`.github/dependabot.yml`](.github/dependabot.yml)).
`electron` and `electron-builder` are excluded from grouping and require
manual smoke testing before merging — see
[`docs/updating-electron.md`](docs/updating-electron.md).
