-- ==============================================================================
-- FASE 6: Dispatcher da Lista Diária - Lifecycle Type (ADR-000)
-- ==============================================================================

ALTER TABLE actions 
ADD COLUMN IF NOT EXISTS lifecycle_type VARCHAR(20) DEFAULT 'ACTION' 
CHECK (lifecycle_type IN ('ACTION', 'HABIT', 'ROUTINE', 'PROJECT', 'RITUAL'));

UPDATE actions 
SET lifecycle_type = CASE WHEN recurrence_enabled = TRUE THEN 'HABIT' ELSE 'ACTION' END 
WHERE lifecycle_type IS NULL;
