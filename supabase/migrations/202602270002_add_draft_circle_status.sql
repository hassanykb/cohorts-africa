-- Add a dedicated DRAFT status for circles so drafts are role-agnostic.
ALTER TYPE "CircleStatus" ADD VALUE IF NOT EXISTS 'DRAFT';

-- Backfill mentor-created drafts that were previously stored as PROPOSED.
UPDATE "Circle"
SET status = 'DRAFT',
    "updatedAt" = NOW()
WHERE status = 'PROPOSED'
  AND "mentorId" IS NOT NULL
  AND "mentorId" = "creatorId";
