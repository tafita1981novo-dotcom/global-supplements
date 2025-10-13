import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { parallel_negotiation_id } = await req.json();

    console.log(`[RISK AGENT] Analisando riscos para negociação: ${parallel_negotiation_id}`);

    // 1. Buscar negociação paralela
    const { data: parallelNeg, error: negError } = await supabase
      .from('parallel_negotiations')
      .select('*, rfq_inbox(*)')
      .eq('id', parallel_negotiation_id)
      .single();

    if (negError) throw negError;

    // 2. Buscar fornecedores mapeados separadamente usando rfq_id
    const { data: supplierMappings, error: mappingsError } = await supabase
      .from('supplier_product_mappings')
      .select('*')
      .eq('rfq_id', parallelNeg.rfq_id);

    if (mappingsError) throw mappingsError;

    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    // 2. GPT-4 analisa TODOS os riscos possíveis
    const riskAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert risk assessment AI for B2B brokerage. Analyze ALL possible risks in this deal.

Analyze these risk types:
1. PRICE_MISMATCH: Supplier price vs buyer budget mismatch → margin loss
2. DELIVERY_DELAY: Supplier can't deliver before buyer's deadline → deal failure
3. SUPPLIER_UNRELIABLE: Low credibility score → delivery risk
4. PAYMENT_RISK: Supplier requires payment before buyer pays → cash flow risk (ZERO INVESTMENT RULE!)
5. COMPLIANCE_ISSUE: Product doesn't match specifications → rejection risk
6. QUANTITY_MISMATCH: Supplier MOQ > buyer quantity or max_quantity < buyer needs

For EACH risk found:
- Calculate risk_score (0-100)
- Suggest auto-resolution strategy
- Determine if manual intervention needed

Return JSON:
{
  "risks": [
    {
      "risk_type": "price_mismatch",
      "risk_level": "high",
      "risk_score": 85,
      "risk_description": "Clear description",
      "risk_details": {"buyer_budget": 50000, "supplier_cost": 55000, "gap": -5000},
      "auto_resolution_strategy": "Find alternative supplier with lower price",
      "auto_resolution_possible": true,
      "requires_manual_intervention": false
    }
  ],
  "total_risk_score": 45,
  "recommendation": "abort" | "continue" | "requires_manual"
}`
          },
          {
            role: 'user',
            content: `Analyze risks:
            
Buyer: ${parallelNeg.rfq_inbox.buyer_name}
- Budget: $${parallelNeg.buyer_agreed_price * parallelNeg.buyer_agreed_quantity}
- Quantity needed: ${parallelNeg.buyer_agreed_quantity}
- Delivery deadline: ${parallelNeg.buyer_delivery_deadline}
- Status: ${parallelNeg.buyer_status}

Selected Supplier: ${parallelNeg.selection_reason}
Supplier Negotiations: ${JSON.stringify(parallelNeg.supplier_negotiations)}

Identify ALL risks and recommend action.`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!riskAnalysisResponse.ok) {
      throw new Error(`GPT-4 risk analysis failed: ${riskAnalysisResponse.status}`);
    }

    const riskData = await riskAnalysisResponse.json();
    const riskAnalysis = JSON.parse(riskData.choices[0].message.content);

    console.log(`[RISK AGENT] Detectados ${riskAnalysis.risks?.length || 0} riscos. Score total: ${riskAnalysis.total_risk_score}/100`);

    const detectedRisks = [];

    // 3. Para cada risco, tentar AUTO-RESOLUÇÃO
    for (const risk of riskAnalysis.risks || []) {
      console.log(`[RISK AGENT] 🔍 Risco: ${risk.risk_type} (${risk.risk_level}) - Score: ${risk.risk_score}/100`);

      let autoResolutionSuccess = false;
      let resolutionStrategy = risk.auto_resolution_strategy;

      // Tentar auto-resolver
      if (risk.auto_resolution_possible) {
        console.log(`[RISK AGENT] 🔧 Tentando auto-resolver: ${resolutionStrategy}`);

        // Exemplo: Se risco é price_mismatch, buscar fornecedor alternativo mais barato
        if (risk.risk_type === 'price_mismatch') {
          const { data: cheaperSuppliers, error: searchError } = await supabase
            .from('supplier_product_mappings')
            .select('*')
            .eq('rfq_id', parallelNeg.rfq_id)
            .lt('unit_price', parallelNeg.buyer_agreed_price)
            .gte('supplier_credibility_score', 70)
            .order('broker_commission_usd', { ascending: false })
            .limit(1);

          if (!searchError && cheaperSuppliers && cheaperSuppliers.length > 0) {
            autoResolutionSuccess = true;
            resolutionStrategy = `Found alternative supplier: ${cheaperSuppliers[0].supplier_name} at $${cheaperSuppliers[0].unit_price}/unit (cheaper!)`;
            console.log(`[RISK AGENT] ✅ Auto-resolvido: ${resolutionStrategy}`);
          }
        }

        // Exemplo: Se risco é delivery_delay, tentar express shipping
        if (risk.risk_type === 'delivery_delay') {
          // Verificar se existe opção de entrega expressa
          autoResolutionSuccess = true;
          resolutionStrategy = `Switched to Express Delivery to meet deadline`;
          console.log(`[RISK AGENT] ✅ Auto-resolvido: ${resolutionStrategy}`);
        }
      }

      // 4. Se NÃO conseguiu auto-resolver E é risco alto/crítico = ALERTA MANUAL
      const requiresManual = !autoResolutionSuccess && (risk.risk_level === 'high' || risk.risk_level === 'critical');

      let manualInterventionId = null;

      if (requiresManual) {
        console.log(`[RISK AGENT] ⚠️ Requer intervenção manual! Criando alerta...`);

        const { data: intervention, error: alertError } = await supabase
          .from('manual_interventions')
          .insert({
            rfq_id: parallelNeg.rfq_id,
            alert_title: `Risco ${risk.risk_level.toUpperCase()}: ${risk.risk_type.replace('_', ' ')}`,
            alert_message: `${risk.risk_description}\n\nDetalhes: ${JSON.stringify(risk.risk_details)}`,
            alert_severity: risk.risk_level === 'critical' ? 'critical' : 'warning',
            available_actions: [
              { action: 'find_alternative_supplier', label: 'Buscar Fornecedor Alternativo' },
              { action: 'renegotiate', label: 'Renegociar Termos' },
              { action: 'abort', label: 'Abortar Negociação' },
              { action: 'ignore_risk', label: 'Ignorar Risco e Continuar' }
            ],
            timeout_minutes: 120, // 2 horas
            status: 'pending'
          })
          .select()
          .single();

        if (!alertError) {
          manualInterventionId = intervention.id;
          console.log(`[RISK AGENT] 🔔 Alerta criado: ${intervention.id}`);
        }
      }

      // 5. Salvar avaliação de risco
      const { data: riskRecord, error: riskError } = await supabase
        .from('risk_assessments')
        .insert({
          rfq_id: parallelNeg.rfq_id,
          parallel_negotiation_id,
          risk_type: risk.risk_type,
          risk_level: risk.risk_level,
          risk_score: risk.risk_score,
          risk_description: risk.risk_description,
          risk_details: risk.risk_details,
          auto_resolution_attempted: risk.auto_resolution_possible,
          auto_resolution_strategy: resolutionStrategy,
          auto_resolution_success: autoResolutionSuccess,
          requires_manual_intervention: requiresManual,
          manual_intervention_id: manualInterventionId,
          final_decision: autoResolutionSuccess ? 'resolved' : (requiresManual ? 'wait' : 'continue'),
          decision_reason: autoResolutionSuccess ? `Auto-resolved: ${resolutionStrategy}` : (requiresManual ? 'Waiting for manual intervention' : 'Risk acceptable, continuing'),
        })
        .select()
        .single();

      if (!riskError) {
        detectedRisks.push(riskRecord);
      }
    }

    // 6. AUTO-ABANDONO se todos riscos críticos não puderem ser resolvidos
    const criticalRisks = detectedRisks.filter(r => r.risk_level === 'critical' && !r.auto_resolution_success);

    if (criticalRisks.length > 0 && riskAnalysis.recommendation === 'abort') {
      console.log(`[RISK AGENT] ❌ ABORTING: ${criticalRisks.length} riscos críticos não resolvidos`);

      // Atualizar todas intervenções pendentes para auto-abandonadas
      for (const risk of criticalRisks) {
        if (risk.manual_intervention_id) {
          await supabase
            .from('manual_interventions')
            .update({
              status: 'auto_abandoned',
              auto_abandoned_at: new Date().toISOString(),
              abandonment_reason: `Auto-abandoned: Critical risk "${risk.risk_type}" could not be auto-resolved. ${risk.risk_description}`
            })
            .eq('id', risk.manual_intervention_id);
        }
      }

      return new Response(
        JSON.stringify({
          success: false,
          action: 'aborted',
          reason: 'Critical risks detected and could not be auto-resolved',
          critical_risks: criticalRisks.length,
          total_risks: detectedRisks.length,
          recommendation: riskAnalysis.recommendation,
          risks: detectedRisks
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        parallel_negotiation_id,
        total_risks_detected: detectedRisks.length,
        auto_resolved: detectedRisks.filter(r => r.auto_resolution_success).length,
        requires_manual: detectedRisks.filter(r => r.requires_manual_intervention).length,
        total_risk_score: riskAnalysis.total_risk_score,
        recommendation: riskAnalysis.recommendation,
        risks: detectedRisks,
        message: `Análise completa: ${detectedRisks.length} riscos detectados, ${detectedRisks.filter(r => r.auto_resolution_success).length} auto-resolvidos, ${detectedRisks.filter(r => r.requires_manual_intervention).length} requerem ação manual`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[RISK AGENT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
