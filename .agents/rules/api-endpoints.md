---
trigger: always_on
---

# API Endpoint Conventions

Every API endpoint in this project follows the structure below without exception.

---

## Directory structure

Each endpoint group lives under `src/app/api/[domain]/[resource]/`:

```
src/app/api/[domain]/[resource]/
├── route.ts                          ← HTTP handler only
├── [resource].server.ts              ← Service class (business logic)
├── [resource].server.test.ts         ← Tests for the service
└── dtos/
    └── [resource].dto.ts             ← Zod schemas + exported TypeScript types
```

**Examples from the codebase:**
```
src/app/api/fs/dialog/
├── route.ts
├── dialog.server.ts
├── dialog.server.test.ts
└── dtos/
    └── dialog.dto.ts
```

---

## File naming — camelCase with dot-notation for type suffix

| File | Pattern |
|---|---|
| Service | `[resource].server.ts` |
| Service tests | `[resource].server.test.ts` |
| DTO | `[resource].dto.ts` |
| Route handler | `route.ts` (required by Next.js) |

Folder names: camelCase (`dialog/`, `openDialog/`, `dtos/`).

---

## Shared error infrastructure (`src/lib/`)

### `src/lib/httpErrors/index.ts`
Defines the base `HttpError` class and all domain-specific exception subclasses.
All exceptions set their own prototype correctly for `instanceof` checks.

```ts
export class HttpError extends Error {
  public readonly statusCode: number;
  constructor(statusCode: number, message: string) { ... }
}

// Domain-specific exceptions (extend HttpError):
export class NotFoundException extends HttpError { ... }          // 404
export class BadRequestError extends HttpError { ... }            // 400
export class InternalServerErrorException extends HttpError { ... } // 500
export class UnsupportedPlatformError extends HttpError { ... }   // 500
export class UserCanceledDialogException extends HttpError { ... } // 409
// Add new exceptions here as new domains require them
```

### `src/lib/errorResponse/index.ts`
`handleHttpError(error: unknown): NextResponse` — the single function that turns any error into a standardized NextResponse. Used in every route handler's catch block.

Handles: `HttpError` → status from instance, `ZodError` → 400 with issues formatted, `unknown` → 500.

---

## Standard response shapes

**Always use these — no exceptions:**

```ts
// Success
NextResponse.json(
  { success: true, message: "Descripción de lo que ocurrió", data: result },
  { status: 200 }
)

// Error (handled automatically by handleHttpError)
{ success: false, message: "Mensaje de error", data: null }
```

---

## DTOs — Zod schema file (`dtos/[resource].dto.ts`)

One file per endpoint group. Export the schema, the inferred type, and (where applicable) derived schemas (e.g. `updateDto = createDto.partial()`).

```ts
import { z } from "zod";

export const openDialogBodyDto = z.object({
  prompt: z.string({ error: "..." }).min(10, { error: "..." }),
}).strict();

export type OpenDialogBodyDto = z.infer<typeof openDialogBodyDto>;

export const openDialogResponseDto = z.object({
  path: z.string().nonempty(),
});

export type OpenDialogResponseDto = z.infer<typeof openDialogResponseDto>;
```

Rules:
- Use `.strict()` on body schemas to reject unknown fields
- Always export both the schema (for `.parse()`) and the inferred type (for TypeScript)
- Response DTOs do NOT use `.strict()` — they only assert the shape of what we return

---

## Service class (`[resource].server.ts`)

```ts
class ResourceServer {
  public async doSomething(input: ResourceBodyDto): Promise<ResourceResponseDto> {
    try {
      const parsed = resourceBodyDto.parse(input);   // throws ZodError if invalid
      // ... business logic ...
      return resourceResponseDto.parse(result);      // validates output shape
    } catch (error) {
      throw this.handleServiceError(error, { internal: "Mensaje específico." });
    }
  }

  private handleServiceError(
    error: unknown,
    customMessages?: { internal?: string }
  ): Error {
    if (error instanceof HttpError || error instanceof ZodError) return error;
    return new InternalServerErrorException(
      (error as Error).message ?? customMessages?.internal ?? "Error interno."
    );
  }
  // ... private helpers ...
}

export const resourceServer = new ResourceServer(); // singleton
```

Rules:
- One public method per HTTP verb the route supports
- `handleServiceError()` is always private and always present
- Export as a **singleton instance**, not the class itself
- Private methods for OS-specific logic, exec wrappers, etc.
- The service imports its own DTOs from `./dtos/[resource].dto.ts`

---

## Route handler (`route.ts`)

```ts
import { NextRequest, NextResponse } from "next/server";
import { handleHttpError } from "@/lib/errorResponse";
import { resourceServer } from "@/app/api/[domain]/[resource]/[resource].server";
import type { ResourceBodyDto } from "@/app/api/[domain]/[resource]/dtos/[resource].dto";

const DEFAULT_BODY: ResourceBodyDto = { /* safe defaults */ };

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ResourceBodyDto = await request.json().catch(() => DEFAULT_BODY);
    const data = await resourceServer.doSomething(body);
    return NextResponse.json(
      { success: true, message: "Operación completada", data },
      { status: 200 }
    );
  } catch (error) {
    return handleHttpError(error);
  }
}
```

Rules:
- **Always** `NextRequest` / `NextResponse` — never `Request` / `Response`
- **Always** import from `@/` aliases — no relative paths for cross-directory imports
- One try/catch per exported HTTP function
- catch always returns `handleHttpError(error)` — nothing else
- No business logic inside the handler — only: parse body → call service → return response
- Include a GET health check for each domain group

---

## Testing

- Test file: `[resource].server.test.ts` collocated with `[resource].server.ts`
- Mock `child_process` with `jest.mock("child_process", ...)`
- Access private methods in tests via bracket notation: `server["privateMethod"]()`
- Mock `next/server` via `__mocks__/next-server.ts` at project root
- No `@jest-environment node` needed when using the root `__mocks__/next-server.ts`

---

## Import aliases

All imports use `@/` — never `../../../`:
```ts
import { handleHttpError } from "@/lib/errorResponse";
import { HttpError } from "@/lib/httpErrors";
import { dialogServer } from "@/app/api/fs/dialog/dialog.server";
```
