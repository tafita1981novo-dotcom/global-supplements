#!/bin/bash

# ========================================
# GLOBAL SUPPLEMENTS - AUTOMAÇÃO 24/7
# Loop Infinito - Executa a cada 6 horas
# ========================================

export SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY}"
SUPABASE_URL="https://twglceexfetejawoumsr.supabase.co"
INTERVAL_HOURS=6

echo "🤖 AUTOMAÇÃO 24/7 INICIADA"
echo "📅 Executando a cada ${INTERVAL_HOURS} horas"
echo "=========================================="

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo ""
  echo "⏰ [$TIMESTAMP] Executando pipeline..."
  
  # Executa o pipeline completo
  RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/automation-scheduler" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"action":"run_full_pipeline"}')
  
  # Verifica resultado
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Pipeline executado com sucesso!"
    
    # Extrai métricas
    PRODUCTS=$(echo "$RESPONSE" | grep -o '"products_saved":[0-9]*' | grep -o '[0-9]*')
    BUYERS=$(echo "$RESPONSE" | grep -o '"buyers_detected":[0-9]*' | grep -o '[0-9]*')
    
    echo "📊 Resultados:"
    echo "  - Produtos: ${PRODUCTS:-0}"
    echo "  - Buyers: ${BUYERS:-0}"
  else
    echo "❌ Erro no pipeline: $RESPONSE"
  fi
  
  # Aguarda intervalo (6 horas = 21600 segundos)
  SLEEP_SECONDS=$((INTERVAL_HOURS * 3600))
  NEXT_RUN=$(date -d "+${INTERVAL_HOURS} hours" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v +${INTERVAL_HOURS}H '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "em ${INTERVAL_HOURS} horas")
  
  echo "💤 Próxima execução: $NEXT_RUN"
  echo "=========================================="
  
  sleep $SLEEP_SECONDS
done
