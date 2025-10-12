# 🔑 TODAS AS CREDENCIAIS DISPONÍVEIS NO PROJETO

## ✅ CREDENCIAIS JÁ CONFIGURADAS (9/25 - 36%)

### 🏗️ INFRASTRUCTURE
- **Supabase URL**: ✅ Configurado via environment
- **Supabase Anon Key**: ✅ Configurado via environment
- **Localização**: `inject-secrets.sh`, `.env`, `credentialsService.ts`

### 🤖 AI SERVICES
- **OpenAI API Key**: ✅ Configurado via environment
  - Uso: GPT-4 Negotiations, Content Generation
  - Revenue Impact: $5K-$20K/month
  - Localização**: `inject-secrets.sh`, `.env`, `credentialsService.ts`

- **Google Gemini**: ❌ Pendente
  - Setup: https://aistudio.google.com/app/apikey

### 🛒 COMMERCE & PRODUCTS
- **RapidAPI Key (Amazon)**: ✅ Configurado via environment
  - Uso: Real Amazon Product Data
  - Revenue Impact: $10K-$50K/month
  - Localização: `inject-secrets.sh`, `.env`, `credentialsService.ts`

- **AliExpress Dropshipping**: ❌ Pendente
  - App Key + App Secret
  - Setup: https://developers.aliexpress.com/

- **Alibaba Dropshipping**: ❌ Pendente
  - Dropship Key + Secret
  - Setup: https://www.alibaba.com/dropshipping

### 🏢 COMPANY INFORMATION
- **Company Name**: ✅ Rafael Roberto Rodrigues de Oliveira Consultoria em TI CORP
- **EIN**: ✅ 33-3939483
- **Address**: ✅ Orlando, FL
- **Trade Name**: ✅ Global Supplements
- **Localização**: `inject-secrets.sh`, `.env`, `credentialsService.ts`

### 📧 MARKETING & COMMUNICATION
- **Gmail OAuth**: ✅ COMPLETO! (2025-10-12)
  - ✅ Gmail Client ID: 811444354101-...
  - ✅ Gmail Client Secret: G0CSPX-...
  - ✅ Gmail Refresh Token: 1//04TXc4xksxPTb...
  - Revenue Impact: $5K-$15K/month ✅ DESBLOQUEADO!
  - Setup: OAuth completo via Google Cloud Console + OAuth Playground
  - Email: globalsuplements.official@gmail.com
  
- **SendGrid API**: ✅ CONFIGURADO (2025-10-12)
  - Key: SG.VI7Y... ✅
  - Revenue Impact: $2K-$8K/month
  - Setup: https://app.sendgrid.com/settings/api_keys
  
- **Buffer Access Token**: ❌ Pendente
  - Setup: https://buffer.com/developers
  
- **Google Search Console**: ❌ Pendente
  - Setup: https://search.google.com/search-console

### 👔 B2B DETECTION
- **LinkedIn Email**: ❌ Pendente
- **LinkedIn Password**: ❌ Pendente
  - Uso: B2B Buyer Detection via scraping

### 💳 PAYMENT PROCESSING
- **Stripe Public Key**: ✅ CONFIGURADO (2025-10-12)
  - Key: pk_test_51SHW... ✅
  - Frontend-safe key
  - Revenue Impact: $3K-$10K/month
  
- **Stripe Secret Key**: ✅ CONFIGURADO (2025-10-12)
  - Key: sk_live_51SHWC5... ✅ (LIVE/PRODUCTION KEY!)
  - Server-side only for security
  - Setup: https://dashboard.stripe.com/apikeys
  
- **Payoneer ID**: ❌ Pendente
  - Setup: https://www.payoneer.com
  - Critical: $50K+ bloqueado

### 🚚 LOGISTICS (Opcional)
- **DHL API**: ❌ Pendente
- **FedEx API**: ❌ Pendente
- **UPS API**: ❌ Pendente

### 🎬 YOUTUBE & VIDEO (Opcional)
- **YouTube Data API**: ❌ Pendente
  - Setup: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- **YouTube Channel ID**: ❌ Pendente

### 💱 CURRENCY (Opcional)
- **Exchange Rate API**: ❌ Pendente
  - Setup: https://app.exchangerate-api.com/sign-up

### 🤝 AFFILIATE PROGRAMS (Opcional)
- **iHerb Affiliate ID**: ❌ Pendente
  - Setup: https://www.iherb.com/info/affiliate-program
- **Vitacost Affiliate ID**: ❌ Pendente
  - Setup: https://www.vitacost.com/affiliates

---

## 📚 COMO USAR AS CREDENCIAIS

### 1. **Serviço Centralizado** (RECOMENDADO)
```typescript
import credentialsService from '@/services/credentialsService';

// Get any credential
const openaiKey = credentialsService.getOpenAIKey();
const rapidApiKey = credentialsService.getRapidAPIKey();
const stripePublic = credentialsService.getStripePublicKey();
const sendgrid = credentialsService.getSendGridApiKey();
const companyInfo = credentialsService.getCompanyInfo();

// Check status
const status = credentialsService.getConfigurationStatus();
console.log(`${status.configured}/${status.total} APIs configured`);
```

### 2. **Environment Variables (Frontend)**
```typescript
const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY;
const openai = import.meta.env.VITE_OPENAI_API_KEY;
const stripePublic = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const sendgrid = import.meta.env.VITE_SENDGRID_API_KEY;
```

### 3. **Server-Side Only (Edge Functions)**
```typescript
// These are NOT in VITE_ vars for security
const stripeSecret = process.env.STRIPE_SECRET_KEY; // sk_live_...
const gmailClientId = process.env.GMAIL_CLIENT_ID;
const gmailSecret = process.env.GMAIL_CLIENT_SECRET;
const gmailRefresh = process.env.GMAIL_REFRESH_TOKEN;
```

---

## ⚠️ REGRAS IMPORTANTES

### ❌ NUNCA FAÇA ISSO:
1. **NÃO solicite credenciais que JÁ EXISTEM**
   - OpenAI ✅ JÁ TEM
   - RapidAPI ✅ JÁ TEM
   - Stripe ✅ JÁ TEM (ambas keys - LIVE em produção!)
   - SendGrid ✅ JÁ TEM
   - Gmail OAuth ✅ JÁ TEM (COMPLETO!)
   - Company Info ✅ JÁ TEM
   - Supabase ✅ JÁ TEM

2. **NÃO duplique código de credenciais**
   - Use `credentialsService` sempre!

3. **NÃO hardcode credenciais**
   - Use environment variables

4. **NÃO exponha secrets server-side**
   - Stripe Secret (sk_live_), Gmail OAuth = server-side ONLY

### ✅ SEMPRE FAÇA ISSO:
1. **Use credentialsService** para TUDO
2. **Verifique status** antes de solicitar
3. **Documente** novas credenciais aqui
4. **Atualize inject-secrets.sh** quando adicionar novas
5. **Mantenha secrets sensíveis server-side** (sem VITE_)

---

## 📊 STATUS ATUAL (ATUALIZADO 2025-10-12)

- **Configuradas**: 9/25 (36%) - UP from 32%!
- **Críticas Faltando**: 1 (Payoneer)
- **High Priority Faltando**: 2 (LinkedIn, AliExpress)
- **Potencial Desbloqueado**: $35K-$63K/mês ✅
- **Potencial Bloqueado**: $67K+/mês

### ✅ ÚLTIMAS CONFIGURAÇÕES (2025-10-12):
- ✅ SendGrid API Key configurado
- ✅ Stripe Public Key (pk_test_) configurado  
- ✅ Stripe Secret Key (sk_live_) configurado - **PRODUÇÃO ATIVA!**
- ✅ Gmail OAuth COMPLETO (Client ID + Secret + Refresh Token) - **EMAIL OUTREACH ATIVO!**

---

## 🚀 PRÓXIMOS PASSOS (PRIORIDADE)

1. **Payoneer ID** → Desbloquear pagamentos internacionais → $50K+
2. **LinkedIn Credentials** → B2B detection → $2K-$10K/mês
3. **AliExpress Keys** → Dropshipping automation → $5K-$20K/mês
4. **Alibaba Keys** → B2B marketplace → $10K-$30K/mês

---

## 📝 ATUALIZAR ESTE ARQUIVO

Quando adicionar nova credencial:
1. Adicione em `credentialsService.ts`
2. Adicione em `inject-secrets.sh`
3. Documente aqui com ✅ ou ❌
4. Marque setup URL, revenue impact e descrição
5. Atualize percentual no topo
6. Adicione data da configuração
