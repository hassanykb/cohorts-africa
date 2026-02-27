-- Add WAITLIST status so applications can queue when circles are full.
ALTER TYPE "AppStatus" ADD VALUE IF NOT EXISTS 'WAITLIST';
