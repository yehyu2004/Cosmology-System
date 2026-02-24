# AGENTS.md — Cosmology TA Platform

## Coding Standards & Rules

All agents modifying this codebase **must** follow these rules.

---

### 1. Architecture

#### 1.1 Max ~400 Lines Per File
No single component or page file may exceed ~400 lines. Split into subcomponents if approaching this limit.

#### 1.2 Shared Type System
Define all data types in `src/types/` (one file per domain: `assignment.ts`, `submission.ts`, `user.ts`). Derive from Prisma types where possible.

#### 1.3 Service Layer for Business Logic
API route handlers should only: (1) parse/validate input, (2) call a service function, (3) return the response. Extract logic into `src/lib/services/`.

---

### 2. Security

#### 2.1 Path Traversal Prevention
When constructing file paths from user input, use `path.resolve()` and verify the resolved path stays within the expected directory.

#### 2.2 Validate All Numeric Inputs
Scores and points must be bounds-checked before saving. Never trust raw client values.

#### 2.3 Input Size Limits
Every API route accepting text input must enforce maximum lengths via Zod `.max()`.

| Field type | Max length |
|---|---|
| `title` | 200 chars |
| `description` | 5,000 chars |
| `feedback` | 10,000 chars |
| `rubric` | 10,000 chars |

---

### 3. Database

#### 3.1 Use Prisma Migrations, Never `db push`
Always use `prisma migrate dev` for schema changes. Never use `prisma db push --accept-data-loss`.

#### 3.2 Add Indexes for Query Patterns
Add `@@index` for columns used in WHERE/ORDER BY clauses.

#### 3.3 Use `Decimal` for Scores
All score/points fields should use `Decimal @db.Decimal(10, 2)` for precision.

---

### 4. API Layer

#### 4.1 Use Zod for Input Validation
Every API route must validate its request body with a Zod schema.

#### 4.2 Standard Response Envelope
```ts
// Success:
return NextResponse.json({ data: submission });
// Error:
return NextResponse.json({ error: "Not found" }, { status: 404 });
```

#### 4.3 Differentiated Error Responses
| Status | When to use |
|---|---|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Wrong role |
| 404 | Not found |
| 500 | Server error |

---

### 5. Frontend

#### 5.1 No `window.alert()` or `window.confirm()`
Use shadcn `AlertDialog` for confirmations, `sonner` for notifications.

#### 5.2 Accessibility
Use semantic HTML (`<button>` for actions, `<a>` for navigation). All inputs need labels.

---

### 6. Error Handling

#### 6.1 Never Silently Swallow Errors
Every `.catch()` must log the error with context:
```ts
sendEmail(...).catch(err => console.error("[email:send]", { error: err.message }));
```

#### 6.2 Structured Logging
Format: `console.error("[module:action]", { key: value })`.

---

### 7. Code Quality

#### 7.1 Clean Code
- Functions < 20 lines, single responsibility
- Descriptive names, no generic `data`/`result`/`item`
- No magic numbers — extract named constants
- Guard clauses over nested conditionals

#### 7.2 Keep README.md Up to Date
When making changes that affect features, rubric, project structure, or tech stack, update `README.md` to reflect those changes in the same commit.

#### 7.3 No AI Slop
- No comments restating obvious code
- No unnecessary try/catch on trusted paths
- No `as any` without justification
- Style must match surrounding code

---

### 8. API Auth Middleware

Shared auth helpers in `src/lib/api-auth.ts`:

```ts
import { requireApiAuth, requireApiRole, isErrorResponse } from "@/lib/api-auth";

// Auth only
const auth = await requireApiAuth();
if (isErrorResponse(auth)) return auth;

// Auth + role guard
const auth = await requireApiRole(["TA", "PROFESSOR", "ADMIN"]);
if (isErrorResponse(auth)) return auth;
```
