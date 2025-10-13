import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * 💰 PAYONEER SYNC - Controle Financeiro em Tempo Real
 * 
 * Tracking automático do Payoneer (ID: 99133638):
 * - Sincroniza balanço em tempo real
 * - Registra transações
 * - Reconcilia comissões
 * - Alertas financeiros
 */

const PAYONEER_ID = '99133638';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = 'https://twglceexfetejawoumsr.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();

    console.log(`💰 PAYONEER SYNC: ${action} (ID: ${PAYONEER_ID})`);

    // ============================================
    // SYNC BALANCE - Sincronizar saldo atual
    // ============================================
    if (action === 'sync_balance') {
      // TODO: Integrar com Payoneer API oficial quando credenciais disponíveis
      // Por enquanto, buscar do banco de dados interno
      
      const { data: lastTransaction } = await supabase
        .from('payoneer_transactions')
        .select('balance_after')
        .eq('payoneer_id', PAYONEER_ID)
        .order('synced_at', { ascending: false })
        .limit(1)
        .single();

      const currentBalance = lastTransaction?.balance_after || 0;

      // Atualizar métricas diárias
      await supabase
        .from('evolution_metrics')
        .upsert({
          metric_date: new Date().toISOString().split('T')[0],
          payoneer_balance_usd: currentBalance
        }, {
          onConflict: 'metric_date'
        });

      return new Response(JSON.stringify({
        success: true,
        payoneer_id: PAYONEER_ID,
        current_balance_usd: currentBalance,
        last_sync: new Date().toISOString(),
        message: `Payoneer balance synced: $${currentBalance.toLocaleString()}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // RECORD COMMISSION - Registrar comissão recebida
    // ============================================
    if (action === 'record_commission') {
      const { rfq_id, amount_usd, buyer_name, buyer_country } = await req.json();

      // Buscar balanço atual
      const { data: lastTx } = await supabase
        .from('payoneer_transactions')
        .select('balance_after')
        .eq('payoneer_id', PAYONEER_ID)
        .order('synced_at', { ascending: false })
        .limit(1)
        .single();

      const currentBalance = lastTx?.balance_after || 0;
      const newBalance = currentBalance + amount_usd;

      // Registrar transação
      const { data: transaction } = await supabase
        .from('payoneer_transactions')
        .insert({
          payoneer_id: PAYONEER_ID,
          transaction_type: 'commission_in',
          amount_usd: amount_usd,
          currency: 'USD',
          rfq_id: rfq_id,
          counterparty_name: buyer_name,
          counterparty_country: buyer_country,
          description: `Commission from ${buyer_name} (${buyer_country})`,
          status: 'completed',
          balance_after: newBalance,
          synced_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      // Verificar alertas
      if (newBalance > 50000) {
        await supabase
          .from('financial_alerts')
          .insert({
            alert_type: 'high_revenue_day',
            severity: 'medium',
            message: `Payoneer balance reached $${newBalance.toLocaleString()}!`,
            transaction_id: transaction.id,
            current_balance: newBalance,
            recommended_action: 'Consider transferring funds to main account'
          });
      }

      return new Response(JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        amount_usd: amount_usd,
        new_balance_usd: newBalance,
        message: `Commission of $${amount_usd.toLocaleString()} recorded successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // RECORD PAYMENT - Registrar pagamento a fornecedor
    // ============================================
    if (action === 'record_payment') {
      const { rfq_id, amount_usd, supplier_name, supplier_country } = await req.json();

      const { data: lastTx } = await supabase
        .from('payoneer_transactions')
        .select('balance_after')
        .eq('payoneer_id', PAYONEER_ID)
        .order('synced_at', { ascending: false })
        .limit(1)
        .single();

      const currentBalance = lastTx?.balance_after || 0;
      const newBalance = currentBalance - amount_usd;

      // Verificar se tem saldo suficiente
      if (newBalance < 0) {
        await supabase
          .from('financial_alerts')
          .insert({
            alert_type: 'low_balance',
            severity: 'critical',
            message: `Insufficient Payoneer balance! Attempted payment: $${amount_usd}, Current: $${currentBalance}`,
            current_balance: currentBalance,
            recommended_action: 'DO NOT PROCEED - Requires buyer payment first (ZERO INVESTMENT rule)'
          });

        return new Response(JSON.stringify({
          success: false,
          error: 'Insufficient balance - ZERO INVESTMENT rule violated',
          current_balance: currentBalance,
          required: amount_usd,
          message: 'CRITICAL: Cannot pay supplier without buyer payment first!'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Registrar pagamento
      const { data: transaction } = await supabase
        .from('payoneer_transactions')
        .insert({
          payoneer_id: PAYONEER_ID,
          transaction_type: 'payment_out',
          amount_usd: amount_usd,
          currency: 'USD',
          rfq_id: rfq_id,
          counterparty_name: supplier_name,
          counterparty_country: supplier_country,
          description: `Payment to ${supplier_name} (${supplier_country})`,
          status: 'completed',
          balance_after: newBalance,
          synced_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      return new Response(JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        amount_usd: amount_usd,
        new_balance_usd: newBalance,
        message: `Payment of $${amount_usd.toLocaleString()} to supplier completed`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // DAILY REPORT - Relatório diário
    // ============================================
    if (action === 'daily_report') {
      const today = new Date().toISOString().split('T')[0];

      const { data: transactions } = await supabase
        .from('payoneer_transactions')
        .select('*')
        .eq('payoneer_id', PAYONEER_ID)
        .gte('synced_at', `${today}T00:00:00Z`)
        .order('synced_at', { ascending: false });

      const commissionsIn = transactions?.filter(t => t.transaction_type === 'commission_in') || [];
      const paymentsOut = transactions?.filter(t => t.transaction_type === 'payment_out') || [];

      const totalIn = commissionsIn.reduce((sum, t) => sum + (t.amount_usd || 0), 0);
      const totalOut = paymentsOut.reduce((sum, t) => sum + (t.amount_usd || 0), 0);
      const netRevenue = totalIn - totalOut;

      const { data: currentBalance } = await supabase
        .from('payoneer_transactions')
        .select('balance_after')
        .eq('payoneer_id', PAYONEER_ID)
        .order('synced_at', { ascending: false })
        .limit(1)
        .single();

      return new Response(JSON.stringify({
        success: true,
        payoneer_id: PAYONEER_ID,
        date: today,
        summary: {
          total_commissions_in: totalIn,
          total_payments_out: totalOut,
          net_revenue_today: netRevenue,
          current_balance: currentBalance?.balance_after || 0,
          transactions_count: transactions?.length || 0
        },
        transactions: transactions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action',
      available_actions: ['sync_balance', 'record_commission', 'record_payment', 'daily_report']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Payoneer Sync error:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
