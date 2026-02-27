-- Backfill mentor-created drafts that were previously stored as PROPOSED.
-- This must run in a separate migration/transaction after DRAFT enum is added.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'CircleStatus'
      AND e.enumlabel = 'DRAFT'
  ) THEN
    EXECUTE '
      UPDATE "Circle"
      SET status = ''DRAFT'',
          "updatedAt" = NOW()
      WHERE status = ''PROPOSED''
        AND "mentorId" IS NOT NULL
        AND "mentorId" = "creatorId"
    ';
  END IF;
END $$;
