# Challenge and Achievements V1 Design

## Topic

Initial implementation of `Challenge and achievements` with one hardcoded challenge:
`Asian top cuisines`.

## Why now

The landing page already signals strong user interest in challenges and achievements.
This design introduces a small but durable foundation so we can ship quickly, learn,
and extend later without redoing core data flow.

## Goals

1. Ship a real V1 at `/dashboard/challenges`.
2. Keep logic simple and deterministic (no fuzzy cuisine/tag matching).
3. Use country-based progress for the first challenge.
4. Support milestone achievements and a final completion achievement.
5. Keep architecture extensible for additional challenges later.

## Non-Goals (V1)

1. No friend comparison or leaderboards.
2. No repeatable or seasonal challenges.
3. No retroactive/backfill progress from existing data.
4. No fuzzy matching of cuisine tags.
5. No custom illustrated badge art.

## Locked Product Decisions

- Completion rule: distinct target countries.
- Challenge size: 5 targets.
- V1 targets: China, Japan, Korea, Thailand, India.
- Achievements: milestones + final badge.
- Milestones: `1 / 3 / 5`.
- Surface area: dedicated page at `/dashboard/challenges`.
- Matching source: restaurant country (not cuisine tags).
- Lifecycle: one-time permanent challenge.
- UX fidelity: simple text badges/chips.
- Unlock feedback: inline update + toast.
- Social scope: solo only.
- Progress counting: unique target countries only.
- Extensibility path: hardcoded config + DB progress table(s).
- Deletions: keep progress unlocked (monotonic progress in V1).

## Approach Chosen

Hybrid foundation:

- Hardcode challenge definitions in TypeScript.
- Persist user progress and achievement unlocks in DB.
- Update progress when new restaurants are created.

This gives fast V1 delivery while leaving clear paths for additional challenges.

## Architecture Overview

### 1) Challenge Catalog (hardcoded)

Create a small challenge definition module (for example: `lib/challenges/v1.ts`) with:

- `challengeId`: `asian-top-cuisines`
- `title`: `Asian top cuisines`
- `targetCountries`: `CN`, `JP`, `KR`, `TH`, `IN`
- `milestones`: `[1, 3, 5]`
- metadata used by UI (description, labels)

This keeps rule changes simple and avoids premature challenge-definition tables.

### 2) Persistence (minimal, extensible)

Add two tables:

1. `challenge_progress`
   - One row per user per challenge.
   - Stores enrolled time, unlocked target country codes, counts, completion time.
2. `challenge_achievement_unlocks`
   - One row per unlocked achievement key.
   - Immutable unlock history.

Suggested fields:

#### `challenge_progress`

- `id` UUID
- `user_id` UUID
- `challenge_id` text
- `enrolled_at` timestamp
- `unlocked_country_codes` text[] (default `[]`)
- `unique_target_count` int (default `0`)
- `completed_at` timestamp nullable
- `created_at`, `updated_at`
- unique: `(user_id, challenge_id)`

#### `challenge_achievement_unlocks`

- `id` UUID
- `user_id` UUID
- `challenge_id` text
- `achievement_key` text
- `unlocked_at` timestamp
- unique: `(user_id, challenge_id, achievement_key)`

Achievement keys for V1:

- `milestone_1`
- `milestone_3`
- `milestone_5`
- `completion`

Note: `milestone_5` and `completion` can unlock in the same event.

### 3) Enrollment and no-backfill behavior

Enrollment occurs at first challenge touch (page visit or qualifying new log).
Only restaurants created after `enrolled_at` are eligible for progress.

This preserves the "no backfill" requirement while avoiding a broad migration of old
records.

Enrollment boundary rule:

- Page-visit enrollment: eligible logs must have `restaurant.created_at > enrolled_at`.
- First-touch via qualifying create: create enrollment and evaluate that same
  restaurant in the same request; treat that restaurant as eligible.

### 4) Progress updates on restaurant creation

Integrate with `trpc/routers/restaurants.ts` in the `create` mutation:

1. Create restaurant normally.
2. Run challenge progress evaluator for the active challenge(s):
   - If country not in target list, no-op.
   - If target already unlocked for user, no-op.
   - Else append country code, increment count.
3. Compute newly reached milestones and insert unlock rows (idempotent).
4. If count reaches 5 and `completed_at` is null, set `completed_at`.
5. Return unlock payload for client-side feedback.

Country matching contract:

- Normalize input to uppercase ISO-3166-1 alpha-2 before matching.
- Non-ISO and empty country values are safe no-ops.
- Matching is exact code equality against `targetCountries` only.

Deletion behavior (locked):

- No challenge state is decremented on restaurant delete/update.
- `unlocked_country_codes`, `unique_target_count`, unlock rows, and
  `completed_at` are write-once and monotonic in V1.

## User Experience

## Route and navigation

- Add page: `/dashboard/challenges`.
- Add sidebar nav item: `Challenges`.

## Page content (single challenge card)

Primary card sections:

1. Header: challenge title + status chip.
2. Progress summary: `X / 5 countries` + progress bar.
3. Target country checklist:
   - China
   - Japan
   - Korea
   - Thailand
   - India
4. Achievement chips:
   - 1/3/5 milestone badges
   - completion badge
5. Last unlock timestamp and small helper text.

Visual style stays aligned with existing dashboard aesthetic.

## Unlock feedback

- Inline state updates on the challenge page.
- Toast when a milestone/completion unlocks.
- If toast system is not present, add a lightweight shadcn-compatible toast layer.

## Data Flow

1. User opens `/dashboard/challenges`.
2. Server query ensures/fetches progress row and returns computed view model.
3. User logs a new restaurant.
4. `restaurants.create` updates challenge state if country qualifies.
5. Client refreshes challenge query and shows unlock feedback.

## Reliability and Error Handling

1. DB uniqueness constraints enforce idempotency under retries/races.
2. Challenge writes run in a single DB transaction scoped to challenge tables
   only.
3. Restaurant creation is committed independently first:
   - If challenge write fails, restaurant creation still succeeds.
   - Emit a non-blocking warning and enqueue a lightweight
     repair/recompute task for that user and challenge.
4. Unknown challenge IDs and malformed config are treated as safe no-ops.

## Testing Strategy

Add focused tests for challenge logic and integration:

1. Unit tests (pure helper functions):
   - target-country match
   - unlock-country dedupe
   - milestone diff calculation
   - completion transition
2. Router-level test:
   - `restaurants.create` unlock behavior for new qualifying countries
   - idempotency (same country repeated)
3. Basic page rendering test for `/dashboard/challenges` with mocked data.
4. Concurrency test:
   - Two concurrent qualifying creates for the same new target country result in
     one country unlock and one milestone unlock row.
5. Failure-path test:
   - Simulated challenge-write failure does not fail `restaurants.create` and a
     warning/repair signal is emitted.
6. Deletion monotonicity test:
   - Deleting a previously counted restaurant does not reduce progress or revoke
     badges.

## Metrics (V1)

Track lightweight events:

- `challenge_started` (progress row created)
- `achievement_unlocked` (with key and challenge id)

Primary success signal: challenge starts rate.

## Future Extension Path

1. Add additional hardcoded challenges in catalog.
2. Later migrate definitions from code to DB if product velocity needs admin control.
3. Add social overlays (friends, comparisons, leaderboards) on top of existing
   progress model.
4. Add optional recompute jobs if we later support rollbacks or rule edits.

## Implementation Notes

- Follow existing tRPC pattern with explicit Zod input/output schemas.
- Keep logic server-side; avoid client trust for unlock decisions.
- Prefer small, reusable helper functions in `lib/challenges/`.
- Preserve existing dashboard visual language and component conventions.
