-- 🤖 AI BROKER SYSTEM - Messages & Commissions Tables
-- Complete automated broker system where GPT-4 negotiates and tracks commissions

-- 💬 MESSAGES TABLE - Complete conversation history
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('ai_broker', 'buyer', 'supplier')),
  recipient TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('email', 'proposal', 'counter_offer', 'contract', 'payment_request')),
  subject TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  response_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 💰 COMMISSIONS TABLE - Track broker earnings
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  buyer_company TEXT NOT NULL,
  supplier_company TEXT,
  product_name TEXT NOT NULL,
  sale_amount NUMERIC(12,2) NOT NULL,
  supplier_cost NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- 10% default
  commission_amount NUMERIC(12,2) GENERATED ALWAYS AS (sale_amount - supplier_cost) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_proof JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 📊 BROKER PERFORMANCE - Analytics view
CREATE OR REPLACE VIEW public.broker_performance AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_commissions,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_commissions,
  SUM(commission_amount) as total_earnings,
  SUM(commission_amount) FILTER (WHERE status = 'paid') as paid_earnings,
  SUM(commission_amount) FILTER (WHERE status = 'pending') as pending_earnings,
  AVG(commission_amount) as avg_commission,
  MAX(commission_amount) as highest_commission
FROM public.commissions
GROUP BY month
ORDER BY month DESC;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Authenticated users only (internal team)
CREATE POLICY "Authenticated users full access to messages" 
ON public.messages FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users full access to commissions" 
ON public.commissions FOR ALL TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_messages_negotiation ON public.messages(negotiation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender);
CREATE INDEX idx_messages_sent_at ON public.messages(sent_at DESC);
CREATE INDEX idx_commissions_negotiation ON public.commissions(negotiation_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_created_at ON public.commissions(created_at DESC);
CREATE INDEX idx_commissions_buyer ON public.commissions(buyer_company);

-- Updated_at trigger for commissions
CREATE TRIGGER update_commissions_updated_at
BEFORE UPDATE ON public.commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.messages IS '💬 AI BROKER CONVERSATIONS: Complete message history between AI broker, buyers, and suppliers. GPT-4 managed.';
COMMENT ON TABLE public.commissions IS '💰 BROKER EARNINGS: Automatic commission tracking. Calculated as (sale_amount - supplier_cost). Status: pending → confirmed → paid.';
COMMENT ON VIEW public.broker_performance IS '📊 PERFORMANCE DASHBOARD: Monthly broker earnings analytics and KPIs.';
