-- Migration: Add approval_status to flood_incidents table
-- Run this script to update existing database

-- Add the approval_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='flood_incidents' 
        AND column_name='approval_status'
    ) THEN
        ALTER TABLE flood_incidents 
        ADD COLUMN approval_status VARCHAR(20) DEFAULT 'Pending';
        
        -- Set all existing admin-logged incidents to 'Approved'
        UPDATE flood_incidents 
        SET approval_status = 'Approved' 
        WHERE logged_by_role = 'admin';
        
        -- Set all existing barangay-logged incidents to 'Approved' (retroactive approval)
        UPDATE flood_incidents 
        SET approval_status = 'Approved' 
        WHERE logged_by_role = 'barangay';
        
        RAISE NOTICE 'Successfully added approval_status column and updated existing records';
    ELSE
        RAISE NOTICE 'Column approval_status already exists';
    END IF;
END $$;
