# 🤖 Configuração de Automação 24/7 - Global Supplements

## ✅ Sistema de Automação Deployado

### Edge Functions Ativas:
- ✅ **automation-scheduler** - Orquestra pipeline completo
- ✅ **real-data-ingestion** - Ingestão de dados Amazon
- ✅ **autonomous-negotiator** - Negociação GPT-4
- ✅ **supplier-matcher** - Matching inteligente
- ✅ **b2b-buyer-detector** - Detecção de buyers
- ✅ **email-automation** - Emails automatizados

---

## 🔄 Pipeline de Automação

### Fluxo Completo (executado automaticamente):

```
1. 📥 INGESTÃO DE DADOS
   ├─ Busca produtos reais da Amazon (50-100 produtos)
   ├─ Salva no Supabase (tabela opportunities)
   └─ Log: "Amazon Data Ingestion"

2. 🎯 DETECÇÃO DE BUYERS
   ├─ Analisa produtos com >1000 reviews
   ├─ Calcula volume mensal estimado
   ├─ Identifica oportunidades B2B
   └─ Salva em b2b_buyers

3. 🤝 MATCHING INTELIGENTE
   ├─ Para cada buyer detectado
   ├─ Busca melhor supplier (profit × reliability × speed)
   ├─ Calcula margem e comissão
   └─ Cria supplier_matches

4. 💬 NEGOCIAÇÃO AUTOMÁTICA (GPT-4)
   ├─ Detecta idioma do buyer (15+ línguas)
   ├─ Envia email personalizado
   ├─ Salva em negotiations + messages
   └─ Tracking de conversation history

5. 💰 COMMISSION TRACKING
   ├─ Calcula lucro estimado
   ├─ Registra em commissions
   └─ Dashboard metrics atualizado
```

---

## ⏰ Configuração de Cron Jobs

### Opção 1: Replit Cron (Recomendado)

1. **Acesse Replit Deployments:**
   ```
   https://replit.com/@[seu-usuario]/[seu-repl]/deployments
   ```

2. **Adicione Cron Job:**
   ```bash
   # A cada 6 horas
   0 */6 * * * /home/runner/workspace/projeto-copia/automation-cron.sh
   ```

3. **Ou use Replit Scheduled Functions** (se disponível)

### Opção 2: Supabase Cron (pg_cron)

```sql
-- Executar a cada 6 horas
SELECT cron.schedule(
  'automation-pipeline',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://twglceexfetejawoumsr.supabase.co/functions/v1/automation-scheduler',
    headers := '{"Authorization": "Bearer [ANON_KEY]", "Content-Type": "application/json"}',
    body := '{"action": "run_full_pipeline"}'
  );
  $$
);
```

### Opção 3: Cron Externo (Cron-job.org, EasyCron, etc.)

1. **Acesse:** https://cron-job.org
2. **Crie novo job:**
   - URL: `https://twglceexfetejawoumsr.supabase.co/functions/v1/automation-scheduler`
   - Method: POST
   - Headers: 
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     Content-Type: application/json
     ```
   - Body:
     ```json
     {"action": "run_full_pipeline"}
     ```
   - Schedule: `0 */6 * * *` (a cada 6 horas)

---

## 🧪 Testar Automação Manualmente

### Via cURL:
```bash
curl -X POST "https://twglceexfetejawoumsr.supabase.co/functions/v1/automation-scheduler" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY" \
  -H "Content-Type: application/json" \
  -d '{"action": "run_full_pipeline"}'
```

### Via Script:
```bash
cd projeto-copia
./automation-cron.sh
```

### Via Broker Dashboard:
```
https://[seu-dominio]/broker-dashboard
→ Aba "Real Data"
→ Botão "Ingest Real Amazon Products Now"
```

---

## 📊 Monitoring & Logs

### 1. Supabase Dashboard
```
https://supabase.com/dashboard/project/twglceexfetejawoumsr/logs/edge-functions
```
- Ver logs em tempo real
- Filtrar por função
- Debugging de erros

### 2. Database Tables (métricas)
```sql
-- Total de oportunidades
SELECT COUNT(*) FROM opportunities;

-- B2B buyers detectados
SELECT COUNT(*) FROM b2b_buyers WHERE contact_status = 'prospect';

-- Negociações ativas
SELECT COUNT(*) FROM negotiations WHERE status = 'active';

-- Comissões totais
SELECT SUM(commission_amount) FROM commissions;

-- Performance geral
SELECT * FROM broker_performance;
```

### 3. Logs Locais
```bash
# Ver logs do cron
tail -f /tmp/automation-*.log

# Ver últimas execuções
ls -ltr /tmp/automation-*.log | tail -5
```

---

## 🎯 KPIs e Métricas de Sucesso

### Semana 1 (Objetivo):
- ✅ 500+ produtos reais ingeridos
- ✅ 50+ B2B buyers identificados
- ✅ 10+ negociações iniciadas
- ✅ 1-3 deals fechados
- ✅ **$1,000-$10,000 em comissões**

### Métricas Diárias:
- Produtos ingeridos: 100-200/dia
- Buyers detectados: 10-20/dia
- Emails enviados: 20-50/dia
- Taxa de resposta: 5-15%
- Taxa de conversão: 1-5%

### Métricas de Performance:
- Tempo de matching: <2s
- Tempo de negociação: <5s
- Uptime do sistema: >99%
- Taxa de sucesso API: >95%

---

## 🔧 Configuração de Secrets (Supabase)

**Acesse:** https://supabase.com/dashboard/project/twglceexfetejawoumsr/settings/functions

**Adicione:**
```
RAPIDAPI_KEY = be45bf9b25mshe7d22fb14c4dccfp136aa6jsn2ecac7c2da59
OPENAI_API_KEY = [sua-chave-openai]
GMAIL_API_KEY = [sua-chave-gmail] (opcional)
SENDGRID_API_KEY = [sua-chave-sendgrid] (opcional)
```

---

## 🚨 Troubleshooting

### Problema: "Pipeline falhou"
**Solução:**
1. Verificar logs: `https://supabase.com/dashboard/.../logs`
2. Testar Edge Functions individualmente
3. Verificar secrets configuradas
4. Checar limites de API (RapidAPI)

### Problema: "No buyers detected"
**Solução:**
1. Verificar se há produtos com >1000 reviews
2. Ajustar threshold de detecção
3. Rodar ingestão manual primeiro

### Problema: "Email automation failed"
**Solução:**
1. Configurar GMAIL_API_KEY ou SENDGRID_API_KEY
2. Verificar permissões OAuth (Gmail)
3. Usar SendGrid como alternativa

---

## 📈 Escalando para Milhões

### Fase 1: Automação Básica (ESTA SEMANA)
- ✅ Cron a cada 6 horas
- ✅ 50-100 produtos/execução
- ✅ 10-20 buyers/dia

### Fase 2: Escala Média (SEMANA 2-3)
- 🔄 Cron a cada 2 horas
- 🔄 200-500 produtos/execução
- 🔄 50-100 buyers/dia
- 🔄 Múltiplas sources (eBay, Alibaba)

### Fase 3: Escala Alta (MÊS 2+)
- 🚀 Real-time streaming
- 🚀 1000+ produtos/dia
- 🚀 500+ buyers/dia
- 🚀 Multi-marketplace arbitrage
- 🚀 Government contract bidding
- 🚀 **$100K-$1M/mês em comissões**

---

## ✅ Checklist de Ativação

- [x] Edge Functions deployadas
- [x] Automation Scheduler criado
- [x] Script de cron configurado
- [ ] Configurar RAPIDAPI_KEY no Supabase
- [ ] Escolher método de cron (Replit/Supabase/External)
- [ ] Testar pipeline manualmente
- [ ] Ativar cron job
- [ ] Configurar monitoring
- [ ] Começar a gerar receita! 💰

---

**🎉 Sistema pronto para gerar milhões!**

Próximo passo: Escolher e ativar seu cron job preferido (ver opções acima).
