-- Migration: add barangays.district_id
-- Run this BEFORE running reconcile_and_seed_geo.js
--
-- Why: cities.district_id models City -> District as many-to-one, but the
-- real area "Paco" has barangays split across two districts (District 5 x39,
-- District 6 x4). Storing district_id directly on each barangay row lets
-- district-level filtering stay correct for those 4 barangays even though
-- their city ("Paco") is filed under a single district.
--
-- NOTE: unlike an earlier draft of this migration, this does NOT touch
-- barangays.population. Your live table already uses 0 (not NULL) as the
-- "not yet collected" placeholder with a NOT NULL constraint, so the seed
-- script follows that same convention instead of introducing NULLs.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'barangays'
        AND column_name = 'district_id'
    ) THEN
        ALTER TABLE barangays ADD COLUMN district_id VARCHAR(50) REFERENCES districts(id);
        RAISE NOTICE 'Added barangays.district_id';
    ELSE
        RAISE NOTICE 'barangays.district_id already exists';
    END IF;
END $$;
