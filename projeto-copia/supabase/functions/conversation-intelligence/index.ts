import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ⏰ CONVERSATION INTELLIGENCE - Timing Inteligente
 * 
 * GPT-4 sabe QUANDO falar e QUANDO esperar resposta:
 * - Analisa cultura do país
 * - Calcula tempo médio de resposta
 * - Detecta horário comercial
 * - Decide timing ótimo
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = 'https://twglceexfetejawoumsr.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, rfq_id, buyer_country } = await req.json();

    console.log(`⏰ CONVERSATION INTELLIGENCE: ${action}`);

    // ============================================
    // DECIDIR TIMING (FALAR OU ESPERAR?)
    // ============================================
    if (action === 'decide_timing') {
      // Buscar histórico de conversas com este comprador
      const { data: timeline } = await supabase
        .from('conversation_timelines')
        .select('*')
        .eq('rfq_id', rfq_id)
        .order('sent_at', { ascending: false })
        .limit(10);

      // Calcular tempo médio de resposta
      const responseTimes = timeline
        ?.filter(t => t.response_time_hours)
        .map(t => t.response_time_hours) || [];
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 24; // Default 24 horas

      // Contexto cultural
      const culturalTiming: any = {
        'USA': { business_hours: '9-17', response_expectation: 'same_day', patience_level: 'low' },
        'China': { business_hours: '9-18', response_expectation: '1-2_days', patience_level: 'medium' },
        'India': { business_hours: '10-19', response_expectation: '1-2_days', patience_level: 'medium' },
        'Germany': { business_hours: '8-17', response_expectation: 'same_day', patience_level: 'high' },
        'Brazil': { business_hours: '9-18', response_expectation: '1-3_days', patience_level: 'high' },
        'Japan': { business_hours: '9-18', response_expectation: '2-3_days', patience_level: 'very_high' }
      };

      const cultural = culturalTiming[buyer_country] || culturalTiming['USA'];

      // GPT-4 decide timing
      const timingPrompt = `
TASK: Decide if we should send message NOW or WAIT for response

CONTEXT:
- Buyer Country: ${buyer_country}
- Cultural patience: ${cultural.patience_level}
- Expected response time: ${cultural.response_expectation}
- Average response time (historical): ${avgResponseTime} hours
- Last message sent: ${timeline?.[0]?.sent_at || 'Never'}
- Hours since last message: ${timeline?.[0] ? ((Date.now() - new Date(timeline[0].sent_at).getTime()) / (1000 * 60 * 60)).toFixed(1) : 0}

CONVERSATION HISTORY:
${JSON.stringify(timeline?.slice(0, 3), null, 2)}

DECISION CRITERIA:
1. Too soon = pushy, may damage relationship
2. Too late = lose deal to competitors
3. Consider cultural norms (Japan = wait longer, USA = faster)
4. If buyer asked question = respond quickly
5. If we made offer = wait for counter

Return JSON:
{
  "decision": "send_now" or "wait",
  "wait_hours": 24,
  "reason": "Brief explanation",
  "optimal_send_time": "2024-01-15T14:00:00Z",
  "confidence": 85
}
`;

      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a cultural communication timing expert. Optimize message timing for maximum effectiveness.' },
            { role: 'user', content: timingPrompt }
          ],
          temperature: 0.5,
          response_format: { type: "json_object" }
        }),
      });

      const gptData = await gptResponse.json();
      const timing = JSON.parse(gptData.choices[0].message.content);

      // Salvar decisão de timing
      if (timing.decision === 'wait') {
        await supabase
          .from('conversation_timelines')
          .insert({
            rfq_id: rfq_id,
            participant_type: 'system',
            message_type: 'timing_decision',
            message_content: `GPT-4 decided to WAIT ${timing.wait_hours} hours. Reason: ${timing.reason}`,
            language: buyer_country,
            sent_at: new Date().toISOString(),
            response_expected_at: timing.optimal_send_time,
            cultural_context: { cultural, avg_response_time: avgResponseTime },
            ai_should_wait: true,
            wait_reason: timing.reason
          });
      }

      return new Response(JSON.stringify({
        success: true,
        timing_decision: timing,
        cultural_context: cultural,
        historical_avg_response: `${avgResponseTime} hours`,
        message: timing.decision === 'wait' 
          ? `GPT-4 decided to WAIT ${timing.wait_hours} hours` 
          : 'GPT-4 decided to SEND NOW'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action',
      available_actions: ['decide_timing']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Conversation Intelligence error:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
