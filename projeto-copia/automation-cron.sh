#!/bin/bash

# ========================================
# GLOBAL SUPPLEMENTS - AUTOMAÇÃO 24/7
# Cron Job para Execução Automática
# ========================================

SUPABASE_URL="${SUPABASE_URL:-https://twglceexfetejawoumsr.supabase.co}"
ANON_KEY="${SUPABASE_ANON_KEY}"

if [ -z "$ANON_KEY" ]; then
  echo "❌ ERRO: SUPABASE_ANON_KEY não configurada nas variáveis de ambiente!"
  echo "Configure: export SUPABASE_ANON_KEY=eyJhbGc..."
  exit 1
fi

LOG_FILE="/tmp/automation-$(date +%Y%m%d).log"

echo "========================================" | tee -a $LOG_FILE
echo "🤖 AUTOMATION PIPELINE - $(date)" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# Executar pipeline completo
echo "🚀 Iniciando pipeline de automação..." | tee -a $LOG_FILE

RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/automation-scheduler" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "run_full_pipeline"}')

echo "$RESPONSE" | tee -a $LOG_FILE

# Verificar sucesso
SUCCESS=$(echo $RESPONSE | grep -o '"success":true' | wc -l)

if [ $SUCCESS -gt 0 ]; then
  echo "✅ Pipeline executado com sucesso!" | tee -a $LOG_FILE
  
  # Extrair métricas
  MATCHES=$(echo $RESPONSE | grep -o '"matches_processed":[0-9]*' | cut -d':' -f2)
  STEPS=$(echo $RESPONSE | grep -o '"total_steps":[0-9]*' | cut -d':' -f2)
  
  echo "📊 Métricas:" | tee -a $LOG_FILE
  echo "  - Steps executados: $STEPS" | tee -a $LOG_FILE
  echo "  - Matches processados: $MATCHES" | tee -a $LOG_FILE
else
  echo "❌ Pipeline falhou!" | tee -a $LOG_FILE
fi

echo "========================================" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# Notificar via webhook (opcional)
# curl -X POST "https://hooks.slack.com/..." -d '{"text":"Automation completed"}'
