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

    const { rfq_id } = await req.json();

    console.log(`[PARALLEL NEGOTIATION] Iniciando negociações paralelas para RFQ: ${rfq_id}`);

    // 1. Buscar RFQ e fornecedores mapeados
    const { data: rfq, error: rfqError } = await supabase
      .from('rfq_inbox')
      .select('*')
      .eq('id', rfq_id)
      .single();

    if (rfqError) throw rfqError;

    const { data: mappedSuppliers, error: suppliersError } = await supabase
      .from('supplier_product_mappings')
      .select('*')
      .eq('rfq_id', rfq_id)
      .eq('mapping_status', 'confirmed')
      .order('broker_commission_usd', { ascending: false })
      .limit(5); // Top 5 fornecedores

    if (suppliersError) throw suppliersError;

    if (!mappedSuppliers || mappedSuppliers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum fornecedor mapeado para este RFQ' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`[PARALLEL NEGOTIATION] Negociando com ${mappedSuppliers.length} fornecedores em paralelo`);

    // 2. Criar registro de negociação paralela
    const { data: parallelNeg, error: createError } = await supabase
      .from('parallel_negotiations')
      .insert({
        rfq_id,
        buyer_status: 'negotiating',
        buyer_last_message: new Date().toISOString(),
        buyer_delivery_deadline: rfq.delivery_deadline,
        supplier_negotiations: [],
        active_suppliers: mappedSuppliers.length,
      })
      .select()
      .single();

    if (createError) throw createError;

    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    // 3. NEGOCIAÇÃO PARALELA: Comprador + Fornecedores
    const supplierNegotiations = [];

    for (const supplier of mappedSuppliers) {
      try {
        // GPT-4 negocia com fornecedor
        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert B2B broker. Negotiate with supplier "${supplier.supplier_name}" for product "${rfq.product_name}".
                
Your goal:
- Confirm price: ${supplier.unit_price}/unit
- Confirm quantity: ${rfq.quantity} units (MOQ: ${supplier.moq})
- Confirm delivery: ${supplier.delivery_time_days} days (must deliver by ${rfq.delivery_deadline})
- Maximize commission: currently ${supplier.broker_commission_percent}%

Return JSON:
{
  "status": "agreed" | "negotiating" | "rejected",
  "final_price": number,
  "final_quantity": number,
  "final_delivery_days": number,
  "final_commission_percent": number,
  "supplier_response": "message from supplier"
}`
              },
              {
                role: 'user',
                content: `Negotiate with ${supplier.supplier_name}. Buyer needs ${rfq.quantity} units by ${rfq.delivery_deadline}, budget $${rfq.budget_usd}.`
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (gptResponse.ok) {
          const gptData = await gptResponse.json();
          const negotiationResult = JSON.parse(gptData.choices[0].message.content);

          supplierNegotiations.push({
            supplier_id: supplier.id,
            supplier_name: supplier.supplier_name,
            status: negotiationResult.status,
            final_price: negotiationResult.final_price,
            final_quantity: negotiationResult.final_quantity,
            final_delivery_days: negotiationResult.final_delivery_days,
            final_commission_percent: negotiationResult.final_commission_percent,
            final_commission_usd: (negotiationResult.final_price * negotiationResult.final_quantity * negotiationResult.final_commission_percent) / 100,
            supplier_response: negotiationResult.supplier_response,
            credibility_score: supplier.supplier_credibility_score,
          });

          console.log(`[PARALLEL NEGOTIATION] ✅ ${supplier.supplier_name}: ${negotiationResult.status}, Commission: $${((negotiationResult.final_price * negotiationResult.final_quantity * negotiationResult.final_commission_percent) / 100).toFixed(2)}`);
        }
      } catch (suppError) {
        console.error(`[PARALLEL NEGOTIATION] Erro negociando com ${supplier.supplier_name}:`, suppError);
      }
    }

    // 4. SELECIONAR MELHOR FORNECEDOR
    const { data: criteria, error: criteriaError } = await supabase
      .from('supplier_selection_criteria')
      .select('*')
      .eq('id', 'default_criteria_v1')
      .single();

    if (criteriaError) throw criteriaError;

    // Calcular score ponderado para cada fornecedor
    const scoredSuppliers = supplierNegotiations
      .filter(s => s.status === 'agreed')
      .map(supplier => {
        const commissionScore = (supplier.final_commission_usd / Math.max(...supplierNegotiations.map(s => s.final_commission_usd || 0))) * 100;
        const credibilityScore = supplier.credibility_score || 0;
        const deliveryScore = supplier.final_delivery_days <= parseInt(rfq.delivery_deadline?.split('-')[2] || '30') ? 100 : 50;

        const totalScore = (
          (commissionScore * criteria.max_commission_weight) +
          (credibilityScore * criteria.credibility_weight) +
          (deliveryScore * criteria.delivery_speed_weight)
        ) / 100;

        return { ...supplier, total_score: totalScore };
      })
      .sort((a, b) => b.total_score - a.total_score);

    const bestSupplier = scoredSuppliers[0];

    if (bestSupplier) {
      // Atualizar negociação com fornecedor selecionado
      await supabase
        .from('parallel_negotiations')
        .update({
          supplier_negotiations: supplierNegotiations,
          selected_supplier_id: bestSupplier.supplier_id,
          selection_reason: `Selected ${bestSupplier.supplier_name}: Best total score ${bestSupplier.total_score.toFixed(2)}/100. Commission: $${bestSupplier.final_commission_usd.toFixed(2)}, Credibility: ${bestSupplier.credibility_score}/100, Delivery: ${bestSupplier.final_delivery_days} days`,
          selection_criteria: {
            max_commission: bestSupplier.final_commission_usd,
            credibility: bestSupplier.credibility_score,
            delivery_days: bestSupplier.final_delivery_days,
            total_score: bestSupplier.total_score
          },
          supplier_selected_at: new Date().toISOString(),
        })
        .eq('id', parallelNeg.id);

      console.log(`[PARALLEL NEGOTIATION] 🎯 MELHOR FORNECEDOR: ${bestSupplier.supplier_name} (Score: ${bestSupplier.total_score.toFixed(2)}/100)`);
    }

    // 5. GPT-4 negocia com COMPRADOR (com fornecedor já confirmado)
    const buyerNegResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a B2B broker. You have secured supplier ${bestSupplier?.supplier_name} who can deliver ${rfq.product_name}.
            
Your offer to buyer:
- Product: ${rfq.product_name}
- Quantity: ${bestSupplier?.final_quantity} units
- Price: $${bestSupplier?.final_price}/unit (Total: $${(bestSupplier?.final_price || 0) * (bestSupplier?.final_quantity || 0)})
- Delivery: ${bestSupplier?.final_delivery_days} days
- Your commission: ${bestSupplier?.final_commission_percent}% (buyer doesn't see this)

Negotiate to close the deal. Be professional and compelling.

Return JSON:
{
  "buyer_status": "agreed" | "negotiating" | "rejected",
  "message_to_buyer": "your negotiation message",
  "buyer_response": "simulated buyer response"
}`
          },
          {
            role: 'user',
            content: `Buyer: ${rfq.buyer_name} from ${rfq.buyer_country}. Budget: $${rfq.budget_usd}. Needs ${rfq.quantity} units by ${rfq.delivery_deadline}.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    let buyerResult = null;
    if (buyerNegResponse.ok) {
      const buyerData = await buyerNegResponse.json();
      buyerResult = JSON.parse(buyerData.choices[0].message.content);

      await supabase
        .from('parallel_negotiations')
        .update({
          buyer_status: buyerResult.buyer_status,
          buyer_last_message: new Date().toISOString(),
          buyer_agreed_price: bestSupplier?.final_price,
          buyer_agreed_quantity: bestSupplier?.final_quantity,
        })
        .eq('id', parallelNeg.id);

      console.log(`[PARALLEL NEGOTIATION] 📞 COMPRADOR: ${buyerResult.buyer_status}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        rfq_id,
        parallel_negotiation_id: parallelNeg.id,
        suppliers_negotiated: supplierNegotiations.length,
        best_supplier: bestSupplier ? {
          name: bestSupplier.supplier_name,
          commission_usd: bestSupplier.final_commission_usd,
          credibility: bestSupplier.credibility_score,
          delivery_days: bestSupplier.final_delivery_days,
          total_score: bestSupplier.total_score
        } : null,
        buyer_status: buyerResult?.buyer_status || 'pending',
        buyer_message: buyerResult?.message_to_buyer,
        message: `Negociações paralelas concluídas. Melhor fornecedor: ${bestSupplier?.supplier_name}. Comprador: ${buyerResult?.buyer_status}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PARALLEL NEGOTIATION] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
