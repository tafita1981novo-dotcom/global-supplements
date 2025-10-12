# 🔑 TODAS AS CREDENCIAIS DISPONÍVEIS NO PROJETO

## ✅ CREDENCIAIS JÁ CONFIGURADAS (8/25 - 32%)

### 🏗️ INFRASTRUCTURE
- **Supabase URL**: ✅ Configurado via environment
- **Supabase Anon Key**: ✅ Configurado via environment
- **Localização**: `inject-secrets.sh`, `.env`, `credentialsService.ts`

### 🤖 AI SERVICES
- **OpenAI API Key**: ✅ Configurado via environment
  - Uso: GPT-4 Negotiations, Content Generation
  - Revenue Impact: $5K-$20K/month
  - Localização: `inject-secrets.sh`, `.env`, `credentialsService.ts`

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
- **Gmail OAuth**: ⚠️ PARCIALMENTE CONFIGURADO
  - ✅ Gmail Client ID
  - ✅ Gmail Client Secret
  - ❌ Gmail Refresh Token (precisa gerar via OAuth Playground)
  - Revenue Impact: $5K-$15K/month (quando completo)
  - Setup: Ver `GMAIL_OAUTH_SETUP.md`
  
- **SendGrid API**: ✅ Configurado via user
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
- **Stripe Public Key**: ✅ Configurado (pk_test_...)
  - Frontend-safe key
  
- **Stripe Secret Key**: ✅ Configurado (sk_test_...)
  - Server-side only for security
  - Revenue Impact: $3K-$10K/month
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
const companyInfo = credentialsService.getCompanyInfo();

// Check status
const status = credentialsService.getConfigurationStatus();
console.log(`${status.configured}/${status.total} APIs configured`);
```

### 2. **Environment Variables**
```typescript
const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY;
const openai = import.meta.env.VITE_OPENAI_API_KEY;
const stripePublic = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
```

### 3. **Server-Side Only (Edge Functions)**
```typescript
// These are NOT in VITE_ vars for security
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const gmailRefresh = process.env.GMAIL_REFRESH_TOKEN;
```

---

## ⚠️ REGRAS IMPORTANTES

### ❌ NUNCA FAÇA ISSO:
1. **NÃO solicite credenciais que JÁ EXISTEM**
   - OpenAI ✅ JÁ TEM
   - RapidAPI ✅ JÁ TEM
   - Stripe ✅ JÁ TEM (ambas keys)
   - SendGrid ✅ JÁ TEM
   - Company Info ✅ JÁ TEM
   - Supabase ✅ JÁ TEM

2. **NÃO duplique código de credenciais**
   - Use `credentialsService` sempre!

3. **NÃO hardcode credenciais**
   - Use environment variables

4. **NÃO exponha secrets server-side**
   - Stripe Secret, Gmail Refresh Token = server-side ONLY

### ✅ SEMPRE FAÇA ISSO:
1. **Use credentialsService** para TUDO
2. **Verifique status** antes de solicitar
3. **Documente** novas credenciais aqui
4. **Atualize inject-secrets.sh** quando adicionar novas
5. **Mantenha secrets sensíveis server-side** (sem VITE_)

---

## 📊 STATUS ATUAL

- **Configuradas**: 8/25 (32%)
- **Parcialmente Configuradas**: 1 (Gmail OAuth - falta Refresh Token)
- **Críticas Faltando**: 2 (Gmail Refresh Token, Payoneer)
- **High Priority Faltando**: 2 (LinkedIn, AliExpress)
- **Potencial Desbloqueado**: $30K+/mês
- **Potencial Bloqueado**: $55K+/mês

---

## 🚀 PRÓXIMOS PASSOS (PRIORIDADE)

1. **Gmail Refresh Token** → Completar OAuth → $5K-$15K/mês
2. **Payoneer ID** → Desbloquear pagamentos internacionais → $50K+
3. **LinkedIn Credentials** → B2B detection → $2K-$10K/mês
4. **AliExpress Keys** → Dropshipping automation → $5K-$20K/mês

---

## 📝 ATUALIZAR ESTE ARQUIVO

Quando adicionar nova credencial:
1. Adicione em `credentialsService.ts`
2. Adicione em `inject-secrets.sh`
3. Documente aqui com ✅ ou ❌
4. Marque setup URL, revenue impact e descrição
5. Atualize percentual no topo
