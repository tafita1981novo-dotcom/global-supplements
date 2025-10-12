-- CRITICAL: Remove ALL mock/demo data - Broker system requires 100% REAL data only
-- This migration ensures clean slate for real-time API data ingestion

-- 🧹 CLEAN ALL MOCK DATA
-- Remove all pre-inserted demo buyers, negotiations, and dropship partners
-- Real data will come from b2b-buyer-detector edge function running every 3 hours

DELETE FROM public.negotiations WHERE created_at < now();
DELETE FROM public.b2b_buyers WHERE created_at < now();
DELETE FROM public.dropship_partners WHERE created_at < now();

-- Add comment to prevent future mock data insertion
COMMENT ON TABLE public.b2b_buyers IS '🔥 REAL DATA ONLY: Populated automatically by b2b-buyer-detector Edge Function every 3 hours. NO MANUAL INSERTS.';
COMMENT ON TABLE public.negotiations IS '🤖 AI-MANAGED: Created automatically by autonomous-negotiator when opportunities matched. GPT-4 controls all negotiations.';
COMMENT ON TABLE public.dropship_partners IS '🔗 REAL SUPPLIERS ONLY: Validated supplier data from APIs. No demo records allowed.';

-- Log cleanup action
INSERT INTO system_logs (module, action, success, data) VALUES
('data_cleanup', 'remove_all_mock_data', true, 
 '{"reason": "Broker system requires 100% real data", "tables_cleaned": ["b2b_buyers", "negotiations", "dropship_partners"], "timestamp": "' || now()::text || '"}');
