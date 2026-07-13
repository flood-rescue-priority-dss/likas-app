-- Add remarks_attachment column to flood_incidents table
ALTER TABLE flood_incidents 
ADD COLUMN remarks_attachment VARCHAR(500);
