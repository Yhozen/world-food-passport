# World Food Passport - Neon Auth + Prisma Spec

## Current State Review

- Next.js App Router with server actions and client components.
- Neon Auth integrated with middleware, API handler, and auth UI routes.
- Prisma schema + client added; server actions use Prisma.
- UI is mostly complete: landing, dashboard map + drawer, restaurant detail, add modal, stats, photo upload.

## Goals

- Replace raw SQL with Prisma ORM.
- Use Neon Auth (embedded UI; Neon default routes) instead of custom auth.
- Keep Vercel Blob for photos (public URLs, immutable records).
- Preserve current UI/UX and functionality, focusing on backend + auth correctness.

## Decisions Locked In

- Neon Auth only (no local users table).
- Embedded Neon Auth UI; Neon default auth routes.
- Protect only `/dashboard` and subroutes with middleware.
- Restaurants allow duplicates (multiple visits as separate rows).
- Cuisine tags remain free-form strings.
- Ratings are integers 1-5.
- Photos stored only in Blob; no EXIF metadata.
- Visit counts are bucketed for map shading; all restaurants count.
- Online-only (no offline drafts).
- First-class geo (lat/long stored when available).
- Prisma migrate workflow (schema + migrations).
- Map choice: simplest/maintainable (keep current SVG unless proven costly).
- Hard deletes (no soft delete).
- No tests for MVP.
- Remove `/sign-in` and `/sign-up` pages; use Neon routes.
- Countries list stays static in code.
- Visit date stored as local date (no timezone).
- Blob paths include restaurant id.
- Prisma client module should be `lib/prisma.ts`.

## TODO List

1. **Prisma setup** (done)
   - `prisma/schema.prisma` added with mapped snake_case columns.
   - Prisma client in `lib/prisma.ts` and generated client.
2. **Auth integration** (done)
   - Neon Auth middleware for `/dashboard` routes.
   - Auth API handler and auth route pages added.
3. **Data access refactor** (done)
   - `lib/actions.ts` rebuilt on Prisma + Neon Auth.
4. **Blob upload path** (done)
   - `uploadPhoto` uses `world-food-passport/{userId}/{restaurantId}/{timestamp}-{filename}`.
5. **Cleanup** (done)
   - Removed `lib/auth.ts`, `lib/db.ts`, `/sign-in`, `/sign-up`.
6. **Remaining**
   - Run `bunx prisma migrate dev` once `DATABASE_URL` is set.
   - Remove or archive `scripts/setup-database.sql` after migration if desired.

## Data Model (Current)

- **Restaurant**
  - id (String, cuid/uuid)
  - userId (String, Neon Auth subject)
  - name, countryCode, countryName, city, address
  - latitude, longitude
  - cuisineTags (String[])
  - visitDate (Date only)
  - rating (Int 1-5)
  - createdAt, updatedAt
- **Review**
  - id, restaurantId, userId
  - content
  - createdAt, updatedAt
- **Photo**
  - id, restaurantId, userId
  - storageUrl
  - caption
  - uploadedAt
- **CountriesVisited**
  - id, userId, countryCode, countryName
  - visitCount
  - firstVisitedAt, updatedAt

## Auth + Session

- Neon Auth handles sign-in/sign-up on its default routes.
- JWT claims can be used in UI for display (email/name), but app identity is Neon subject.
- Middleware protects `/dashboard` and subroutes; server actions still verify user context.

## Open Questions (TBD)

- `countries_visited` behavior when count drops to 0: delete row or keep with 0.
- Map SVG complexity: confirm no need to reduce detail for performance.

## Implementation Notes

- Use Prisma migrations for all schema changes.
- Keep static country data in `lib/countries.ts`.
- Avoid adding new social/public features; app remains private-only.
