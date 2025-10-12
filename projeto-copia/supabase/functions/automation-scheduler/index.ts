import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * AUTOMATION SCHEDULER - Sistema de Automação 24/7
 * 
 * Executa pipeline completo:
 * 1. Ingestão de dados reais (Amazon API)
 * 2. Detecção de B2B buyers
 * 3. Matching inteligente
 * 4. Negociação automática GPT-4
 * 5. Tracking de comissões
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = 'https://twglceexfetejawoumsr.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();

    console.log(`🤖 AUTOMATION SCHEDULER: ${action}`);

    // ============================================
    // PIPELINE CORRETO: RFQ → SUPPLIER MATCHING → NEGOTIATION
    // ============================================
    if (action === 'run_full_pipeline') {
      const results = {
        timestamp: new Date().toISOString(),
        steps: []
      };

      // STEP 1: BUSCAR RFQs REAIS DE COMPRADORES (IndiaMART)
      console.log('🇮🇳 Step 1: Fetching real buyer RFQs from IndiaMART...');
      try {
        const rfqResponse = await fetch(`${supabaseUrl}/functions/v1/indiamart-rfq-detector`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            action: 'fetch_indiamart_leads',
            params: {} 
          })
        });
        const rfqData = await rfqResponse.json();
        results.steps.push({
          step: 1,
          name: 'IndiaMART RFQ Detection',
          status: rfqData.success ? 'success' : 'failed',
          data: rfqData
        });
      } catch (error: any) {
        results.steps.push({
          step: 1,
          name: 'IndiaMART RFQ Detection',
          status: 'error',
          error: error.message
        });
      }

      // STEP 2: BUSCAR FORNECEDORES GLOBAIS (Para cada RFQ)
      console.log('🌍 Step 2: Finding global suppliers for RFQs...');
      try {
        const { data: buyers } = await supabase
          .from('b2b_buyers')
          .select('*')
          .eq('contact_status', 'rfq_detected')
          .limit(10);

        let suppliersMatched = 0;
        
        for (const buyer of buyers || []) {
          const productNeeded = buyer.product_needs?.[0] || '';
          const budgetStr = buyer.budget_range || '0';
          const maxPrice = parseFloat(budgetStr.replace(/[^0-9.]/g, '')) || 0;

          const supplierResponse = await fetch(`${supabaseUrl}/functions/v1/global-supplier-finder`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'search_suppliers',
              params: {
                productName: productNeeded,
                maxPrice: maxPrice > 0 ? maxPrice : undefined,
                maxDeliveryDays: 30,
                country: buyer.country
              }
            })
          });

          const supplierData = await supplierResponse.json();
          if (supplierData.success && supplierData.suppliers?.length > 0) {
            suppliersMatched++;
          }
        }

        results.steps.push({
          step: 2,
          name: 'Global Supplier Matching',
          status: 'success',
          data: { buyers_processed: buyers?.length || 0, suppliers_matched: suppliersMatched }
        });
      } catch (error: any) {
        results.steps.push({
          step: 2,
          name: 'Global Supplier Matching',
          status: 'error',
          error: error.message
        });
      }

      // STEP 3: Matching Inteligente + Negociação
      console.log('🤝 Step 3: Running intelligent matching...');
      const { data: buyers } = await supabase
        .from('b2b_buyers')
        .select('*')
        .eq('contact_status', 'prospect')
        .limit(10);

      let matchesProcessed = 0;
      for (const buyer of buyers || []) {
        try {
          // Supplier Matching
          const matchResponse = await fetch(`${supabaseUrl}/functions/v1/supplier-matcher`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'match_supplier',
              requirements: {
                product_name: buyer.product_interest,
                quantity: buyer.estimated_monthly_volume || 1000,
                max_price_per_unit: buyer.target_price_per_unit || 20,
                max_delivery_days: 14,
                preferred_shipping: 'air',
                country: buyer.country
              }
            })
          });

          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            
            if (matchData.success && matchData.best_match) {
              // Iniciar negociação automática
              await fetch(`${supabaseUrl}/functions/v1/autonomous-negotiator`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'negotiate',
                  buyer_email: buyer.email || 'contact@example.com',
                  buyer_company: buyer.company_name,
                  buyer_country: buyer.country,
                  supplier_id: matchData.best_match.supplier_id,
                  product: buyer.product_interest,
                  quantity: buyer.estimated_monthly_volume,
                  target_price: buyer.target_price_per_unit
                })
              });

              matchesProcessed++;
            }
          }
        } catch (error) {
          console.error(`Error processing buyer ${buyer.id}:`, error);
        }
      }

      results.steps.push({
        step: 3,
        name: 'Matching & Negotiation',
        status: 'success',
        matches_processed: matchesProcessed
      });

      // STEP 4: Performance Metrics
      const { data: metrics } = await supabase
        .from('broker_performance')
        .select('*')
        .limit(1)
        .single();

      results.steps.push({
        step: 4,
        name: 'Performance Metrics',
        status: 'success',
        metrics: metrics
      });

      return new Response(JSON.stringify({
        success: true,
        pipeline: 'completed',
        results: results,
        summary: {
          total_steps: results.steps.length,
          successful_steps: results.steps.filter(s => s.status === 'success').length,
          matches_processed: matchesProcessed
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // CRON JOB STATUS CHECK
    // ============================================
    if (action === 'status') {
      const { data: recentOps } = await supabase
        .from('opportunities')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: buyers } = await supabase
        .from('b2b_buyers')
        .select('id', { count: 'exact', head: true });

      const { data: negotiations } = await supabase
        .from('negotiations')
        .select('id', { count: 'exact', head: true });

      return new Response(JSON.stringify({
        success: true,
        status: 'active',
        last_ingestion: recentOps?.[0]?.created_at || 'never',
        total_buyers: buyers?.length || 0,
        total_negotiations: negotiations?.length || 0,
        scheduler: 'running'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action',
      available_actions: ['run_full_pipeline', 'status']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Automation scheduler error:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
