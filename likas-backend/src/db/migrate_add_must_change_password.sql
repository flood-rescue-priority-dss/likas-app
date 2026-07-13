-- Migration: add users.must_change_password
-- Safe to run multiple times (IF NOT EXISTS guard).
-- Existing rows (admins + legacy accounts) get FALSE so they are never
-- forced through the change-password flow.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'must_change_password'
    ) THEN
        ALTER TABLE users
            ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Added users.must_change_password (default FALSE)';
    ELSE
        RAISE NOTICE 'users.must_change_password already exists — skipping';
    END IF;
END $$;
