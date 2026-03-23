-- Align challenge progress unlocked countries nullability with Prisma schema.
ALTER TABLE "challenge_progress"
  ALTER COLUMN "unlocked_country_codes" SET DEFAULT ARRAY[]::TEXT[];

UPDATE "challenge_progress"
SET "unlocked_country_codes" = ARRAY[]::TEXT[]
WHERE "unlocked_country_codes" IS NULL;

ALTER TABLE "challenge_progress"
  ALTER COLUMN "unlocked_country_codes" SET NOT NULL;

-- Ensure challenge repair jobs get a safe status default.
ALTER TABLE "challenge_repair_jobs"
  ALTER COLUMN "status" SET DEFAULT 'queued';
