-- ============================================
-- SISTEMA DE MAPEAMENTO DE FORNECEDORES
-- Mapeia produtos em 100+ APIs de fornecedores
-- Confirma preço/quantidade/prazo ANTES de negociar
-- ============================================

-- 1. APIs de Fornecedores (100+ fontes)
CREATE TABLE IF NOT EXISTS supplier_apis (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  api_name VARCHAR NOT NULL, -- "Alibaba API", "Global Sources API", "Made-in-China API"
  api_endpoint VARCHAR,
  tier INTEGER, -- 1=Alto volume, 2=Médio, 3=Baixo
  supports_direct_api BOOLEAN DEFAULT false, -- Negocia via API?
  estimated_suppliers INTEGER, -- Quantidade de fornecedores
  estimated_monthly_revenue DECIMAL(15,2), -- Revenue estimado
  categories TEXT[], -- ["supplements", "beauty", "medical"]
  countries TEXT[], -- ["China", "India", "USA"]
  status VARCHAR DEFAULT 'active', -- active, inactive, testing
  credentials JSONB, -- API keys e configs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mapeamentos de Produtos em Fornecedores
CREATE TABLE IF NOT EXISTS supplier_product_mappings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  supplier_api_id VARCHAR REFERENCES supplier_apis(id),
  
  -- Dados do Fornecedor
  supplier_name VARCHAR,
  supplier_id VARCHAR, -- ID na API do fornecedor
  supplier_country VARCHAR,
  supplier_rating DECIMAL(3,2), -- 0-5.0
  supplier_credibility_score INTEGER, -- 0-100
  
  -- Produto Confirmado
  product_name VARCHAR,
  product_match_score INTEGER, -- 0-100 (quão similar ao pedido)
  unit_price DECIMAL(15,2),
  moq INTEGER, -- Minimum Order Quantity
  max_quantity INTEGER,
  
  -- Prazo e Entrega
  delivery_time_days INTEGER,
  delivery_method VARCHAR, -- "Sea Freight", "Air Freight", "Express"
  can_deliver_by DATE, -- Data limite de entrega
  
  -- Comissão
  broker_commission_percent DECIMAL(5,2), -- % de comissão
  broker_commission_usd DECIMAL(15,2), -- Comissão em USD
  
  -- Status
  mapping_status VARCHAR DEFAULT 'pending', -- pending, confirmed, rejected
  confirmed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Negociações Paralelas (Comprador + Múltiplos Fornecedores)
CREATE TABLE IF NOT EXISTS parallel_negotiations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  
  -- Negociação com Comprador
  buyer_negotiation_id VARCHAR,
  buyer_status VARCHAR, -- negotiating, waiting_response, agreed, rejected
  buyer_last_message TIMESTAMPTZ,
  buyer_agreed_price DECIMAL(15,2),
  buyer_agreed_quantity INTEGER,
  buyer_delivery_deadline DATE,
  
  -- Negociações com Fornecedores (simultâneas)
  supplier_negotiations JSONB, -- Array de {supplier_id, status, price, quantity, delivery}
  active_suppliers INTEGER DEFAULT 0, -- Quantos fornecedores estão sendo negociados
  
  -- Seleção do Melhor Fornecedor
  selected_supplier_id VARCHAR,
  selection_reason TEXT, -- GPT-4 explica por que escolheu
  selection_criteria JSONB, -- {max_commission: 45%, credibility: 95, delivery: 10 days before deadline}
  
  -- Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  buyer_agreed_at TIMESTAMPTZ,
  supplier_selected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 4. Avaliação de Riscos em Tempo Real
CREATE TABLE IF NOT EXISTS risk_assessments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  parallel_negotiation_id VARCHAR REFERENCES parallel_negotiations(id),
  
  -- Tipo de Risco
  risk_type VARCHAR, -- price_mismatch, delivery_delay, supplier_unreliable, payment_risk, compliance_issue
  risk_level VARCHAR, -- low, medium, high, critical
  risk_score INTEGER, -- 0-100
  
  -- Detalhes do Risco
  risk_description TEXT,
  risk_details JSONB, -- {buyer_price: 50, supplier_price: 55, gap: -5, margin_loss: "10%"}
  
  -- Auto-Resolução
  auto_resolution_attempted BOOLEAN DEFAULT false,
  auto_resolution_strategy TEXT, -- GPT-4 explica o que tentou
  auto_resolution_success BOOLEAN,
  
  -- Ação Manual Necessária?
  requires_manual_intervention BOOLEAN DEFAULT false,
  manual_intervention_id VARCHAR, -- FK para manual_interventions
  
  -- Decisão Final
  final_decision VARCHAR, -- continue, abort, wait, resolved
  decision_reason TEXT,
  
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 5. Intervenções Manuais (Alertas com Botões)
CREATE TABLE IF NOT EXISTS manual_interventions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  risk_assessment_id VARCHAR REFERENCES risk_assessments(id),
  rfq_id VARCHAR REFERENCES rfq_inbox(id),
  
  -- Alerta
  alert_title VARCHAR, -- "Risco Crítico: Fornecedor não entrega no prazo"
  alert_message TEXT,
  alert_severity VARCHAR, -- warning, critical
  
  -- Ações Disponíveis
  available_actions JSONB, -- [{"action": "find_alternative_supplier", "label": "Buscar Outro Fornecedor"}, {"action": "abort", "label": "Abortar Negociação"}]
  
  -- Resposta do Usuário
  user_action VARCHAR, -- find_alternative_supplier, abort, ignore, etc
  user_response_at TIMESTAMPTZ,
  user_notes TEXT,
  
  -- Auto-Abandono
  timeout_minutes INTEGER DEFAULT 120, -- 2 horas para responder
  auto_abandoned_at TIMESTAMPTZ,
  abandonment_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR DEFAULT 'pending' -- pending, user_responded, auto_abandoned, resolved
);

-- 6. Critérios de Seleção de Fornecedores
CREATE TABLE IF NOT EXISTS supplier_selection_criteria (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Pesos dos Critérios (0-100)
  max_commission_weight INTEGER DEFAULT 40, -- 40% importância
  credibility_weight INTEGER DEFAULT 30, -- 30% importância
  delivery_speed_weight INTEGER DEFAULT 20, -- 20% importância
  product_match_weight INTEGER DEFAULT 10, -- 10% importância
  
  -- Limites Mínimos
  min_credibility_score INTEGER DEFAULT 70, -- Mínimo 70/100
  min_commission_percent DECIMAL(5,2) DEFAULT 10.00, -- Mínimo 10%
  max_delivery_delay_days INTEGER DEFAULT 0, -- Deve entregar ANTES do prazo
  min_product_match_score INTEGER DEFAULT 85, -- Produto 85% similar
  
  -- Configurações
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR -- 'gpt4_learning' ou 'user'
);

-- Inserir critérios padrão
INSERT INTO supplier_selection_criteria (id) 
VALUES ('default_criteria_v1') 
ON CONFLICT DO NOTHING;

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_supplier_mappings_rfq ON supplier_product_mappings(rfq_id);
CREATE INDEX IF NOT EXISTS idx_parallel_negotiations_rfq ON parallel_negotiations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_rfq ON risk_assessments(rfq_id);
CREATE INDEX IF NOT EXISTS idx_manual_interventions_pending ON manual_interventions(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_supplier_apis_tier ON supplier_apis(tier, status);

COMMENT ON TABLE supplier_apis IS 'APIs de fornecedores mapeadas (Alibaba, Global Sources, etc)';
COMMENT ON TABLE supplier_product_mappings IS 'Produtos confirmados em fornecedores com preço/prazo ANTES de negociar';
COMMENT ON TABLE parallel_negotiations IS 'Negociações simultâneas: comprador + múltiplos fornecedores';
COMMENT ON TABLE risk_assessments IS 'GPT-4 monitora riscos em tempo real, auto-resolve ou aborta';
COMMENT ON TABLE manual_interventions IS 'Alertas com botões para usuário resolver manualmente';
COMMENT ON TABLE supplier_selection_criteria IS 'Critérios para escolher melhor fornecedor (comissão, credibilidade, prazo)';
