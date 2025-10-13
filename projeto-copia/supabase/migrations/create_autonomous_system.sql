-- =====================================================
-- SISTEMA AUTÔNOMO COMPLETO - GPT-4 Controlando Tudo
-- =====================================================

-- 1. RFQ Inbox - RFQs normalizados de 100 APIs
CREATE TABLE IF NOT EXISTS rfq_inbox (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  source_api VARCHAR NOT NULL,
  source_id VARCHAR NOT NULL,
  buyer_name VARCHAR NOT NULL,
  buyer_country VARCHAR,
  product_description TEXT NOT NULL,
  quantity INTEGER,
  budget_usd DECIMAL(15,2),
  deadline DATE,
  contact_method VARCHAR, -- 'api', 'email', 'phone'
  contact_data JSONB, -- API endpoint, email, phone
  raw_data JSONB, -- Dados originais da API
  status VARCHAR DEFAULT 'new', -- new, matched, negotiating, closed, failed
  priority_score DECIMAL(5,2), -- 0-100 calculado por GPT-4
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_rfq_status ON rfq_inbox(status);
CREATE INDEX idx_rfq_priority ON rfq_inbox(priority_score DESC);
CREATE INDEX idx_rfq_source ON rfq_inbox(source_api);

-- 2. Autonomous Runs - Execuções do sistema autônomo
CREATE TABLE IF NOT EXISTS autonomous_runs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type VARCHAR NOT NULL, -- 'rfq_fetch', 'negotiation', 'learning', 'payment_sync'
  status VARCHAR DEFAULT 'running', -- running, completed, failed
  rfqs_fetched INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  revenue_generated DECIMAL(15,2) DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  gpt4_decisions INTEGER DEFAULT 0, -- Quantas decisões GPT-4 tomou
  learning_events INTEGER DEFAULT 0, -- Eventos de aprendizado gerados
  execution_log JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_runs_status ON autonomous_runs(status);
CREATE INDEX idx_runs_started ON autonomous_runs(started_at DESC);

-- 3. AI Decision State - Estado das decisões da IA
CREATE TABLE IF NOT EXISTS ai_decision_state (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  decision_type VARCHAR NOT NULL, -- 'match_supplier', 'start_negotiation', 'counter_offer', 'close_deal', 'wait', 'reject'
  decision_rationale TEXT, -- Por que GPT-4 tomou essa decisão
  context_data JSONB, -- Contexto usado na decisão
  outcome VARCHAR, -- 'success', 'failed', 'pending'
  confidence_score DECIMAL(5,2), -- 0-100
  gpt4_model VARCHAR DEFAULT 'gpt-4',
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decision_rfq ON ai_decision_state(rfq_id);
CREATE INDEX idx_decision_type ON ai_decision_state(decision_type);

-- 4. Learning Events - Sistema de aprendizado contínuo
CREATE TABLE IF NOT EXISTS learning_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR NOT NULL, -- 'negotiation_success', 'negotiation_failed', 'pricing_accepted', 'pricing_rejected'
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  decision_id VARCHAR REFERENCES ai_decision_state(id),
  outcome_data JSONB NOT NULL, -- Resultado da negociação
  lessons_learned TEXT, -- O que GPT-4 aprendeu
  strategy_adjustment JSONB, -- Ajustes na estratégia
  impact_score DECIMAL(5,2), -- Impacto no aprendizado (0-100)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_type ON learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_impact ON learning_events(impact_score DESC);

-- 5. Negotiation Strategies - Estratégias aprendidas
CREATE TABLE IF NOT EXISTS negotiation_strategies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  buyer_country VARCHAR,
  product_category VARCHAR,
  language VARCHAR,
  cultural_notes TEXT,
  timing_rules JSONB, -- Quando falar, quando esperar
  success_rate DECIMAL(5,2) DEFAULT 0, -- 0-100
  total_uses INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  avg_deal_value DECIMAL(15,2),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategy_country ON negotiation_strategies(buyer_country);
CREATE INDEX IF NOT EXISTS idx_strategy_success ON negotiation_strategies(success_rate DESC);

-- 6. Conversation Timelines - Timing de conversas
CREATE TABLE IF NOT EXISTS conversation_timelines (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  participant_type VARCHAR NOT NULL, -- 'buyer', 'supplier', 'system'
  message_type VARCHAR, -- 'initial_contact', 'quote', 'counter_offer', 'question', 'answer'
  message_content TEXT,
  language VARCHAR,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  response_expected_at TIMESTAMPTZ, -- Quando esperar resposta
  response_received_at TIMESTAMPTZ,
  response_time_hours DECIMAL(10,2),
  cultural_context JSONB, -- Contexto cultural do timing
  ai_should_wait BOOLEAN DEFAULT false, -- GPT-4 deve esperar?
  wait_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_timeline_rfq ON conversation_timelines(rfq_id);
CREATE INDEX IF NOT EXISTS idx_timeline_wait ON conversation_timelines(ai_should_wait, response_expected_at);

-- 7. Payoneer Transactions - Controle financeiro em tempo real
CREATE TABLE IF NOT EXISTS payoneer_transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  payoneer_id VARCHAR DEFAULT '99133638',
  transaction_type VARCHAR NOT NULL, -- 'commission_in', 'payment_out', 'fee', 'refund'
  amount_usd DECIMAL(15,2) NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  counterparty_name VARCHAR,
  counterparty_country VARCHAR,
  description TEXT,
  payoneer_reference VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending, completed, failed
  balance_after DECIMAL(15,2),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payoneer_type ON payoneer_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_payoneer_status ON payoneer_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payoneer_synced ON payoneer_transactions(synced_at DESC);

-- 8. Financial Alerts - Alertas financeiros
CREATE TABLE IF NOT EXISTS financial_alerts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR NOT NULL, -- 'low_balance', 'payment_delay', 'commission_discrepancy', 'high_revenue_day'
  severity VARCHAR DEFAULT 'medium', -- low, medium, high, critical
  message TEXT NOT NULL,
  transaction_id VARCHAR REFERENCES payoneer_transactions(id),
  current_balance DECIMAL(15,2),
  recommended_action TEXT, -- O que GPT-4 recomenda fazer
  auto_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_severity ON financial_alerts(severity, created_at DESC);

-- 9. API Direct Negotiations - Negociações diretas via API (SEM humanos)
CREATE TABLE IF NOT EXISTS api_negotiations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  api_source VARCHAR NOT NULL, -- 'indiamart', 'alibaba', 'sam_gov', etc
  api_endpoint VARCHAR, -- Endpoint específico da negociação
  request_data JSONB, -- Dados enviados via API
  response_data JSONB, -- Resposta da API
  negotiation_round INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'active', -- active, waiting_response, closed, failed
  gpt4_generated BOOLEAN DEFAULT true, -- GPT-4 gerou a negociação?
  language VARCHAR,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  response_received_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_neg_rfq ON api_negotiations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_api_neg_status ON api_negotiations(status);

-- 10. System Evolution Metrics - Métricas de evolução do sistema
CREATE TABLE IF NOT EXISTS evolution_metrics (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE DEFAULT CURRENT_DATE,
  total_rfqs_processed INTEGER DEFAULT 0,
  successful_negotiations INTEGER DEFAULT 0,
  failed_negotiations INTEGER DEFAULT 0,
  avg_response_time_hours DECIMAL(10,2),
  avg_deal_value_usd DECIMAL(15,2),
  total_revenue_usd DECIMAL(15,2),
  gpt4_accuracy_score DECIMAL(5,2), -- 0-100
  learning_events_count INTEGER DEFAULT 0,
  strategies_improved INTEGER DEFAULT 0,
  api_sources_active INTEGER DEFAULT 0,
  payoneer_balance_usd DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_date ON evolution_metrics(metric_date DESC);

-- 11. Atualizar tabela de APIs com suporte a negociação direta
ALTER TABLE rfq_api_credentials 
ADD COLUMN IF NOT EXISTS supports_direct_negotiation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS negotiation_endpoint VARCHAR,
ADD COLUMN IF NOT EXISTS negotiation_method VARCHAR; -- 'POST', 'PUT', 'PATCH'

COMMENT ON TABLE rfq_inbox IS 'RFQs normalizados de todas as 100 APIs';
COMMENT ON TABLE ai_decision_state IS 'Todas as decisões tomadas pelo GPT-4';
COMMENT ON TABLE learning_events IS 'Sistema de aprendizado contínuo - GPT-4 aprende com cada negociação';
COMMENT ON TABLE conversation_timelines IS 'Timing inteligente - GPT-4 sabe quando falar e quando esperar';
COMMENT ON TABLE payoneer_transactions IS 'Controle em tempo real da receita Payoneer (ID: 99133638)';
COMMENT ON TABLE api_negotiations IS 'Negociações diretas via API - 100% automático, SEM humanos';
COMMENT ON TABLE evolution_metrics IS 'Sistema evolui e melhora automaticamente a cada dia';
