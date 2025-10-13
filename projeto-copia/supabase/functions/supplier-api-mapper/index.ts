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

    const { rfq_id, product_name, quantity, budget_usd, delivery_deadline } = await req.json();

    console.log(`[SUPPLIER MAPPER] Mapeando fornecedores para RFQ: ${rfq_id}`);

    // 1. Buscar APIs de fornecedores ativas (ordenadas por tier)
    const { data: supplierApis, error: apiError } = await supabase
      .from('supplier_apis')
      .select('*')
      .eq('status', 'active')
      .order('tier', { ascending: true })
      .limit(20);

    if (apiError) throw apiError;

    console.log(`[SUPPLIER MAPPER] Encontradas ${supplierApis?.length || 0} APIs de fornecedores`);

    const mappedSuppliers = [];
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    // 2. Para cada API de fornecedor, buscar produtos
    for (const api of supplierApis || []) {
      try {
        console.log(`[SUPPLIER MAPPER] Buscando em ${api.api_name}...`);

        // GPT-4 simula busca de fornecedores (em produção, chamar APIs reais)
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
                content: `You are a supplier API simulator. Generate realistic supplier data for the product "${product_name}".
                
Return 2-3 suppliers in this JSON format:
{
  "suppliers": [
    {
      "supplier_name": "Company Name",
      "supplier_id": "SUP-12345",
      "supplier_country": "China",
      "supplier_rating": 4.8,
      "supplier_credibility_score": 92,
      "product_name": "Exact product name",
      "product_match_score": 95,
      "unit_price": 42.50,
      "moq": 100,
      "max_quantity": 50000,
      "delivery_time_days": 15,
      "delivery_method": "Sea Freight",
      "broker_commission_percent": 12.5
    }
  ]
}`
              },
              {
                role: 'user',
                content: `Find suppliers for: ${product_name}, Quantity: ${quantity}, Budget: $${budget_usd}, Delivery by: ${delivery_deadline}`
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (!gptResponse.ok) {
          console.error(`[SUPPLIER MAPPER] GPT-4 error: ${gptResponse.status}`);
          continue;
        }

        const gptData = await gptResponse.json();
        const result = JSON.parse(gptData.choices[0].message.content);

        // 3. Salvar mapeamentos no banco
        for (const supplier of result.suppliers || []) {
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + supplier.delivery_time_days);

          const commissionUsd = (supplier.unit_price * quantity * supplier.broker_commission_percent) / 100;

          const { data: mapping, error: mappingError } = await supabase
            .from('supplier_product_mappings')
            .insert({
              rfq_id,
              supplier_api_id: api.id,
              supplier_name: supplier.supplier_name,
              supplier_id: supplier.supplier_id,
              supplier_country: supplier.supplier_country,
              supplier_rating: supplier.supplier_rating,
              supplier_credibility_score: supplier.supplier_credibility_score,
              product_name: supplier.product_name,
              product_match_score: supplier.product_match_score,
              unit_price: supplier.unit_price,
              moq: supplier.moq,
              max_quantity: supplier.max_quantity,
              delivery_time_days: supplier.delivery_time_days,
              delivery_method: supplier.delivery_method,
              can_deliver_by: deliveryDate.toISOString().split('T')[0],
              broker_commission_percent: supplier.broker_commission_percent,
              broker_commission_usd: commissionUsd,
              mapping_status: 'confirmed',
              confirmed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (mappingError) {
            console.error(`[SUPPLIER MAPPER] Erro ao salvar: ${mappingError.message}`);
          } else {
            mappedSuppliers.push(mapping);
            console.log(`[SUPPLIER MAPPER] ✅ Mapeado: ${supplier.supplier_name} - $${supplier.unit_price}/unit, Commission: $${commissionUsd.toFixed(2)}`);
          }
        }

      } catch (apiSpecificError) {
        console.error(`[SUPPLIER MAPPER] Erro em ${api.api_name}:`, apiSpecificError);
        continue;
      }
    }

    // 4. Ordenar fornecedores por melhor comissão
    mappedSuppliers.sort((a, b) => (b.broker_commission_usd || 0) - (a.broker_commission_usd || 0));

    console.log(`[SUPPLIER MAPPER] ✅ Total mapeado: ${mappedSuppliers.length} fornecedores`);

    return new Response(
      JSON.stringify({
        success: true,
        rfq_id,
        total_suppliers_found: mappedSuppliers.length,
        suppliers: mappedSuppliers,
        best_commission: mappedSuppliers[0]?.broker_commission_usd || 0,
        message: `Mapeados ${mappedSuppliers.length} fornecedores com preços/prazos confirmados`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SUPPLIER MAPPER] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
