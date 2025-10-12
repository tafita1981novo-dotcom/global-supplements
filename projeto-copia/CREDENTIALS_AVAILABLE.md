# 🔑 TODAS AS CREDENCIAIS DISPONÍVEIS NO PROJETO

## ✅ CREDENCIAIS JÁ CONFIGURADAS (NÃO SOLICITE NOVAMENTE!)

### 🏗️ INFRASTRUCTURE
- **Supabase URL**: ✅ (Configurado via environment)
- **Supabase Anon Key**: ✅ (Configurado via environment)
- **Localização**: `inject-secrets.sh`, `.env`, `credentialsService.ts`

### 🤖 AI SERVICES
- **OpenAI API Key**: ✅ (Configurado via RAPIDAPI_KEY env var)
  - Uso: GPT-4 Negotiations, Content Generation
  - Localização: `inject-secrets.sh`, `.env`, `credentialsService.ts`

- **Google Gemini**: ❌ (Pendente)
  - Setup: https://aistudio.google.com/app/apikey

### 🛒 COMMERCE & PRODUCTS
- **RapidAPI Key (Amazon)**: ✅ (Configurado via OPENAI_API_KEY env var)
  - Uso: Real Amazon Product Data
  - Localização: `inject-secrets.sh`, `.env`, `credentialsService.ts`

- **AliExpress Dropshipping**: ❌ (Pendente)
  - App Key + App Secret
  - Setup: https://developers.aliexpress.com/

- **Alibaba Dropshipping**: ❌ (Pendente)
  - Dropship Key + Secret
  - Setup: https://www.alibaba.com/dropshipping

### 🏢 COMPANY INFORMATION (JÁ DISPONÍVEL!)
- **Company Name**: ✅ (Configurado via environment)
- **EIN**: ✅ (Configurado via environment)
- **Address**: ✅ (Configurado via environment)
- **Trade Name**: ✅ (Configurado via environment)
- **Localização**: `inject-secrets.sh`, `.env`, `credentialsService.ts`

### 📧 MARKETING & COMMUNICATION
- **Gmail API**: ❌ (Pendente)
  - Setup: https://console.cloud.google.com/apis/library/gmail.googleapis.com
  
- **SendGrid API**: ❌ (Pendente)
  - Setup: https://app.sendgrid.com/settings/api_keys
  
- **Buffer Access Token**: ❌ (Pendente)
  - Setup: https://buffer.com/developers
  
- **Google Search Console**: ❌ (Pendente)
  - Setup: https://search.google.com/search-console

### 👔 B2B DETECTION
- **LinkedIn Email**: ❌ (Pendente)
- **LinkedIn Password**: ❌ (Pendente)
  - Uso: B2B Buyer Detection via scraping

### 💳 PAYMENT PROCESSING
- **Stripe Secret Key**: ❌ (Pendente)
  - Setup: https://dashboard.stripe.com/apikeys
  
- **Payoneer ID**: ❌ (Pendente)
  - Setup: https://www.payoneer.com
  - Critical: $50K+ blocked

### 🚚 LOGISTICS (Opcional)
- **DHL API**: ❌ (Pendente)
- **FedEx API**: ❌ (Pendente)
- **UPS API**: ❌ (Pendente)

### 🎬 YOUTUBE & VIDEO (Opcional)
- **YouTube Data API**: ❌ (Pendente)
  - Setup: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- **YouTube Channel ID**: ❌ (Pendente)

### 💱 CURRENCY (Opcional)
- **Exchange Rate API**: ❌ (Pendente)
  - Setup: https://app.exchangerate-api.com/sign-up

### 🤝 AFFILIATE PROGRAMS (Opcional)
- **iHerb Affiliate ID**: ❌ (Pendente)
  - Setup: https://www.iherb.com/info/affiliate-program
- **Vitacost Affiliate ID**: ❌ (Pendente)
  - Setup: https://www.vitacost.com/affiliates

---

## 📚 COMO USAR AS CREDENCIAIS

### 1. **Serviço Centralizado** (RECOMENDADO)
```typescript
import credentialsService from '@/services/credentialsService';

// Get any credential
const openaiKey = credentialsService.getOpenAIKey();
const rapidApiKey = credentialsService.getRapidAPIKey();
const companyInfo = credentialsService.getCompanyInfo();

// Check status
const status = credentialsService.getConfigurationStatus();
console.log(`${status.configured}/${status.total} APIs configured`);
```

### 2. **Environment Variables**
```typescript
const key = import.meta.env.VITE_RAPIDAPI_KEY_1;
const openai = import.meta.env.VITE_OPENAI_API_KEY;
```

### 3. **Direct from .env**
Todas as variáveis estão disponíveis em:
- `projeto-copia/.env` (gerado automaticamente)
- `projeto-copia/inject-secrets.sh` (script de injeção)

---

## ⚠️ REGRAS IMPORTANTES

### ❌ NUNCA FAÇA ISSO:
1. **NÃO solicite credenciais que JÁ EXISTEM**
   - OpenAI ✅ JÁ TEM
   - RapidAPI ✅ JÁ TEM
   - Company Info ✅ JÁ TEM
   - Supabase ✅ JÁ TEM

2. **NÃO duplique código de credenciais**
   - Use `credentialsService` sempre!

3. **NÃO hardcode credenciais**
   - Use environment variables

### ✅ SEMPRE FAÇA ISSO:
1. **Use credentialsService** para TUDO
2. **Verifique status** antes de solicitar
3. **Documente** novas credenciais aqui
4. **Atualize inject-secrets.sh** quando adicionar novas

---

## 📊 STATUS ATUAL

- **Configuradas**: 4/16 (25%)
- **Críticas Faltando**: 2 (Gmail, Payoneer)
- **High Priority Faltando**: 3 (LinkedIn, Stripe, AliExpress)
- **Potencial Desbloqueado**: $15K+/mês
- **Potencial Bloqueado**: $50K+/mês

---

## 🚀 PRÓXIMOS PASSOS

1. Configurar **Gmail API** → Desbloqueia email outreach ($3K-$15K/mês)
2. Configurar **Payoneer** → Desbloqueia pagamentos ($50K+)
3. Configurar **LinkedIn** → Desbloqueia B2B detection ($2K-$10K/mês)
4. Configurar **Stripe** → Desbloqueia payment processing ($1K-$5K/mês)

---

## 📝 ATUALIZAR ESTE ARQUIVO

Quando adicionar nova credencial:
1. Adicione em `credentialsService.ts`
2. Adicione em `inject-secrets.sh`
3. Documente aqui com ✅ ou ❌
4. Marque setup URL e descrição
