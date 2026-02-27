-- Enable full profile persistence and BOTH role support.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'BOTH';

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS "avatarUrl" text;
