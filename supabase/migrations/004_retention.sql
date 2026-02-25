-- ============================================================
-- 004_retention.sql — Auto-cleanup of old messages
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create a function to delete old messages
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM messages
    WHERE created_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;

-- 2. Schedule the function to run daily (requires pg_cron extension)
-- Note: Some Supabase tiers might require manually enabling this extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule at midnight every day
SELECT cron.schedule('daily-message-cleanup', '0 0 * * *', 'SELECT delete_old_messages()');

-- If pg_cron is not available on your project, you can run this manually:
-- SELECT delete_old_messages();
