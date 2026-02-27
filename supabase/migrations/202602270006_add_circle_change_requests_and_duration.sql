-- Add circle duration support and dual-approval change requests.
ALTER TABLE "Circle"
ADD COLUMN IF NOT EXISTS "durationWeeks" integer NOT NULL DEFAULT 4;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ChangeRequestStatus'
  ) THEN
    CREATE TYPE "ChangeRequestStatus" AS ENUM ('PENDING', 'APPLIED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "CircleChangeRequest" (
  id text PRIMARY KEY,
  "circleId" text NOT NULL,
  "proposedById" text NOT NULL,
  "newMaxCapacity" integer,
  "newDurationWeeks" integer,
  notes text,
  status "ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
  "creatorApproved" boolean NOT NULL DEFAULT false,
  "mentorApproved" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "CircleChangeRequest_circleId_fkey"
    FOREIGN KEY ("circleId")
    REFERENCES "Circle"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT "CircleChangeRequest_proposedById_fkey"
    FOREIGN KEY ("proposedById")
    REFERENCES "User"(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CircleChangeRequest_circleId_idx"
  ON "CircleChangeRequest" ("circleId");

CREATE INDEX IF NOT EXISTS "CircleChangeRequest_status_idx"
  ON "CircleChangeRequest" (status);

CREATE INDEX IF NOT EXISTS "CircleChangeRequest_proposedById_idx"
  ON "CircleChangeRequest" ("proposedById");
