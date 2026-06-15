# CLAUDE EXPORT — Global Supplements Premium Worldwide Network
**Data:** 15 de Junho de 2026
**Para uso direto no Claude (nova sessão) — contém tudo necessário**

---

## 1. VISÃO GERAL DO PROJETO

Plataforma de suplementos globais com duas frentes principais:
1. **Site público** (`/`) — Marketing, parcerias, portfólio, categorias de produtos
2. **Amazon Afiliado** (`/amazon`) — Loja afiliada com produtos reais da Amazon
3. **Dashboard interno** (`/dashboard`) — Gestão, marketing, configurações

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router + TanStack Query + i18next (15 idiomas)

---

## 2. INFRAESTRUTURA & HOSPEDAGEM

### Replit
- **Workflow name:** `Server`
- **Comando:** `cd projeto-copia && chmod +x inject-secrets.sh && ./inject-secrets.sh && npm start`
- **Como funciona:** `inject-secrets.sh` cria `.env` com os secrets → `npm run build` → `serve dist -l 5000 -s`
- **Porta:** 5000
- **IMPORTANTE:** Após qualquer mudança de código → rodar `npm run build` dentro de `projeto-copia/` → reiniciar o workflow

### Supabase
- **URL:** `https://twglceexfetejawoumsr.supabase.co`
- **Project ID:** `twglceexfetejawoumsr`
- **Anon Key (pública — segura para frontend):**
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY
  ```

### GitHub
- **Repo:** `github.com/tafita81/global-supplements`
- **Integração:** GitHub conectado via Replit (`GITHUB_TOKEN`)
- **AVISO:** Git push bloqueado no agente — usar o painel Git do Replit manualmente

### Domínio
- **Site:** `https://globalsupplements.site`

---

## 3. TODAS AS CREDENCIAIS CONFIGURADAS

### Secrets no Replit (valores armazenados de forma segura)

| Secret Name | Finalidade | Valor conhecido | Status |
|---|---|---|---|
| `GITHUB_TOKEN` | Push/pull para GitHub | — | ✅ Ativo |
| `GMAIL_CLIENT_ID` | Gmail OAuth | — | ✅ Ativo |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth | — | ✅ Ativo |
| `GMAIL_REFRESH_TOKEN` | Gmail OAuth token | — | ✅ Ativo |
| `PAYONEER_ID` | Pagamentos internacionais | **99133638** | ✅ Ativo |
| `SENDGRID_API_KEY` | Email marketing | — | ✅ Ativo |
| `STRIPE_PUBLIC_KEY` | Stripe frontend | começa com `pk_test_51SHW...` | ✅ Ativo |
| `STRIPE_SECRET_KEY` | Stripe backend **LIVE/PRODUÇÃO** | começa com `sk_live_51SHWC5...` | ✅ Ativo |
| `SUPABASE_ACCESS_TOKEN` | Admin Supabase | — | ✅ Ativo |
| `RAPIDAPI_KEY` | API Amazon produtos reais | começa com `be45bf9b25mshe...` | ⚠️ **403 — Assinatura expirada** |
| `OPENAI_API_KEY` | GPT-4 validação e AI content | — | ⚠️ Verificar |

### Dados da empresa (hardcoded no inject-secrets.sh — não são secrets)
```
VITE_COMPANY_NAME   = Rafael Roberto Rodrigues de Oliveira Consultoria em Tecnologia da Informação CORP
VITE_COMPANY_EIN    = 33-3939483
VITE_COMPANY_ADDRESS= 6200 Metrowest, Orlando, FL 32385, USA
VITE_TRADE_NAME     = Global Supplements - Premium Worldwide Network
VITE_PAYONEER_ID    = 99133638
```

### Supabase (não-secretas — usadas no frontend)
```
VITE_SUPABASE_URL      = https://twglceexfetejawoumsr.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY
```

---

## 4. ARQUIVO inject-secrets.sh (completo)

```bash
#!/bin/bash
echo "🔐 Injetando secrets do Replit no .env..."
cat > .env << EOF
VITE_SUPABASE_URL=https://twglceexfetejawoumsr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY
VITE_RAPIDAPI_KEY_1=${RAPIDAPI_KEY}
VITE_OPENAI_API_KEY=${OPENAI_API_KEY}
VITE_COMPANY_NAME=Rafael Roberto Rodrigues de Oliveira Consultoria em Tecnologia da Informação CORP
VITE_COMPANY_EIN=33-3939483
VITE_COMPANY_ADDRESS=6200 Metrowest, Orlando, FL 32385, USA
VITE_TRADE_NAME=Global Supplements - Premium Worldwide Network
VITE_STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
VITE_SENDGRID_API_KEY=${SENDGRID_API_KEY}
GMAIL_CLIENT_ID=${GMAIL_CLIENT_ID}
GMAIL_CLIENT_SECRET=${GMAIL_CLIENT_SECRET}
GMAIL_REFRESH_TOKEN=${GMAIL_REFRESH_TOKEN}
VITE_PAYONEER_ID=${PAYONEER_ID}
EOF
echo "✅ Secrets injetadas com sucesso!"
```

---

## 5. PROBLEMA ATUAL — AMAZON "No Products Found"

**Causa raiz confirmada:** `RAPIDAPI_KEY` retorna HTTP 403 `"You are not subscribed to this API."` ao chamar `real-time-amazon-data.p.rapidapi.com`.

**O que acontece:**
- `MultiAPIClient.searchProducts()` → HTTP 403 → retorna `[]`
- Amazon.tsx recebe array vazio → exibe "No products found"

**Para corrigir (ação do usuário):**
- Entrar na conta RapidAPI que possui a chave `be45bf9b25mshe...`
- Reativar/assinar o plano "Real-Time Amazon Data" (letscrape) — tem plano gratuito
- OU fornecer nova chave de outro provedor de API Amazon

**Arquivo da API:** `projeto-copia/src/services/rapidAPIClient.ts`
**Usuário NÃO quer fallback de produtos curados — quer API real.**

---

## 6. ROTAS COMPLETAS (App.tsx)

```
SITE PÚBLICO
/                          PublicSite (landing page principal)
/public-site               PublicSite (alias)
/global-partnerships       GlobalPartnerships
/premium-portfolio         PremiumPortfolio
/product-patent-guide      ProductPatentGuide
/enterprise-solutions      EnterpriseSolutions
/real-time-execution       RealTimeExecution
/market-intelligence       MarketIntelligence

CATEGORIAS DE PRODUTO (público)
/beauty-supplements        BeautySupplements
/quantum-materials         QuantumMaterials
/medical-grade             MedicalGrade
/smart-gadgets             SmartGadgets
/traditional-wellness      TraditionalWellness
/b2b-solutions             B2BSolutions
/government-contracts      GovernmentContracts
/manufacturing             Manufacturing
/research-development      ResearchDevelopment
/market-intelligence-category  MarketIntelligenceCategory
/bundles                   Bundles
/bundles/:bundleId         BundleDetail
/b2b                       B2BDistribution
/products                  Products
/pre-order-policy          PreOrderPolicy
/amazon                    Amazon (loja afiliada — PRINCIPAL)

DASHBOARD INTERNO
/dashboard                 Index (dashboard principal)
/home                      Home
/opportunities             Opportunities
/suppliers                 Suppliers
/mycogenesis               Mycogenesis
/logistics                 Logistics
/compliance                Compliance

MARKETING
/ai-content-generator      AIContentGenerator
/google-ads-campaigns      GoogleAdsCampaignsPage
/marketing-dashboard       MarketingDashboard

CONFIGURAÇÕES
/settings                  Settings
/api-setup                 APISetup
/credentials-manager       CredentialsManager
/registration-details      RegistrationDetails
/company-documents         CompanyDocuments

*                          NotFound (404)
```

---

## 7. ESTRUTURA DE ARQUIVOS

```
projeto-copia/
├── inject-secrets.sh              ← Cria .env com secrets do Replit
├── package.json
├── vite.config.ts
├── index.html
├── CLAUDE_EXPORT.md               ← Este arquivo
└── src/
    ├── App.tsx                    ← Todas as 40 rotas
    ├── main.tsx
    ├── pages/                     ← 40 páginas
    │   ├── Amazon.tsx             ← Loja afiliada (1309 linhas) ← PRINCIPAL
    │   ├── PublicSite.tsx         ← Landing page principal
    │   ├── Index.tsx              ← Dashboard principal (/dashboard)
    │   ├── Dashboard.tsx          ← Componente dashboard limpo
    │   ├── Home.tsx
    │   ├── Opportunities.tsx
    │   ├── Suppliers.tsx
    │   ├── Mycogenesis.tsx
    │   ├── Logistics.tsx
    │   ├── Compliance.tsx
    │   ├── Settings.tsx
    │   ├── APISetup.tsx
    │   ├── AIContentGenerator.tsx
    │   ├── GoogleAdsCampaigns.tsx
    │   ├── MarketingDashboard.tsx
    │   ├── CredentialsManager.tsx
    │   ├── RegistrationDetails.tsx
    │   ├── CompanyDocuments.tsx
    │   ├── GlobalPartnerships.tsx
    │   ├── PremiumPortfolio.tsx
    │   ├── ProductPatentGuide.tsx
    │   ├── EnterpriseSolutions.tsx
    │   ├── RealTimeExecution.tsx
    │   ├── MarketIntelligence.tsx
    │   ├── MarketIntelligenceCategory.tsx
    │   ├── BeautySupplements.tsx
    │   ├── QuantumMaterials.tsx
    │   ├── MedicalGrade.tsx
    │   ├── SmartGadgets.tsx
    │   ├── TraditionalWellness.tsx
    │   ├── B2BSolutions.tsx
    │   ├── B2BDistribution.tsx
    │   ├── GovernmentContracts.tsx
    │   ├── Manufacturing.tsx
    │   ├── ResearchDevelopment.tsx
    │   ├── Bundles.tsx
    │   ├── BundleDetail.tsx
    │   ├── Products.tsx
    │   ├── PreOrderPolicy.tsx
    │   └── NotFound.tsx
    ├── services/
    │   ├── rapidAPIClient.ts      ← API Amazon (MultiAPIClient) ← PROBLEMA AQUI
    │   ├── amazonStrategy.ts      ← Estratégia AI Amazon
    │   ├── aiProductValidator.ts  ← Validação GPT-4 dos produtos
    │   ├── productMonitor.ts      ← Monitor de preços
    │   ├── instantCache.ts        ← Cache LocalStorage (5 min)
    │   ├── geolocation.ts         ← Detecção automática de país
    │   ├── currency.ts            ← Conversão de moedas
    │   ├── gmailOAuthService.ts   ← Gmail OAuth
    │   ├── emailNegotiationService.ts
    │   ├── gpt4NegotiationService.ts
    │   ├── supplierMatchingService.ts
    │   ├── buyerDetectionService.ts
    │   ├── automationOrchestrator.ts
    │   ├── credentialsService.ts
    │   ├── realDataIngestion.ts
    │   └── systemMetrics.ts
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx       ← Layout dashboard interno
    │   │   ├── AppSidebar.tsx      ← Sidebar limpa (sem broker)
    │   │   ├── PublicSiteLayout.tsx
    │   │   ├── PublicHeader.tsx
    │   │   ├── PublicFooter.tsx
    │   │   └── TopNavigation.tsx
    │   ├── amazon/
    │   │   └── AmazonHeader.tsx
    │   └── ui/                    ← shadcn/ui components
    ├── config/
    │   └── amazonMarketplaces.ts  ← 14 marketplaces + affiliate tags
    ├── hooks/
    │   └── useMarketplace.ts      ← Hook marketplace com geolocalização
    └── assets/
        ├── flags/                 ← Bandeiras US, CA, GB, DE, FR, IT, ES, JP, AU, NL, SE, SG, PL, SA
        └── amazon-icon.png
```

---

## 8. AMAZON AFILIADO — DETALHES COMPLETOS

**Afiliado Tag:** `globalsupleme-20`
**Formato link:** `https://www.amazon.com/dp/{ASIN}?tag=globalsupleme-20`

### 14 Marketplaces Configurados
| País | Domínio | Código API |
|---|---|---|
| EUA | amazon.com | US |
| Reino Unido | amazon.co.uk | GB (⚠️ API usa GB não UK) |
| Canadá | amazon.ca | CA |
| Alemanha | amazon.de | DE |
| França | amazon.fr | FR |
| Itália | amazon.it | IT |
| Espanha | amazon.es | ES |
| Japão | amazon.co.jp | JP |
| Austrália | amazon.com.au | AU |
| Holanda | amazon.nl | NL |
| Suécia | amazon.se | SE |
| Singapura | amazon.sg | SG |
| Polônia | amazon.pl | PL |
| Arábia Saudita | amazon.sa | SA |

### Categorias da Página Amazon
- `beauty` — Beauty & Personal Care
- `vitamins` — Vitamins & Supplements
- `sports` — Sports Nutrition
- `wellness` — Health & Household
- `devices` — Health Devices
- `quantum` — Nootropics / Advanced Supplements
- `mycogenesis` — Mushroom Supplements

### Fluxo de busca (Amazon.tsx — 1309 linhas)
```
1. Detecta localização do usuário (geolocation.ts)
2. Seleciona marketplace automaticamente
3. Chama MultiAPIClient.searchProducts(query, limit, country, domain, sortBy)
4. API: real-time-amazon-data.p.rapidapi.com/search
5. Valida produtos com GPT-4 (aiProductValidator.ts)
6. Exibe grid de produtos com link afiliado
7. Cache LocalStorage de 5 min para carregamento rápido
```

---

## 9. SUPABASE — TABELAS PRINCIPAIS

```sql
-- Core
execution_history       -- Histórico de execuções automáticas
compliance_checks       -- Verificações de conformidade
opportunities           -- Oportunidades de negócio
suppliers               -- Fornecedores cadastrados
government_contracts    -- Contratos governamentais
market_trends           -- Tendências de mercado
b2b_buyers              -- Compradores B2B detectados
negotiations            -- Negociações ativas

-- Sistema broker (Edge Functions — não usado pelo frontend)
supplier_apis                  -- 100+ APIs de fornecedores
supplier_product_mappings      -- Produtos confirmados com preços/prazos
parallel_negotiations          -- Negociações simultâneas
risk_assessments               -- Avaliações de risco GPT-4
manual_interventions           -- Alertas críticos
supplier_selection_criteria    -- Critérios de seleção
learning_events                -- Aprendizado contínuo
conversation_timelines         -- Timing de conversações AI
```

---

## 10. INTERNACIONALIZAÇÃO

- **Biblioteca:** i18next + react-i18next
- **15 idiomas:** EN, PT, ES, FR, DE, IT, JA, ZH, AR, RU, KO, NL, PL, SV, TR
- **Provider:** `src/components/ui/I18nProvider.tsx`
- **Uso:** `const { t } = useTranslation()`

---

## 11. BUILD & DEPLOY

```bash
# Dentro de projeto-copia/:

# Build de produção
npm run build

# Iniciar servidor
npm start
# → serve dist -l 5000 -s

# Verificar TypeScript sem erros
npx tsc --noEmit

# Testar API Amazon manualmente (substituir SUA_KEY)
curl -H "x-rapidapi-key: SUA_KEY" \
     -H "x-rapidapi-host: real-time-amazon-data.p.rapidapi.com" \
     "https://real-time-amazon-data.p.rapidapi.com/search?query=vitamins&country=US"
```

---

## 12. DECISÕES IMPORTANTES (para novo agente respeitar)

| Decisão | Motivo |
|---|---|
| ❌ Sem sistema broker no frontend | Usuário pediu remoção — 25+ páginas broker deletadas |
| ❌ Sem fallback de produtos curados | Usuário quer API real da Amazon, não produtos estáticos |
| ✅ API Amazon original mantida | rapidAPIClient.ts igual ao original |
| ✅ TypeScript relaxado | Strictness reduzida para desenvolvimento rápido |
| ✅ SPA estático | Build → dist/ → servido com `serve` |
| ✅ VITE_* prefix obrigatório | Todas variáveis do frontend precisam prefixo VITE_ |
| ✅ inject-secrets.sh antes do build | Cria .env dinamicamente com secrets do Replit |
| ✅ Geolocalização automática | Detecta país e muda marketplace Amazon automaticamente |

---

## 13. O QUE FOI FEITO NESTA SESSÃO

- ✅ Removidos 25+ páginas do sistema broker do frontend
- ✅ App.tsx reescrito com 40 rotas limpas
- ✅ AppSidebar.tsx limpo (sem broker)
- ✅ Dashboard.tsx limpo (sem broker)
- ✅ Build passa com 0 erros TypeScript
- ✅ Workflow Server configurado e rodando (porta 5000)
- ✅ Diagnosticado problema Amazon: HTTP 403 por assinatura RapidAPI expirada

## 14. PREFERÊNCIAS DO USUÁRIO

- Comunicação em **Português**
- Não quer produtos curados/estáticos — quer **API real da Amazon**
- Não quer sistema broker no frontend (broker existe apenas no Supabase Edge Functions)
- Stripe está em **modo LIVE/PRODUÇÃO** (`sk_live_...`) — cuidado com pagamentos reais

---

*Exportado em 15/06/2026 — Global Supplements Premium Worldwide Network*
