# Backend Template — Code Audit Report

## Summary

This is a well-structured Node.js/Express/TypeScript backend with solid architectural foundations: clean module boundaries, validated env/config, Zod-based request validation, and a consistent error handling hierarchy. The **single most important issue** is a **race condition in the token refresh flow** — the delete-then-recreate pattern on [RefreshToken](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#44-56) is not wrapped in a transaction, meaning concurrent refresh requests can corrupt session state or cause token theft to go undetected. Secondary concerns are the absence of any test infrastructure and some security hardening gaps around session invalidation.

---

## Findings Table

| # | Dimension | Severity | File / Location | Issue | Recommendation |
|---|-----------|----------|-----------------|-------|----------------|
| 1 | **Robustness** | **Critical** | [auth.service.ts](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#L131-L163) | [refresh()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#131-165) deletes the old refresh token and creates a new one in **two separate queries** — no transaction. Concurrent refresh calls can both delete the same token (one succeeds, one throws P2025) or worse, create dangling tokens. This is also a token‑reuse‑detection gap: if an attacker replays a stolen refresh token after the legitimate user already used it, the system doesn't invalidate the entire session — it just throws [ForbiddenException](file:///home/mira/Workspace/backend-template/src/utils/errors.ts#51-56). | Wrap `delete` + [create](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#24-43) in `prisma.$transaction()`. On P2025 during delete, treat it as potential token theft and **invalidate the entire session** (delete session + all its tokens). |
| 2 | **Robustness** | **High** | [auth.service.ts](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#L103-L128) | [logout()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#103-130) has the same non-transactional delete pattern: it deletes the refresh token, then deletes the session in a separate call. If the second delete fails, the session is orphaned. | Use `prisma.$transaction()` or just delete the session directly (cascading delete on [RefreshToken](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#44-56) will clean up). |
| 3 | **Security** | **High** | [.env](file:///home/mira/Workspace/backend-template/.env) | [.env](file:///home/mira/Workspace/backend-template/.env) contains a **real Neon database connection string** and a **production-grade JWT secret**. While [.gitignore](file:///home/mira/Workspace/backend-template/.gitignore) excludes [.env](file:///home/mira/Workspace/backend-template/.env) and `git ls-files` confirms it's untracked, the file exists on disk with real credentials. If this repo was ever force-pushed or the [.gitignore](file:///home/mira/Workspace/backend-template/.gitignore) was temporarily removed, these secrets would leak. | Rotate the JWT secret and DB password. Ensure [.env](file:///home/mira/Workspace/backend-template/.env) is never committed. Consider using a secrets manager for production. |
| 4 | **Testability** | **High** | Entire codebase | **Zero test files exist.** No test runner, no test config, no test scripts in [package.json](file:///home/mira/Workspace/backend-template/package.json). Services directly import the [prisma](file:///home/mira/Workspace/backend-template/prisma/schema.prisma) singleton, making them impossible to unit test without mocking the module. | Add a test framework (`vitest` or `jest`). Inject `PrismaClient` via constructor instead of importing the singleton. |
| 5 | **Security** | **Medium** | [auth.service.ts](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#L85-L101) | No limit on **concurrent active sessions** per user. An attacker who obtains credentials can create unlimited sessions without the legitimate user knowing. | Add a max-sessions-per-user check in [login()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#85-102). Either block new sessions or revoke the oldest one. |
| 6 | **Robustness** | **Medium** | [auth.service.ts](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#L142) | After `prisma.refreshToken.delete()`, checking `if (!refreshToken)` is dead code — Prisma's `delete` throws `P2025` if the record doesn't exist; it never returns `null`. Same pattern at line 112. | Remove the dead `if (!refreshToken)` checks. The P2025 catch block already handles this case correctly. |
| 7 | **Maintainability** | **Medium** | [auth.service.ts](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#L119-L128), [L154-L163](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#L154-L163) | The error-handling catch blocks in [logout()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#103-130) and [refresh()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#131-165) are **copy-pasted** — identical logic for [HttpException](file:///home/mira/Workspace/backend-template/src/utils/errors.ts#8-34) re-throw, `PrismaClientKnownRequestError` check, and fallback [InternalServerErrorException](file:///home/mira/Workspace/backend-template/src/utils/errors.ts#69-74). | Extract a shared helper, e.g. `handlePrismaError(error, fallbackMsg)`, or use a decorator/wrapper pattern. |
| 8 | **Robustness** | **Medium** | [user.service.ts](file:///home/mira/Workspace/backend-template/src/modules/user/user.service.ts#L73-L81) | [changePassword()](file:///home/mira/Workspace/backend-template/src/modules/user/user.service.ts#54-83) updates the password hash and then deletes all sessions in **two separate queries**. If the session delete fails, the user has a new password but old sessions/tokens remain valid. | Wrap both operations in a `prisma.$transaction()`. |
| 9 | **Maintainability** | **Medium** | [rateLimite.middleware.ts](file:///home/mira/Workspace/backend-template/src/middleware/rateLimite.middleware.ts) | Filename has a **typo**: [rateLimite.middleware.ts](file:///home/mira/Workspace/backend-template/src/middleware/rateLimite.middleware.ts) (should be `rateLimiter`). | Rename to `rateLimiter.middleware.ts`. |
| 10 | **Type Safety** | **Medium** | [apiResponse.ts](file:///home/mira/Workspace/backend-template/src/utils/apiResponse.ts#L3-L9) | `ApiResponse<D, E>` uses fully generic `D` and `E` without constraints. The `success` field can be set to any boolean but the response body always includes it — at 4xx/5xx it should always be `false`. No compile-time enforcement. | Consider a discriminated union: `SuccessResponse<D>` vs `ErrorResponse<E>`, or at minimum constrain `E extends ApiError`. |
| 11 | **Performance** | **Low** | [user.service.ts](file:///home/mira/Workspace/backend-template/src/modules/user/user.service.ts#L54-L57) | [changePassword()](file:///home/mira/Workspace/backend-template/src/modules/user/user.service.ts#54-83) fetches the full user record (`SELECT *` equivalent) just to check the password hash, then does a separate `UPDATE`. | Use `select: { passwordHash: true }` on the `findUnique` call to avoid fetching unnecessary columns. |
| 12 | **Readability** | **Low** | [user.routes.ts](file:///home/mira/Workspace/backend-template/src/modules/user/user.routes.ts#L8) | Variable named `usercontroller` (lowercase 'c') while all other controllers use `camelCase` (`authController`, `sessionController`). | Rename to `userController` for consistency. |
| 13 | **Architecture** | **Low** | [server.ts](file:///home/mira/Workspace/backend-template/src/server.ts#L9-L13) | `app.listen()` is guarded by `env.NODE_ENV === "development"`, but the production export relies on Vercel. If someone runs `NODE_ENV=production node dist/server.js` outside Vercel, nothing starts. | Add a `DEPLOY_TARGET` env var or use a separate entry point for self-hosted production. |
| 14 | **Security** | **Low** | [auth.middleware.ts](file:///home/mira/Workspace/backend-template/src/middleware/auth.middleware.ts#L10-L18) | Access token is read **only** from cookies. No support for `Authorization: Bearer` header. This blocks non-browser clients (mobile apps, Postman without cookie jars, microservices). | Support both `req.cookies["accessToken"]` and `Authorization` header, with cookies taking priority. |
| 15 | **Robustness** | **Low** | [prisma.ts](file:///home/mira/Workspace/backend-template/src/lib/prisma.ts) | Single `PrismaClient` instance with `max: 5` pool connections and no graceful shutdown hook. On serverless cold starts or hot reloads in dev, connections can leak. | Add `process.on('SIGTERM', () => prisma.$disconnect())` and consider a higher pool size for production. |

---

## Top 3 Priority Fixes

### 1. Wrap [refresh()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#131-165) in a Transaction (Critical)

**What:** The [refresh()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#L131-L163) method deletes the old [RefreshToken](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#44-56) and creates a new one in two separate DB calls.

**Why it matters:** In a concurrent scenario (e.g., two browser tabs refresh at the same time), both requests read the same token hash, both try to delete it — one succeeds, one throws. Worse, if an attacker replays a stolen token after the user already refreshed, the correct response is to **invalidate the entire session family** — but the current code just throws a generic [ForbiddenException](file:///home/mira/Workspace/backend-template/src/utils/errors.ts#51-56), leaving the attacker's other session alive.

**Fix:**

```typescript
async refresh(token: string) {
  const tokenHash = hashString(token);

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true },
    });

    if (!existing || existing.expiresAt <= new Date()) {
      // Potential token reuse — nuke the entire session family
      if (existing) {
        await tx.session.delete({ where: { id: existing.sessionId } });
      }
      throw new ForbiddenException("Invalid or expired token");
    }

    await tx.refreshToken.delete({ where: { id: existing.id } });

    const newToken = randomString(64);
    const newTokenHash = hashString(newToken);
    await tx.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        expiresAt: this.calculateExpiry(TOKEN_EXPIRY.REFRESH_TOKEN_MS),
        sessionId: existing.sessionId,
      },
    });

    return {
      accessToken: signJwt({ sub: existing.session.userId }),
      refreshToken: newToken,
    };
  });
}
```

---

### 2. Add Test Infrastructure (High)

**What:** The project has zero tests — no framework, no scripts, no test files.

**Why it matters:** The auth flow has non-trivial logic (timing-safe password checks, token rotation, session management) that is extremely error-prone to change without regression tests. The current tight coupling to the [prisma](file:///home/mira/Workspace/backend-template/prisma/schema.prisma) singleton makes even basic unit testing impossible.

**Fix:**
1. Install `vitest` + `@faker-js/faker` + `supertest`
2. Refactor services to accept `PrismaClient` via constructor injection:
   ```typescript
   export class AuthService {
     constructor(private readonly db: PrismaClient = prisma) {}
     // ... use this.db instead of prisma
   }
   ```
3. Add a `test` script to [package.json](file:///home/mira/Workspace/backend-template/package.json)
4. Start with integration tests for the `POST /api/auth/login` and `POST /api/auth/refresh` flows

---

### 3. Limit Concurrent Sessions per User (Medium)

**What:** There is no cap on how many active sessions a user can have.

**Why it matters:** If credentials are compromised, an attacker can silently create dozens of sessions. The legitimate user has no way to detect this unless they manually check `/api/sessions`. This also means uncontrolled resource growth in the [Session](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#24-43) table.

**Fix (in [auth.service.ts](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts) → [login()](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.service.ts#85-102)):**
```typescript
const MAX_SESSIONS = 5;

const activeSessions = await prisma.session.count({
  where: { userId: user.id, expiresAt: { gt: new Date() } },
});

if (activeSessions >= MAX_SESSIONS) {
  // Delete the oldest session
  const oldest = await prisma.session.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  if (oldest) await prisma.session.delete({ where: { id: oldest.id } });
}
```

---

## What's Done Well

- **Zod everywhere**: Environment validation ([env.ts](file:///home/mira/Workspace/backend-template/src/config/env.ts)), request body validation ([auth.schema.ts](file:///home/mira/Workspace/backend-template/src/modules/auth/auth.schema.ts), [user.schema.ts](file:///home/mira/Workspace/backend-template/src/modules/user/user.schema.ts)), and JWT payload validation ([jwt.ts](file:///home/mira/Workspace/backend-template/src/lib/jwt.ts)) — compile-time types match runtime checks.
- **Timing-safe auth**: `DUMMY_HASH` constant prevents user-enumeration via timing analysis on the login endpoint.
- **Clean module structure**: Each module (auth, user, session) has a consistent `controller → service → schema → routes` pattern that's predictable and easy to navigate.
- **Security basics**: `helmet`, `cors` with specific origin, `httpOnly` cookies, `sameSite` policy, argon2 for password hashing, SHA-256 for refresh tokens, rate limiting on login.
- **Error hierarchy**: The [HttpException](file:///home/mira/Workspace/backend-template/src/utils/errors.ts#8-34) class with [toResponse()](file:///home/mira/Workspace/backend-template/src/utils/errors.ts#25-33) and the centralized [errorMiddleware](file:///home/mira/Workspace/backend-template/src/middleware/error.middleware.ts#14-57) provide consistent error shapes across all endpoints.
- **Cascading deletes**: The Prisma schema uses `onDelete: Cascade` correctly for `Session → RefreshToken` and `User → Session`, preventing orphan records.

---

## Optional / Nice-to-Have

| Item | Rationale |
|------|-----------|
| **Add structured logging** (e.g., `pino`) | `console.log`/`console.error` calls don't include timestamps, request IDs, or log levels. The `req.id` is generated but never logged. |
| **Expired session cleanup cron** | Expired sessions and refresh tokens accumulate indefinitely. Add a scheduled job or a Prisma middleware to purge them. |
| **Add `outDir` to [tsconfig.json](file:///home/mira/Workspace/backend-template/tsconfig.json)** | The `build` script runs `tsc` but there's no `outDir` configured, so compiled JS files land alongside source files. |
| **OpenAPI / Swagger spec** | No API documentation exists. Consider `@ts-rest` or `zod-openapi` to generate it from existing Zod schemas. |
| **CSRF protection** | Cookie-based auth without CSRF tokens is vulnerable if `sameSite` is set to `"none"` in production (which it currently is for cross-origin). |
