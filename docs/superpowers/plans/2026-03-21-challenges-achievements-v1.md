# Challenge and Achievements V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-ready V1 challenge system at `/dashboard/challenges` with one hardcoded challenge (`Asian top cuisines`) and milestone/completion achievements.

**Architecture:** Keep challenge definitions hardcoded in code while persisting per-user progress and unlock history in Postgres via Prisma. Update challenge state during `restaurants.create` using a monotonic write-once model for V1, and expose a dedicated tRPC read endpoint for the challenge page.

**Tech Stack:** Next.js App Router, TypeScript, Prisma + Postgres (Neon), tRPC + Zod, TanStack Query, Tailwind CSS, Vitest, Bun.

---

## Scope Check

This spec is one subsystem (challenge + achievement flow for a single challenge) and does not need decomposition into multiple independent plans.

## File Structure and Responsibilities

### New files

- `lib/challenges/catalog.ts`
  - Hardcoded V1 challenge definition (ID, title, target countries, milestones, UI labels).
- `lib/challenges/logic.ts`
  - Pure helper functions: country normalization, target matching, unlock diff, milestone/completion transitions.
- `lib/challenges/service.ts`
  - Database-backed challenge orchestration for read and write paths.
- `lib/challenges/metrics.ts`
  - Centralized emitters for `challenge_started` and `achievement_unlocked` events.
- `lib/challenges/repair-jobs.ts`
  - Queue helper for lightweight challenge recompute jobs.
- `trpc/routers/challenges.ts`
  - Protected tRPC query endpoint(s) for `/dashboard/challenges` view model.
- `app/dashboard/challenges/page.tsx`
  - Dedicated challenge page shell and server-side data prefetch.
- `components/challenges-content.tsx`
  - Presentational/client component for challenge progress UI and badges.
- `components/ui/sonner.tsx`
  - Shared app toaster wrapper.
- `__test__/challenges/logic.test.ts`
  - Unit tests for pure challenge logic.
- `__test__/challenges/service.test.ts`
  - Service tests (idempotency, monotonic behavior, failure path contracts).
- `__test__/trpc/challenges-router.test.ts`
  - Router output contract test for challenges endpoint.
- `__test__/trpc/restaurants-challenge.test.ts`
  - Integration-level test for `restaurants.create` challenge unlock behavior.
- `__test__/dashboard-challenges-page.test.tsx`
  - Page/component rendering test for challenge card states.
- `__test__/add-restaurant-modal.test.tsx`
  - Modal feedback test for unlock toast behavior.

### Modified files

- `prisma/schema.prisma`
  - Add `ChallengeProgress`, `ChallengeAchievementUnlock`, and `ChallengeRepairJob` models.
- `prisma/migrations/<timestamp>_add_challenge_progress/migration.sql`
  - Generated migration for new challenge tables and indexes.
- `trpc/routers/_app.ts`
  - Register `challenges` router.
- `trpc/routers/restaurants.ts`
  - Call challenge update service from `create` mutation and return unlock payload.
- `trpc/routers/schemas.ts`
  - Add explicit Zod schemas for challenge payloads used in tRPC outputs.
- `components/dashboard-sidebar.tsx`
  - Add `Challenges` navigation item linking to `/dashboard/challenges`.
- `components/add-restaurant-modal.tsx`
  - Consume unlock payload and show toast/inline feedback after successful create.
- `app/layout.tsx`
  - Mount shared toaster provider.

### Notes

- Keep progress monotonic in V1: delete/update operations do not decrement challenge state.
- Keep country matching strict and normalized to uppercase ISO alpha-2 values.

---

### Task 1: Build challenge catalog + pure logic with TDD

**Files:**
- Create: `lib/challenges/catalog.ts`
- Create: `lib/challenges/logic.ts`
- Test: `__test__/challenges/logic.test.ts`

- [ ] **Step 1: Write failing tests for challenge logic**

```ts
import { describe, expect, test } from "vitest";
import {
  isTargetCountry,
  normalizeCountryCode,
  getNewUnlocks,
} from "@/lib/challenges/logic";

describe("challenge logic", () => {
  test("normalizes lowercase country codes", () => {
    expect(normalizeCountryCode("jp")).toBe("JP");
  });

  test("matches only configured target countries", () => {
    expect(isTargetCountry("JP")).toBe(true);
    expect(isTargetCountry("US")).toBe(false);
  });

  test("returns milestone and completion unlocks only once", () => {
    expect(
      getNewUnlocks({
        previousCount: 2,
        nextCount: 3,
        alreadyUnlocked: [],
      })
    ).toContain("milestone_3");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- __test__/challenges/logic.test.ts`
Expected: FAIL (missing module exports / implementation)

- [ ] **Step 3: Write minimal implementation**

```ts
export function normalizeCountryCode(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}
```

Implement remaining helpers in `lib/challenges/logic.ts` and V1 config in `lib/challenges/catalog.ts`.

- [ ] **Step 4: Run logic tests to verify pass**

Run: `bun run test -- __test__/challenges/logic.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add __test__/challenges/logic.test.ts lib/challenges/catalog.ts lib/challenges/logic.ts
git commit -m "feat: add challenge catalog and core unlock logic"
```

### Task 2: Add Prisma models and migration for challenge persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_challenge_progress/migration.sql`
- Test: `__test__/challenges/service.test.ts`

- [ ] **Step 1: Write failing service contract test for persistence assumptions**

```ts
test("progress rows are unique per user and challenge", async () => {
  // expect duplicate upsert path to keep one logical row
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `bun run test -- __test__/challenges/service.test.ts`
Expected: FAIL (service/model not implemented)

- [ ] **Step 3: Add Prisma models and generate migration**

Run: `bunx prisma migrate dev --name add_challenge_progress`

Required schema entities:
- `ChallengeProgress` with: `userId`, `challengeId`, `enrolledAt`,
  `unlockedCountryCodes`, `uniqueTargetCount`, `completedAt`, `createdAt`,
  `updatedAt`, and unique `(userId, challengeId)`
- `ChallengeAchievementUnlock` with: `userId`, `challengeId`,
  `achievementKey`, `unlockedAt`, and unique
  `(userId, challengeId, achievementKey)`
- `ChallengeRepairJob` with: `userId`, `challengeId`, `reason`, `status`,
  `createdAt`, `updatedAt` (for lightweight recompute queueing)

- [ ] **Step 4: Regenerate client and verify migration status**

Run: `bun run db:generate`
Expected: Prisma client generated successfully

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add challenge progress persistence models"
```

### Task 3: Implement challenge service (read/write paths) with tests

**Files:**
- Create: `lib/challenges/service.ts`
- Create: `lib/challenges/metrics.ts`
- Create: `lib/challenges/repair-jobs.ts`
- Test: `__test__/challenges/service.test.ts`

- [ ] **Step 1: Expand failing tests for monotonic/idempotent behavior**

```ts
test("qualifying new country increments once", async () => {
  // same country twice -> count remains stable after first unlock
});

test("page-visit enrollment only counts restaurants created after enrolledAt", async () => {
  // createdAt <= enrolledAt should not count
});

test("first-touch qualifying create counts within same request", async () => {
  // enrollment and first qualifying restaurant are processed atomically
});

test("concurrent qualifying creates for same country unlock only once", async () => {
  // Promise.all(...) race should produce one unlock and one milestone row
});

test("delete path does not decrement challenge progress", async () => {
  // monotonic write-once behavior
});

test("challenge-write failure does not fail primary restaurant path contract", async () => {
  // service returns non-blocking warning signal
});

test("enrollment emits challenge_started metric", async () => {
  // first enrollment path emits exactly once
});

test("new unlock emits achievement_unlocked metric", async () => {
  // include challengeId and achievement key payload
});

test("challenge failure enqueues repair job", async () => {
  // ChallengeRepairJob row is created with pending status
});
```

- [ ] **Step 2: Run tests to verify fail**

Run: `bun run test -- __test__/challenges/service.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement enrollment boundary rules in service**

Implement in `lib/challenges/service.ts`:
- page-visit enrollment gate: only `restaurant.createdAt > enrolledAt` counts
- first-touch create path: enrollment and first qualifying count in same request

- [ ] **Step 4: Implement service functions and repair signaling**

Implement in `lib/challenges/service.ts`:
- `getChallengeSummaryForUser(userId)`
- `applyRestaurantCreateToChallenges({ userId, countryCode, createdAt })`
- `enqueueChallengeRepairJob({ userId, challengeId, reason })`

Implement in supporting files:
- `lib/challenges/repair-jobs.ts` with DB insert helper for `ChallengeRepairJob`
- `lib/challenges/metrics.ts` with typed event emitters for
  `challenge_started` and `achievement_unlocked`

Use transaction semantics:
- challenge tables mutate in one transaction
- return warnings/repair flags on challenge failure path (non-blocking contract)

- [ ] **Step 5: Run service tests to verify pass**

Run: `bun run test -- __test__/challenges/service.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add __test__/challenges/service.test.ts lib/challenges/service.ts lib/challenges/repair-jobs.ts lib/challenges/metrics.ts
git commit -m "feat: add challenge service with idempotent monotonic updates"
```

### Task 4: Emit metrics for starts and unlocks

**Files:**
- Modify: `lib/challenges/service.ts`
- Modify: `lib/challenges/metrics.ts`
- Test: `__test__/challenges/service.test.ts`

- [ ] **Step 1: Write failing metric assertions**

```ts
test("challenge_started emitted on first enrollment", async () => {
  // expect event emitter called once
});

test("achievement_unlocked emitted for new unlock keys", async () => {
  // expect payload includes challengeId + key
});
```

- [ ] **Step 2: Run tests to verify fail**

Run: `bun run test -- __test__/challenges/service.test.ts`
Expected: FAIL

- [ ] **Step 3: Wire metrics emitters in service flow**

Emit:
- `challenge_started` when a progress row is first created
- `achievement_unlocked` for each newly inserted unlock key

- [ ] **Step 4: Run tests to verify pass**

Run: `bun run test -- __test__/challenges/service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/challenges/service.ts lib/challenges/metrics.ts __test__/challenges/service.test.ts
git commit -m "feat: emit challenge start and unlock metrics"
```

### Task 5: Wire tRPC routers (challenges read + restaurant create unlocks)

**Files:**
- Create: `trpc/routers/challenges.ts`
- Modify: `trpc/routers/_app.ts`
- Modify: `trpc/routers/restaurants.ts`
- Modify: `trpc/routers/schemas.ts`
- Test: `__test__/trpc/challenges-router.test.ts`
- Test: `__test__/trpc/restaurants-challenge.test.ts`

- [ ] **Step 1: Write failing router contract tests**

```ts
test("challenges.getV1Summary returns strict output shape", async () => {
  // validate target countries, progress count, unlocked achievements
});

test("restaurants.create returns unlock payload when milestone reached", async () => {
  // ensure output includes achievement keys when crossing threshold
});
```

- [ ] **Step 2: Run tests to verify fail**

Run: `bun run test -- __test__/trpc/challenges-router.test.ts __test__/trpc/restaurants-challenge.test.ts`
Expected: FAIL

- [ ] **Step 3: Add/validate Zod schemas for challenge outputs**

Update `trpc/routers/schemas.ts` with explicit challenge output schemas.

- [ ] **Step 4: Implement `trpc/routers/challenges.ts` query handler**

Run: `bun run test -- __test__/trpc/challenges-router.test.ts`
Expected: still FAIL until router registration is complete

- [ ] **Step 5: Register router in `trpc/routers/_app.ts` and integrate in `restaurants.create`**

Add `challengesRouter` protected query (for page model), register it in `_app.ts`, and update `restaurants.create` output schema to include optional unlock payload.

- [ ] **Step 6: Run router tests to verify pass**

Run: `bun run test -- __test__/trpc/challenges-router.test.ts __test__/trpc/restaurants-challenge.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add trpc/routers/_app.ts trpc/routers/challenges.ts trpc/routers/restaurants.ts trpc/routers/schemas.ts __test__/trpc/challenges-router.test.ts __test__/trpc/restaurants-challenge.test.ts
git commit -m "feat: expose challenges router and unlock payload in restaurant create"
```

### Task 6: Build `/dashboard/challenges` UI and navigation

**Files:**
- Create: `app/dashboard/challenges/page.tsx`
- Create: `components/challenges-content.tsx`
- Modify: `components/dashboard-sidebar.tsx`
- Test: `__test__/dashboard-challenges-page.test.tsx`

- [ ] **Step 1: Write failing page rendering test**

```tsx
test("renders asian top cuisines progress card", () => {
  // expect heading, progress count, target list
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `bun run test -- __test__/dashboard-challenges-page.test.tsx`
Expected: FAIL (route/component missing)

- [ ] **Step 3: Implement challenge card component UI**

Create `components/challenges-content.tsx` and render progress/checklist/badges from typed props.

- [ ] **Step 4: Implement route page shell and data prefetch**

Create `app/dashboard/challenges/page.tsx` and wire query hydration.

- [ ] **Step 5: Add sidebar navigation item**

Modify `components/dashboard-sidebar.tsx` to include `/dashboard/challenges`.

Use existing dashboard styling patterns and keep UI simple (text badges/chips, checklist, progress bar).

- [ ] **Step 6: Run page test to verify pass**

Run: `bun run test -- __test__/dashboard-challenges-page.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/challenges/page.tsx components/challenges-content.tsx components/dashboard-sidebar.tsx __test__/dashboard-challenges-page.test.tsx
git commit -m "feat: add dedicated dashboard challenges page"
```

### Task 7: Add unlock feedback via toast and modal integration

**Files:**
- Create: `components/ui/sonner.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/add-restaurant-modal.tsx`
- Test: `__test__/add-restaurant-modal.test.tsx`

- [ ] **Step 1: Write failing interaction test for unlock feedback trigger**

```tsx
test("shows unlock feedback when create mutation returns achievements", async () => {
  // mock mutation response with unlock keys, assert feedback hook called
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `bun run test -- __test__/add-restaurant-modal.test.tsx`
Expected: FAIL (toast integration not wired)

- [ ] **Step 3: Implement toaster mount + mutation response handling**

Mount toaster in root layout and use returned unlock payload to show concise feedback.

- [ ] **Step 4: Run focused tests to verify pass**

Run: `bun run test -- __test__/add-restaurant-modal.test.tsx __test__/trpc/restaurants-challenge.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ui/sonner.tsx app/layout.tsx components/add-restaurant-modal.tsx
git commit -m "feat: add challenge unlock feedback toast"
```

### Task 8: End-to-end verification and docs sync

**Files:**
- Modify: `docs/superpowers/specs/2026-03-21-challenges-achievements-v1-design.md` (only if implementation-driven clarifications are needed)

- [ ] **Step 1: Run full targeted test suite**

Run:
- `bun run test -- __test__/challenges/logic.test.ts`
- `bun run test -- __test__/challenges/service.test.ts`
- `bun run test -- __test__/trpc/challenges-router.test.ts __test__/trpc/restaurants-challenge.test.ts`
- `bun run test -- __test__/dashboard-challenges-page.test.tsx __test__/add-restaurant-modal.test.tsx`

Expected: all PASS

- [ ] **Step 2: Run lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Step 3: Run build smoke check**

Run: `bun run build`
Expected: successful production build

- [ ] **Step 4: Sanity-check manual flow**

Run app and verify manually:
- Add qualifying country restaurant from dashboard modal
- Confirm `/dashboard/challenges` progress increments once per target country
- Confirm milestone/completion feedback appears

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: ship v1 asian top cuisines challenges and achievements"
```

---

## Execution Notes

- Use `@superpowers/subagent-driven-development` for implementation execution.
- Keep changes DRY and focused; do not add social/leaderboard scope in this plan.
- Keep challenge matching strictly by normalized country code.
- Maintain V1 monotonic progress behavior.
