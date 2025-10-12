-- ========================================
-- CRON JOB: AUTOMAÇÃO 24/7 A CADA 30 MINUTOS
-- ========================================
-- Este cron roda automation-scheduler que busca RFQs de TODAS as 40 fontes globais

-- Enable pg_cron extension (required for cron jobs)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing cron jobs (if any)
SELECT cron.unschedule('automation-rfq-pipeline-30min');

-- Create cron job: Run every 30 minutes
SELECT cron.schedule(
  'automation-rfq-pipeline-30min',  -- Job name
  '*/30 * * * *',                    -- Every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://twglceexfetejawoumsr.supabase.co/functions/v1/automation-scheduler',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'action', 'run_full_pipeline_all_sources'
    )
  );
  $$
);

-- Verify cron job is created
SELECT * FROM cron.job WHERE jobname = 'automation-rfq-pipeline-30min';

-- ========================================
-- TRACKING TABLE: Automation Runs
-- ========================================
CREATE TABLE IF NOT EXISTS automation_runs (
  id SERIAL PRIMARY KEY,
  run_timestamp TIMESTAMPTZ DEFAULT NOW(),
  total_rfqs_found INTEGER DEFAULT 0,
  total_suppliers_matched INTEGER DEFAULT 0,
  total_deals_negotiated INTEGER DEFAULT 0,
  total_commission_earned DECIMAL(12,2) DEFAULT 0,
  sources_active TEXT[],
  execution_time_ms INTEGER,
  status TEXT,
  error_message TEXT,
  results JSONB
);

-- ========================================
-- COMMISSION PAYMENTS TABLE (PAYONEER ONLY)
-- ========================================
CREATE TABLE IF NOT EXISTS commission_payments (
  id SERIAL PRIMARY KEY,
  deal_id VARCHAR(255),
  buyer_company VARCHAR(255),
  supplier_company VARCHAR(255),
  product_name TEXT,
  deal_value DECIMAL(12,2),
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(12,2),
  payment_method VARCHAR(50) DEFAULT 'payoneer', -- Always 'payoneer'
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  payoneer_id VARCHAR(255) DEFAULT '99133638', -- Conta Payoneer fixa
  payment_currency VARCHAR(10) DEFAULT 'USD',
  payment_date TIMESTAMPTZ,
  confirmation_code VARCHAR(255),
  supplier_payoneer_email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_commission_payments_status ON commission_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_commission_payments_deal_id ON commission_payments(deal_id);

-- ========================================
-- DEAL TRACKING TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS deals (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rfq_id VARCHAR(255),
  buyer_id INTEGER REFERENCES b2b_buyers(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  product_name TEXT,
  quantity VARCHAR(100),
  unit_price DECIMAL(10,2),
  total_value DECIMAL(12,2),
  commission_rate DECIMAL(5,2),
  estimated_commission DECIMAL(12,2),
  buyer_max_price DECIMAL(10,2),
  supplier_cost DECIMAL(10,2),
  margin DECIMAL(10,2),
  deal_status VARCHAR(50) DEFAULT 'negotiating', -- negotiating, closed, delivered, paid
  negotiation_messages JSONB,
  delivery_tracking JSONB,
  payment_terms TEXT,
  delivery_deadline DATE,
  actual_delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  commission_paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(deal_status);
CREATE INDEX IF NOT EXISTS idx_deals_buyer ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_supplier ON deals(supplier_id);

-- ========================================
-- FUNCTION: Log Automation Run
-- ========================================
CREATE OR REPLACE FUNCTION log_automation_run(
  p_total_rfqs INTEGER,
  p_total_suppliers INTEGER,
  p_total_deals INTEGER,
  p_commission DECIMAL,
  p_sources TEXT[],
  p_exec_time INTEGER,
  p_status TEXT,
  p_results JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id INTEGER;
BEGIN
  INSERT INTO automation_runs (
    total_rfqs_found,
    total_suppliers_matched,
    total_deals_negotiated,
    total_commission_earned,
    sources_active,
    execution_time_ms,
    status,
    results
  ) VALUES (
    p_total_rfqs,
    p_total_suppliers,
    p_total_deals,
    p_commission,
    p_sources,
    p_exec_time,
    p_status,
    p_results
  )
  RETURNING id INTO v_run_id;
  
  RETURN v_run_id;
END;
$$;

-- ========================================
-- FUNCTION: Create Commission Payment
-- ========================================
CREATE OR REPLACE FUNCTION create_commission_payment(
  p_deal_id VARCHAR,
  p_buyer_company VARCHAR,
  p_supplier_company VARCHAR,
  p_product_name TEXT,
  p_deal_value DECIMAL,
  p_commission_rate DECIMAL,
  p_commission_amount DECIMAL,
  p_payment_method VARCHAR DEFAULT 'payoneer'
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_payment_id INTEGER;
  v_payoneer_id VARCHAR;
  v_mercury_id VARCHAR;
BEGIN
  -- Get payment account IDs from environment
  v_payoneer_id := current_setting('app.settings.payoneer_id', true);
  v_mercury_id := current_setting('app.settings.mercury_account_id', true);
  
  INSERT INTO commission_payments (
    deal_id,
    buyer_company,
    supplier_company,
    product_name,
    deal_value,
    commission_rate,
    commission_amount,
    payment_method,
    payoneer_id,
    mercury_account_id,
    payment_status
  ) VALUES (
    p_deal_id,
    p_buyer_company,
    p_supplier_company,
    p_product_name,
    p_deal_value,
    p_commission_rate,
    p_commission_amount,
    p_payment_method,
    v_payoneer_id,
    v_mercury_id,
    'pending'
  )
  RETURNING id INTO v_payment_id;
  
  RETURN v_payment_id;
END;
$$;

-- ========================================
-- Success message
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Cron job criado: automation-rfq-pipeline-30min';
  RAISE NOTICE '⏰ Executa a cada 30 minutos';
  RAISE NOTICE '🔄 Busca RFQs de TODAS as 40 fontes globais';
  RAISE NOTICE '💰 Tracking de comissões: Payoneer + Mercury Bank';
END $$;
