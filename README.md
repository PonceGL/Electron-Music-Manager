# Music Manager

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
