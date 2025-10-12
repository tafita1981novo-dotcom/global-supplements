-- 🔄 AUTO-REFRESH SYSTEM - Run buyer/supplier detection every 3 hours
-- Uses pg_cron extension to automatically fetch real buyers and suppliers

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 🔍 BUYER DETECTION JOB - Every 30 minutes
-- Calls b2b-buyer-detector Edge Function automatically
SELECT cron.schedule(
  'auto-detect-buyers-30min',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://twglceexfetejawoumsr.supabase.co/functions/v1/b2b-buyer-detector',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'action', 'scan_all_platforms',
      'categories', array['health-supplements', 'industrial', 'electronics'],
      'auto_execute', true
    )
  );
  $$
);

-- 🏭 SUPPLIER DETECTION JOB - Every 30 minutes (offset by 15 min)
-- Searches for suppliers after buyers are detected
SELECT cron.schedule(
  'auto-detect-suppliers-30min',
  '15,45 * * * *', -- Every 30 minutes at minute 15 and 45
  $$
  SELECT net.http_post(
    url := 'https://twglceexfetejawoumsr.supabase.co/functions/v1/real-supplier-validator',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'action', 'validate_all_suppliers',
      'auto_refresh', true
    )
  );
  $$
);

-- 🤖 AI NEGOTIATION TRIGGER - Every 30 minutes
-- Checks for new matches and starts AI negotiations
SELECT cron.schedule(
  'auto-start-negotiations',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://twglceexfetejawoumsr.supabase.co/functions/v1/autonomous-negotiator',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'action', 'process_new_opportunities',
      'auto_negotiate', true
    )
  );
  $$
);

-- 📧 EMAIL FOLLOW-UP PROCESSOR - Every 15 minutes
-- Sends scheduled follow-up emails automatically
SELECT cron.schedule(
  'process-email-followups',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://twglceexfetejawoumsr.supabase.co/functions/v1/email-automation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'action', 'process_scheduled_emails'
    )
  );
  $$
);

-- 📊 View cron jobs status
CREATE OR REPLACE VIEW public.automation_status AS
SELECT 
  jobname as job_name,
  schedule,
  active,
  (SELECT count(*) FROM cron.job_run_details WHERE jobid = job.jobid) as total_runs,
  (SELECT max(end_time) FROM cron.job_run_details WHERE jobid = job.jobid) as last_run,
  (SELECT status FROM cron.job_run_details WHERE jobid = job.jobid ORDER BY end_time DESC LIMIT 1) as last_status
FROM cron.job
WHERE jobname LIKE 'auto-%'
ORDER BY jobname;

-- Log automation setup
INSERT INTO system_logs (module, action, success, data) VALUES
('automation', 'cron_jobs_configured', true, 
 '{
   "jobs": [
     {"name": "auto-detect-buyers-30min", "frequency": "every 30 minutes", "action": "scan B2B platforms for buyers"},
     {"name": "auto-detect-suppliers-30min", "frequency": "every 30 minutes", "action": "validate and update suppliers"},
     {"name": "auto-start-negotiations", "frequency": "every 30 minutes", "action": "match buyers with suppliers and start AI negotiation"},
     {"name": "process-email-followups", "frequency": "every 15 minutes", "action": "send scheduled follow-up emails"}
   ],
   "note": "Fully automated broker system - GPT-4 handles everything. Ultra-fast 30min refresh cycle!"
 }'::jsonb);

COMMENT ON VIEW public.automation_status IS '🤖 AUTOMATION MONITOR: Track all cron jobs status and last run times. Shows broker system automation health.';
