# Architecture

This document defines how the codebase is organized as the app grows beyond the initial
proof-of-concept (build, update, custom menu, multi-window). It is the reference every
contributor follows when adding a new feature, IPC channel, menu entry, window, database
table, or platform-specific behavior.

## Guiding principles

1. **The filesystem is the source of truth.** The local database is a rebuildable
   index/cache that mirrors what's on disk. It must always be possible to delete the
   database and reconstruct it from the user's library folders.
2. **One typed contract for everything that crosses a process boundary.** All
   `main` ↔ `preload` ↔ `renderer` communication is described in `src/shared/`. Nothing
   calls `ipcRenderer.invoke('some-string', ...)` directly — only through the typed
   `window.electronAPI` surface, which is generated from the same contract main implements.
3. **No magic strings.** IPC channel names, window ids, menu ids/actions, and platform
   capability flags are named constants exported from `src/shared/`. Anything used in two
   or more places must be a named export, not a literal.
4. **`window.electronAPI`'s type is derived, not duplicated.** The type the renderer sees
   is `typeof api` from the preload module. If preload doesn't implement something the
   contract declares, TypeScript fails the build — that's the "validation" the project
   needs.
5. **`shared/` is earned, not assumed.** Don't pre-create shared modules. Code starts
   colocated inside the feature/process that needs it. The moment a second consumer (a
   second feature, or the other side of the IPC bridge) needs it, promote it to the
   appropriate shared layer (see "Promotion rule" below). This applies uniformly —
   renderer features, main services, and menu ids all follow it.
6. **Platform differences are explicit and isolated.** Behavioral differences between
   macOS/Windows/Linux live behind a typed adapter with one file per platform — never as
   `if (process.platform === ...)` branches scattered through business logic. Trivial
   config differences (a single constant value) are the only exception.

---

## Top-level layout

```
src/
├── shared/      # Cross-process contract — imported by main, preload AND renderer
├── main/        # Electron main process
├── preload/     # contextBridge surface
└── renderer/    # React app(s) — one entry per window
```

---

## 1. `src/shared/` — the cross-process contract

```
src/shared/
├── ipc/
│   ├── channels.ts          # IPC_CHANNELS — every channel name, namespaced by domain
│   ├── contracts/           # request/response types + zod schemas, one file per domain
│   │   ├── fs.contract.ts
│   │   ├── library.contract.ts
│   │   ├── player.contract.ts
│   │   └── window.contract.ts
│   └── index.ts
├── models/                   # Domain DTOs that cross IPC: Track, Album, Artist, Playlist
│   ├── track.ts
│   ├── album.ts
│   ├── artist.ts
│   └── playlist.ts
└── constants/
    ├── windowIds.ts          # WindowId — every BrowserWindow the app can open
    └── capabilities.ts       # PlatformCapabilities — see §2.8
```

**Setup note:** `src/shared/**/*` must be included in both `tsconfig.node.json` (main/preload)
and `tsconfig.web.json` (renderer) so all three sides type-check against the same source.

### 1.1 Channels & contracts

```ts
// src/shared/ipc/channels.ts
export const IPC_CHANNELS = {
  fs: {
    selectDirectory: 'fs:select-directory'
  },
  library: {
    scan: 'library:scan',
    scanProgress: 'library:scan-progress' // main -> renderer event
  }
} as const
```

**Convención obligatoria — cero magic strings:** ninguna llamada a `ipcMain.handle`,
`ipcMain.on`, `ipcRenderer.invoke` o `ipcRenderer.on` debe recibir un string literal como
nombre de canal. Siempre se referencia `IPC_CHANNELS.<domain>.<name>` (ver §1 principio 3).
Esto aplica tanto en `src/main/ipc/**` como en `src/preload/api/**`.

```ts
// src/shared/ipc/contracts/fs.contract.ts
import { z } from 'zod'

export const selectDirectoryResponseSchema = z.object({
  canceled: z.boolean(),
  path: z.string().nullable()
})

export type SelectDirectoryResponse = z.infer<typeof selectDirectoryResponseSchema>
```

- One contract file per domain, mirroring `ipc/<domain>/` on the main side and
  `features/<domain>/api/` on the renderer side.
- Every `ipcMain.handle` validates its input (and, where cheap, its output) with the
  schema from the matching contract — same spirit as the existing DTO convention for
  HTTP endpoints, applied to IPC.
- Event channels (main → renderer, e.g. `scanProgress`) are declared the same way as
  request/response channels — they're still part of the contract.

### 1.2 Domain models vs. DB schema

`src/shared/models/*` are the shapes that travel over IPC and that the renderer consumes
(`Track`, `Album`, ...). `src/main/db/schema/*` are the Drizzle table definitions —
internal to `main`. A repository/service maps DB rows → shared model before it reaches an
IPC handler. They're allowed to diverge (e.g. a DB row has internal bookkeeping columns
the renderer never needs).

### 1.3 Window ids & capabilities

`WindowId` (`'main' | 'about' | ...`) is the only vocabulary used to refer to windows —
see §2.2. `PlatformCapabilities` is a flat object of booleans/feature flags computed once
at startup describing what the _current OS_ supports, exposed to the renderer via preload
— see §2.8.

---

## 2. Main process (`src/main/`)

```
src/main/
├── index.ts                  # bootstrap only
├── windows/
├── menu/
├── ipc/
├── services/
├── db/
├── workers/
└── updater.ts
```

### 2.1 Bootstrap — `index.ts`

Stays minimal: create the main window, build the menu, register IPC handlers, init the
DB, start the updater. No business logic here — it only wires together the pieces below.

### 2.2 Windows — `windows/`

```
src/main/windows/
├── windowRegistry.ts   # Map<WindowId, BrowserWindow> + get/register/unregister/sendTo/broadcast
├── main/createMainWindow.ts
└── about/createAboutWindow.ts
```

- Every window is created through a `create<Name>Window()` factory in its own folder.
- `windowRegistry` is the **only** way one window's code (running in `main`) reaches
  another window. No window ever talks to another window directly — always
  `windowRegistry.sendTo(WindowId.MiniPlayer, IPC_CHANNELS.player.stateChanged, payload)`.
- New window checklist → §5.

### 2.3 Menu — `menu/` (the menu contract)

```
src/main/menu/
├── index.ts                  # buildMenu(): Menu
├── resolveMenu.ts            # the ONLY place that knows about process.platform for menus
├── types.ts                  # MenuItemDescriptor — the contract every section follows
├── menuIds.ts                # MenuId — every menu item id
├── sections/
│   ├── app.section.ts        # macOS application menu
│   ├── file.section.ts
│   ├── edit.section.ts
│   ├── view.section.ts
│   ├── window.section.ts
│   ├── help.section.ts
│   └── library.section.ts    # feature-contributed section
└── actions/
    ├── registry.ts           # menuActions — every click handler, keyed by id
    ├── help.actions.ts
    └── library.actions.ts
```

```ts
// src/main/menu/types.ts
import type { MenuItemConstructorOptions } from 'electron'
import type { MenuId } from './menuIds'
import type { MenuActionId } from './actions/registry'

export type SupportedPlatform = 'darwin' | 'win32' | 'linux'

export interface MenuItemDescriptor {
  id: MenuId
  label?: string
  role?: MenuItemConstructorOptions['role']
  accelerator?: string
  type?: 'normal' | 'separator' | 'checkbox' | 'radio'
  /** Omit = visible on every platform. */
  platforms?: SupportedPlatform[]
  /** Key into menuActions — never an inline function. */
  action?: MenuActionId
  submenu?: MenuItemDescriptor[]
}
```

```ts
// src/main/menu/actions/registry.ts
export const menuActions = {
  openAboutWindow: () => openAboutWindow(),
  addLibraryFolder: () => libraryService.promptAddFolder(),
  rescanLibrary: () => libraryService.rescan()
} as const

export type MenuActionId = keyof typeof menuActions
```

Each `sections/*.section.ts` exports **pure data**: `const fileSection: MenuItemDescriptor[] = [...]`.
Platform differences are expressed with the `platforms` field, never with branching code
inside a section file. `resolveMenu.ts` filters descriptors by `process.platform`, looks
up `action` ids in `menuActions`, and converts the result to
`MenuItemConstructorOptions[]`. `index.ts` just concatenates all sections and calls
`resolveMenu`.

This is the structure every contributor follows: **new menu entry → add a descriptor to
the relevant section (or a new `library.section.ts`-style file for a new feature), add its
id to `menuIds.ts`, add its handler to `actions/registry.ts`.** Nothing else changes.

### 2.4 IPC handlers — `ipc/`

```
src/main/ipc/
├── registerIpcHandlers.ts   # calls register<Domain>Ipc() for every domain
├── fs/fs.ipc.ts
├── library/library.ipc.ts
└── settings/settings.ipc.ts
```

- One folder per domain, mirroring `src/shared/ipc/contracts/<domain>.contract.ts`.
- Each `<domain>.ipc.ts` exports `register<Domain>Ipc()`, called once from
  `registerIpcHandlers.ts`.
- Handlers: parse input with the contract's zod schema → call a service → return a value
  matching the contract's response type. No business logic in the handler itself.

### 2.5 Services — `services/`

Framework-agnostic business logic. Services never import `ipcMain`, `BrowserWindow`, or
`Menu` — they're called _by_ IPC handlers and _by_ menu actions alike, so they can't
depend on either.

```
src/main/services/
├── fs/dialog.service.ts
└── library/
    ├── library.service.ts     # public API: addFolder, rescan, getTracks...
    ├── scanner.service.ts     # walks directories
    └── metadata.service.ts    # reads tags from audio files
```

### 2.6 Database — `db/` (better-sqlite3 + Drizzle ORM)

```
src/main/db/
├── client.ts                  # better-sqlite3 connection + drizzle instance
├── schema/
│   ├── tracks.schema.ts
│   ├── albums.schema.ts
│   ├── artists.schema.ts
│   ├── playlists.schema.ts
│   ├── libraryFolders.schema.ts
│   └── index.ts                # combined schema for drizzle + drizzle-kit
├── migrations/                 # generated by drizzle-kit
└── repositories/
    ├── track.repository.ts
    ├── album.repository.ts
    └── libraryFolder.repository.ts
```

- DB file lives at `app.getPath('userData')/music-manager.db`.
- **Repositories are the only modules that import `client.ts`.** Services call
  repositories; nothing else touches SQL/Drizzle directly.
- **Sync strategy** (filesystem = source of truth): every track row stores its absolute
  `filePath` and `mtimeMs`. On scan, `scanner.service` walks each row in
  `libraryFolders`, diffs against the DB:
  - file on disk, not in DB → insert (read tags via `metadata.service`)
  - file in DB, `mtimeMs` changed → re-read tags, update row
  - file in DB, missing on disk → remove (or mark `missingSince` for a grace period
    before hard delete, to tolerate temporarily unmounted drives)
- The DB must be safely deletable at any time; the next scan rebuilds it.

### 2.7 Background tasks — `workers/`

```
src/main/workers/
└── libraryScan/
    ├── worker.ts              # entry point run inside a worker_thread
    └── scanLibrary.task.ts    # walks dirs + reads tags, posts progress messages
```

- CPU-heavy work (scanning thousands of files, reading tags) runs in a `worker_thread`,
  never on the main thread.
- The worker `postMessage`s progress; `library.ipc.ts` forwards it to the renderer via the
  `IPC_CHANNELS.library.scanProgress` event channel.
- Start with Node's built-in `worker_threads`. If multiple concurrent task types are
  needed later, introduce a small pool wrapper (or `piscina`) — don't add that dependency
  preemptively.

### 2.8 Platform-specific implementations — adapter pattern

Used when a **feature exists on every platform but its implementation differs**, or when
a **feature only exists on some platforms**.

```
src/main/services/<feature>/
├── <feature>.service.ts        # public API — platform-agnostic, this is what callers use
├── <feature>.types.ts          # the adapter contract every platform file must satisfy
├── <feature>.darwin.ts
├── <feature>.win32.ts
├── <feature>.linux.ts          # optional
└── <feature>.unsupported.ts    # fallback for platforms without an implementation
```

File suffixes match `process.platform` values exactly (`darwin`, `win32`, `linux`) — no
`mac`/`win`/`windows` aliases, to avoid ambiguity.

```ts
// src/main/services/revealInFolder/revealInFolder.types.ts
export interface RevealInFolderAdapter {
  reveal(path: string): Promise<void>
}
```

```ts
// src/main/services/revealInFolder/revealInFolder.service.ts
import type { RevealInFolderAdapter } from './revealInFolder.types'
import { darwinAdapter } from './revealInFolder.darwin'
import { win32Adapter } from './revealInFolder.win32'
import { unsupportedAdapter } from './revealInFolder.unsupported'

const adapters: Partial<Record<NodeJS.Platform, RevealInFolderAdapter>> = {
  darwin: darwinAdapter,
  win32: win32Adapter
}

const adapter = adapters[process.platform] ?? unsupportedAdapter

export const revealInFolderService: RevealInFolderAdapter = adapter
```

- Callers (IPC handlers, menu actions) only ever import `<feature>.service.ts` — they
  never branch on `process.platform` themselves.
- If a feature is **only available on some platforms** and the _renderer_ needs to know
  (to hide a button, etc.), add a flag to `PlatformCapabilities`
  (`src/shared/constants/capabilities.ts`), computed once at startup from
  `process.platform`, and exposed via preload as `window.electronAPI.platform.capabilities`.
- If the platform difference is **a single constant value** (e.g. title bar style — see
  the existing `windows/titleBar.ts`), a small inline `process.platform` check is fine.
  The adapter pattern is for _behavioral_ differences with real logic, not for config
  values.
- This pattern lives **inside the feature's own `services/<feature>/` folder** — there is
  no separate top-level `platform/` directory. Everything about a feature, including its
  per-OS implementations, stays colocated.

---

## 3. Preload (`src/preload/`)

```
src/preload/
├── index.ts        # contextBridge.exposeInMainWorld('electronAPI', api)
└── api/
    ├── fs.api.ts
    ├── library.api.ts
    ├── player.api.ts
    └── index.ts     # const api = {...}; export type ElectronAPI = typeof api
```

```ts
// src/preload/api/fs.api.ts
import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc/channels'
import type { SelectDirectoryResponse } from '@shared/ipc/contracts/fs.contract'

export const fsApi = {
  selectDirectory: (): Promise<SelectDirectoryResponse> =>
    ipcRenderer.invoke(IPC_CHANNELS.fs.selectDirectory)
}
```

```ts
// src/preload/api/index.ts
const api = {
  fs: fsApi,
  library: libraryApi,
  platform: {
    os: process.platform,
    capabilities: getCapabilities() // from @shared/constants/capabilities
  }
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('electronAPI', api)
```

```ts
// src/renderer/src/env.d.ts
import type { ElectronAPI } from '../../preload/api'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

**Why this is "validated":** `Window['electronAPI']` is `typeof api`, the exact object
passed to `contextBridge.exposeInMainWorld`. If `api` doesn't satisfy what a contract
declares, TypeScript fails the build — there's no separate hand-written `Window`
declaration that can drift out of sync.

**Runtime guard:** add a one-line check in each renderer entry point
(`windows/*/main.tsx`) that throws/logs clearly if `window.electronAPI` is `undefined`
before rendering. This turns a broken/missing preload (e.g. a regression like the one
fixed in the "restore app-drag utility" commit) into an immediate, obvious error instead
of a silent `undefined` crash deep in a component.

---

## 4. Renderer (`src/renderer/`)

```
src/renderer/
├── index.html
├── about.html
└── src/
    ├── windows/        # one entry per window
    ├── features/       # colocated, per-domain modules
    ├── shared/          # renderer-only shared layer
    └── env.d.ts
```

### 4.1 `windows/` — entry points

```
src/renderer/src/windows/
├── main/
│   ├── main.tsx
│   └── App.tsx
└── about/
    ├── main.tsx
    └── App.tsx
```

One folder per `.html` entry declared in `electron.vite.config.ts`. These files are
intentionally thin: bootstrap + layout + composition of features. They are the only
renderer files allowed to know which window they're running in.

### 4.2 `features/<feature>/` — colocation

```
src/renderer/src/features/library/
├── components/
├── hooks/
├── api/        # thin wrappers over window.electronAPI.library.* — feature-shaped
├── types/       # feature-only types
└── index.ts     # barrel — only what other features/windows may import
```

A feature can be used from any window (e.g. `player` could appear in both `main` and a
future mini-player window) — features don't know about windows, windows compose features.

### 4.3 `shared/` — renderer-only shared layer

This answers "where do things shared across features live": there are **two** shared
layers, at different scopes. Don't mix them up.

| Content                                                                                         | Location                              | Used by                       |
| ----------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------- |
| IPC channels, contracts, domain models, window ids, capabilities                                | `src/shared/` (repo root)             | `main`, `preload`, `renderer` |
| Reusable UI components (Button, Modal, Table, Tooltip...)                                       | `src/renderer/src/shared/components/` | any feature/window            |
| Generic UI hooks (`useDebounce`, `useOnClickOutside`, `useElectronEvent`)                       | `src/renderer/src/shared/hooks/`      | any feature/window            |
| Formatters/utilities (`formatDuration`, `formatBytes`, sorters)                                 | `src/renderer/src/shared/lib/`        | any feature/window            |
| Renderer-only types shared by 2+ features (view models, not IPC DTOs)                           | `src/renderer/src/shared/types/`      | any feature/window            |
| Design tokens / global styles (existing `primitives.css`, `semantic.css`, `tailwind-theme.css`) | `src/renderer/src/shared/styles/`     | any feature/window            |
| UI-only constants (labels, asset paths)                                                         | `src/renderer/src/shared/constants/`  | any feature/window            |

Rule of thumb: **does this need to exist on the other side of the IPC bridge (main or
preload)?** → `src/shared/` (root). **Is it purely a renderer/UI concern shared by more
than one feature or window?** → `src/renderer/src/shared/`.

### 4.4 Promotion rule

Everything starts colocated inside the feature that first needs it
(`features/<feature>/components|hooks|types/...`). The moment a **second** feature needs
the same thing:

- Renderer-only → move it to `src/renderer/src/shared/<kind>/`.
- Needs to cross IPC, or main needs it too → move it to `src/shared/<kind>/`.

Don't create empty `shared/` subfolders speculatively — they exist only once something
has actually been promoted into them.

---

## 5. Checklists — adding new things

**New IPC channel**

1. Add the channel name to `src/shared/ipc/channels.ts`.
2. Add/extend the contract (zod schema + types) in `src/shared/ipc/contracts/<domain>.contract.ts`.
3. Implement the handler in `src/main/ipc/<domain>/<domain>.ipc.ts`, register it in `registerIpcHandlers.ts`.
4. Expose it in `src/preload/api/<domain>.api.ts`.
5. Consume it from `src/renderer/src/features/<domain>/api/`.

**New window**

1. Add the id to `src/shared/constants/windowIds.ts`.
2. Add the `.html` entry to `electron.vite.config.ts`.
3. Create `src/main/windows/<name>/create<Name>Window.ts`, register it with `windowRegistry`.
4. Create `src/renderer/src/windows/<name>/{main.tsx,App.tsx}`.
5. If it needs to talk to other windows, do it via `windowRegistry.sendTo` + an event channel in `src/shared/ipc`.

**New menu item**

1. Add its id to `src/main/menu/menuIds.ts`.
2. Add the descriptor to the relevant `sections/*.section.ts` (new feature → new `sections/<feature>.section.ts`).
3. Add its handler to `src/main/menu/actions/registry.ts` (or a new `actions/<feature>.actions.ts`).
4. Set `platforms` on the descriptor only if it shouldn't appear everywhere.

**New platform-specific feature**

1. Define the adapter contract in `src/main/services/<feature>/<feature>.types.ts`.
2. Implement one file per supported platform (`.darwin.ts`, `.win32.ts`, `.linux.ts`) + `.unsupported.ts` fallback.
3. `<feature>.service.ts` picks the adapter for `process.platform`.
4. If the renderer must adapt its UI, add a flag to `src/shared/constants/capabilities.ts`.

**New DB table**

1. Add the table to `src/main/db/schema/<table>.schema.ts`, export it from `schema/index.ts`.
2. Generate a migration with drizzle-kit, commit it under `src/main/db/migrations/`.
3. Add a `src/main/db/repositories/<table>.repository.ts`.
4. If the table's rows need to reach the renderer, add the DTO shape to `src/shared/models/`.

**New background task**

1. Add the task entry under `src/main/workers/<task>/`.
2. Define progress/result message shapes in the relevant `src/shared/ipc/contracts/<domain>.contract.ts`.
3. Forward progress from the worker to the renderer via an event channel.

---

## 6. Dependencies to add when implementing this

Not installed yet — add when the corresponding piece is built, not all at once:

- `better-sqlite3`, `drizzle-orm`, `drizzle-zod` (runtime) + `drizzle-kit` (dev) — §2.6
- `zod` (runtime) — IPC contract validation, §1.1
- A tag-reading library (e.g. `music-metadata`) — §2.5, `metadata.service.ts`
