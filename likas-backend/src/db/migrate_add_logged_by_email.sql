-- Migration: Add logged_by_email column to flood_incidents
-- This captures the unique official email (registered_email) of the authenticated user

-- Step 1: Add column as nullable first
ALTER TABLE flood_incidents
ADD COLUMN logged_by_email VARCHAR(100);

-- Step 2: Set default value for existing records
UPDATE flood_incidents
SET logged_by_email = 'legacy@unknown.gov.ph'
WHERE logged_by_email IS NULL;

-- Step 3: Make it NOT NULL now that all records have a value
ALTER TABLE flood_incidents
ALTER COLUMN logged_by_email SET NOT NULL;

-- Step 4: Set default for future inserts (though the application will always provide a value)
ALTER TABLE flood_incidents
ALTER COLUMN logged_by_email SET DEFAULT '';

COMMENT ON COLUMN flood_incidents.logged_by_email IS 'The registered_email of the authenticated user who logged this incident (e.g., manila.mdrrmo@gov.ph, manila.barangay-693@gov.ph)';
