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
    // PIPELINE COMPLETO AUTÔNOMO: 100 APIs → MATCHING → GPT-4 NEGOTIATION
    // ============================================
    if (action === 'run_full_pipeline') {
      const results = {
        timestamp: new Date().toISOString(),
        steps: [],
        autonomous_run_id: `run_${Date.now()}`
      };

      // Registrar execução autônoma
      const { data: runRecord } = await supabase
        .from('autonomous_runs')
        .insert({
          run_type: 'rfq_fetch',
          status: 'running',
          execution_log: { started: new Date().toISOString() }
        })
        .select()
        .single();

      // STEP 1: BUSCAR RFQs DAS 100 APIS (Priorizar API-direct)
      console.log('🌍 Step 1: Fetching RFQs from ALL 100 configured APIs...');
      
      // Pegar TODAS as APIs configuradas (100 fontes)
      const { data: configuredApis } = await supabase
        .from('rfq_api_credentials')
        .select('*')
        .eq('is_active', true)
        .order('tier_priority', { ascending: true }); // Tier 1 primeiro

      let totalRfqsFetched = 0;
      let apisFetched = 0;
      let apiErrors = 0;

      // Processar APIs por tier (priorizar APIs diretas)
      for (const api of configuredApis || []) {
        try {
          console.log(`📡 Fetching from ${api.api_name} (Tier ${api.tier_priority})...`);
          
          let rfqData: any = null;

          // ⚡ PRIORIDADE: APIs com negociação direta
          if (api.supports_direct_negotiation) {
            console.log(`✅ ${api.api_name} supports DIRECT NEGOTIATION - Prioritizing!`);
          }

          // Chamar Edge Function específica baseada na API
          if (api.api_name === 'INDIAMART_KEY') {
            const response = await fetch(`${supabaseUrl}/functions/v1/indiamart-rfq-detector`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'fetch_indiamart_leads', api_key: api.api_key })
            });
            rfqData = await response.json();
          } 
          else if (api.api_name === 'ALIBABA_API_KEY' || api.api_name === 'APIFY_API_TOKEN') {
            const response = await fetch(`${supabaseUrl}/functions/v1/alibaba-rfq-scraper`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'scrape_alibaba', api_key: api.api_key })
            });
            rfqData = await response.json();
          }
          else if (api.api_name === 'SAM_GOV_API_KEY') {
            const response = await fetch(`${supabaseUrl}/functions/v1/sam-gov-rfq-detector`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'fetch_contracts', api_key: api.api_key })
            });
            rfqData = await response.json();
          }
          else if (api.api_name === 'GLOBALSOURCES_API') {
            const response = await fetch(`${supabaseUrl}/functions/v1/globalsources-rfq-api`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'fetch_rfqs', api_key: api.api_key })
            });
            rfqData = await response.json();
          }

          // Normalizar e salvar RFQs no rfq_inbox
          if (rfqData && rfqData.success && rfqData.rfqs) {
            for (const rfq of rfqData.rfqs) {
              await supabase.from('rfq_inbox').insert({
                source_api: api.api_name,
                source_id: rfq.id || `${api.api_name}_${Date.now()}`,
                buyer_name: rfq.buyer_name || rfq.company_name,
                buyer_country: rfq.country,
                product_description: rfq.product || rfq.description,
                quantity: rfq.quantity,
                budget_usd: rfq.budget || rfq.price,
                deadline: rfq.deadline,
                contact_method: api.supports_direct_negotiation ? 'api' : 'email',
                contact_data: { 
                  api_endpoint: api.negotiation_endpoint,
                  email: rfq.email,
                  api_method: api.negotiation_method 
                },
                raw_data: rfq,
                status: 'new',
                priority_score: api.supports_direct_negotiation ? 95 : 70 // API direta = prioridade
              });
              totalRfqsFetched++;
            }
          }

          apisFetched++;
        } catch (error: any) {
          console.error(`Error fetching from ${api.api_name}:`, error);
          apiErrors++;
        }
      }

      results.steps.push({
        step: 1,
        name: '100 Global APIs - RFQ Fetch',
        status: 'success',
        data: {
          total_apis_configured: configuredApis?.length || 0,
          apis_fetched_successfully: apisFetched,
          apis_with_errors: apiErrors,
          total_rfqs_fetched: totalRfqsFetched,
          api_direct_prioritized: true
        }
      });

      // STEP 2: MAPEAR FORNECEDORES EM 100+ APIS (ANTES de negociar com comprador!)
      console.log('🏭 Step 2: Mapping suppliers across 100+ APIs - Confirming prices/quantities/delivery...');
      
      // Pegar RFQs novas (priorizar API-direct)
      const { data: newRfqs } = await supabase
        .from('rfq_inbox')
        .select('*')
        .eq('status', 'new')
        .order('priority_score', { ascending: false })
        .limit(50); // Processar 50 por vez

      let rfqsProcessed = 0;
      let suppliersMapped = 0;
      let parallelNegotiationsStarted = 0;
      let risksDetected = 0;

      for (const rfq of newRfqs || []) {
        try {
          console.log(`📦 Processing RFQ: ${rfq.product_description} from ${rfq.buyer_name}`);

          // STEP 2A: MAPEAR FORNECEDORES (confirmar preços/quantidades/prazos)
          const mapResponse = await fetch(`${supabaseUrl}/functions/v1/supplier-api-mapper`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              rfq_id: rfq.id,
              product_name: rfq.product_description,
              quantity: rfq.quantity || 1000,
              budget_usd: rfq.budget_usd || 50000,
              delivery_deadline: rfq.deadline
            })
          });

          const mapData = await mapResponse.json();

          if (mapData.success && mapData.total_suppliers_found > 0) {
            suppliersMapped += mapData.total_suppliers_found;
            
            console.log(`✅ Mapped ${mapData.total_suppliers_found} suppliers with confirmed prices`);

            // STEP 2B: NEGOCIAÇÕES PARALELAS (comprador + fornecedores simultaneamente)
            const parallelNegResponse = await fetch(`${supabaseUrl}/functions/v1/parallel-negotiation-orchestrator`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                rfq_id: rfq.id
              })
            });

            const parallelNegData = await parallelNegResponse.json();

            if (parallelNegData.success) {
              parallelNegotiationsStarted++;
              
              console.log(`🤝 Parallel negotiations: Buyer + ${parallelNegData.suppliers_negotiated} suppliers`);
              console.log(`🎯 Best supplier selected: ${parallelNegData.best_supplier?.name}, Commission: $${parallelNegData.best_supplier?.commission_usd}`);

              // STEP 2C: AVALIAÇÃO DE RISCOS EM TEMPO REAL
              const riskResponse = await fetch(`${supabaseUrl}/functions/v1/risk-assessment-agent`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  parallel_negotiation_id: parallelNegData.parallel_negotiation_id
                })
              });

              const riskData = await riskResponse.json();

              if (riskData.success) {
                risksDetected += riskData.total_risks_detected || 0;
                
                console.log(`🔍 Risk analysis: ${riskData.total_risks_detected} risks, ${riskData.auto_resolved} auto-resolved, ${riskData.requires_manual} manual intervention`);

                if (riskData.recommendation === 'abort') {
                  console.log(`❌ Deal aborted due to critical risks`);
                  await supabase
                    .from('rfq_inbox')
                    .update({ status: 'aborted' })
                    .eq('id', rfq.id);
                } else {
                  // Atualizar RFQ para "negotiating" se riscos OK
                  await supabase
                    .from('rfq_inbox')
                    .update({ status: 'negotiating' })
                    .eq('id', rfq.id);

                  // Salvar decisão GPT-4
                  await supabase
                    .from('ai_decision_state')
                    .insert({
                      rfq_id: rfq.id,
                      decision_type: 'parallel_negotiation_started',
                      decision_rationale: `Best supplier: ${parallelNegData.best_supplier?.name}, Score: ${parallelNegData.best_supplier?.total_score}, Risks: ${riskData.total_risks_detected} (${riskData.auto_resolved} resolved)`,
                      context_data: { 
                        suppliers_mapped: mapData.total_suppliers_found,
                        best_supplier: parallelNegData.best_supplier,
                        risks: riskData.risks 
                      },
                      outcome: 'pending',
                      confidence_score: 90
                    });
                }
              }
            }
          }

          rfqsProcessed++;
        } catch (error: any) {
          console.error(`Error processing RFQ ${rfq.id}:`, error);
        }
      }

      results.steps.push({
        step: 2,
        name: 'Supplier Mapping + Parallel Negotiations + Risk Assessment',
        status: 'success',
        data: {
          rfqs_processed: rfqsProcessed,
          suppliers_mapped: suppliersMapped,
          parallel_negotiations_started: parallelNegotiationsStarted,
          risks_detected: risksDetected,
          api_direct_used: newRfqs?.filter(r => r.contact_method === 'api').length || 0
        }
      });

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
