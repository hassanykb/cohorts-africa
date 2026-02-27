-- Make BOTH the default user role and backfill existing mentor/mentee users.
ALTER TABLE "User"
ALTER COLUMN role SET DEFAULT 'BOTH';

UPDATE "User"
SET role = 'BOTH',
    "updatedAt" = NOW()
WHERE role IN ('MENTOR', 'MENTEE');
