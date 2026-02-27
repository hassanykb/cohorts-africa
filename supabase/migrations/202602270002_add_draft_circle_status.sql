-- Add a dedicated DRAFT status for circles so drafts are role-agnostic.
-- Important: Postgres does not allow using a new enum value in the same transaction
-- where it was added, so the backfill is in the next migration file.
ALTER TYPE "CircleStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
