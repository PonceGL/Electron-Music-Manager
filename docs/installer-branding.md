# Installer branding

Decisions for the custom installer work tracked under EMM-11 (Windows NSIS assisted
installer + macOS DMG). Each decision here is implemented by a later subtask — this file
exists so those subtasks configure `electron-builder` against a single agreed plan instead
of improvising branding choices PR by PR.

## Existing icon assets

| File                  | Format | Largest representation |
| --------------------- | ------ | ----------------------- |
| `resources/icon.icns` | ICNS   | 1024×1024               |
| `resources/icon.ico`  | ICO    | 256×256                 |

Both are already wired as the app icon (`build.mac.icon`, `build.win.icon` in
`package.json`). They're square, high-resolution, and in the format each NSIS icon option
expects (`.ico`).

## Windows (NSIS) — installer/uninstaller icons

`electron-builder` already falls back to the app icon for `nsis.installerIcon` and
`nsis.uninstallerIcon` when they're not set, so no new icon variant is required for basic
branding. EMM-30 will still set them **explicitly** to `resources/icon.ico` rather than
relying on the implicit fallback, per this project's "no magic, be explicit" convention
(see `ARCHITECTURE.md` principle 3).

`nsis.installerHeaderIcon` is *one-click installer only* — since EMM-30 sets
`oneClick: false` to get the step-by-step wizard the ticket asks for, that option doesn't
apply and won't be set. No custom `installerSidebar`/`uninstallerSidebar` bitmap is
introduced either; the wizard uses NSIS's default Modern UI graphics, which satisfies
"branding básico" without adding new binary assets to maintain.

## macOS — DMG background

The ticket asks for a DMG background image, but authoring one requires real design work
(this environment has no image-editing tooling available). Decision: EMM-31 uses
`dmg.backgroundColor` (a flat color) instead of a background image/bitmap. This is fully
config-driven, reproducible, and satisfies "branding básico" without committing a
placeholder graphic that would need to be redone later anyway once real artwork exists.

If real artwork (logo-bearing background, arrow graphic, etc.) is produced later, swap
`backgroundColor` for `dmg.background` pointing at a PNG/TIFF under `resources/` — the
`window`/`contents` (icon positions) config EMM-31 adds does not need to change.

## Windows (NSIS) — installer language

EMM-30 forces a single Spanish-language installer: `nsis.language: "2058"` (Spanish —
Mexico LCID) with `nsis.multiLanguageInstaller: false`, instead of letting NSIS bundle
every translation and pick one based on the installing OS's locale.
