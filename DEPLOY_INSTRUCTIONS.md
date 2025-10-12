# 🚀 Deploy das Edge Functions - Guia Completo

## ✅ Método Automatizado (RECOMENDADO)

### Passo 1: Fazer Login no Supabase CLI

```bash
supabase login
```

Isso abrirá seu navegador para autenticação. Faça login com sua conta Supabase.

### Passo 2: Executar o Script de Deploy

```bash
./deploy-broker-functions.sh
```

O script vai:
- ✅ Verificar se o Supabase CLI está instalado
- ✅ Linkar ao projeto twglceexfetejawoumsr
- ✅ Fazer deploy de 4 Edge Functions principais:
  - `autonomous-negotiator` (GPT-4 + histórico + multi-idioma)
  - `supplier-matcher` (Matching inteligente)
  - `b2b-buyer-detector` (Detecção de compradores)
  - `email-automation` (Automação de emails)

---

## 📋 Método Manual (se o script falhar)

### 1. Login e Link

```bash
# Login
supabase login

# Link ao projeto
cd projeto-copia
supabase link --project-ref twglceexfetejawoumsr
```

### 2. Deploy Individual

```bash
# Deploy autonomous-negotiator
supabase functions deploy autonomous-negotiator --no-verify-jwt

# Deploy supplier-matcher
supabase functions deploy supplier-matcher --no-verify-jwt

# Deploy b2b-buyer-detector
supabase functions deploy b2b-buyer-detector --no-verify-jwt

# Deploy email-automation
supabase functions deploy email-automation --no-verify-jwt
```

---

## 🔍 Verificar Deploy

### Via Dashboard:
https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions

### Via CLI:
```bash
supabase functions list
```

---

## 🧪 Testar Functions

### Autonomous Negotiator:
```bash
curl -X POST 'https://twglceexfetejawoumsr.supabase.co/functions/v1/autonomous-negotiator' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"negotiation_id": "uuid-here"}'
```

### Supplier Matcher:
```bash
curl -X POST 'https://twglceexfetejawoumsr.supabase.co/functions/v1/supplier-matcher' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "buyer_email": "test@example.com",
    "buyer_company": "Test Corp",
    "buyer_country": "USA",
    "product": "Whey Protein",
    "quantity": 1000,
    "max_price": 25.00,
    "max_delivery_days": 7
  }'
```

---

## 🔐 Encontrar sua ANON_KEY

1. Vá para: https://supabase.com/dashboard/project/twglceexfetejawoumsr/settings/api
2. Copie a "anon public" key
3. Use no header `Authorization: Bearer YOUR_KEY`

---

## ❌ Troubleshooting

### Erro: "Supabase CLI not found"
```bash
npm install -g supabase
```

### Erro: "Not logged in"
```bash
supabase login
```

### Erro: "Failed to deploy"
- Verifique se está dentro da pasta `projeto-copia`
- Verifique se o projeto está linkado: `supabase link --project-ref twglceexfetejawoumsr`
- Tente deploy individual (método manual)

---

## 📦 Funções Deployadas

### 1. **autonomous-negotiator**
- **O que faz:** GPT-4 negocia automaticamente com compradores
- **Features:** Histórico de conversação + Multi-idioma (15+ línguas)
- **Usa:** `get_conversation_context()`, `get_language_context()`

### 2. **supplier-matcher**
- **O que faz:** Encontra o melhor fornecedor para cada pedido
- **Features:** Otimiza lucro × confiabilidade × velocidade
- **Usa:** `dropship_partners`, `supplier_matches` tables

### 3. **b2b-buyer-detector**
- **O que faz:** Detecta compradores B2B em plataformas
- **Plataformas:** LinkedIn, Alibaba, IndiaMART, ThomasNet
- **Usa:** `b2b_buyers` table

### 4. **email-automation**
- **O que faz:** Envia emails automaticamente via Gmail/SendGrid
- **Features:** Templates personalizados, tracking, scheduling
- **Usa:** Gmail API ou SendGrid

---

## 🎯 Próximos Passos Após Deploy

1. ✅ Testar cada função individualmente
2. ✅ Configurar variáveis de ambiente (OPENAI_API_KEY, etc.)
3. ✅ Integrar com frontend
4. ✅ Ativar automação (cron jobs, triggers)
5. ✅ Monitorar logs no Dashboard

---

## 🔗 Links Úteis

- Dashboard: https://supabase.com/dashboard/project/twglceexfetejawoumsr
- Functions: https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions
- Logs: https://supabase.com/dashboard/project/twglceexfetejawoumsr/logs/edge-functions
- API Settings: https://supabase.com/dashboard/project/twglceexfetejawoumsr/settings/api
