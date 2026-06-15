# 🌍 GLOBAL SUPPLEMENTS — EXPORTAÇÃO COMPLETA PARA CLAUDE
> Documento de transferência de controle total do projeto. Atualizado: 2025-10-13

---

## 🎯 O QUE É ESTE PROJETO

**Global Supplements — Premium Worldwide Network**
Site B2B/B2C de suplementos premium com afiliação Amazon. Conecta fornecedores globais a compradores (governos, empresas, consumidores). Produtos: Beauty, Quantum Materials, Medical Grade, Smart Gadgets, Traditional Wellness.

- **Site público:** https://globalsupplements.site e https://www.globalsupplements.site
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase
- **Pasta do código:** `projeto-copia/`

---

## 🗂️ ESTRUTURA DO PROJETO

```
projeto-copia/
├── src/
│   ├── App.tsx                        ← Todas as rotas do app
│   ├── pages/                         ← 40 páginas (ver lista abaixo)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          ← Layout com sidebar (dashboard interno)
│   │   │   ├── AppSidebar.tsx         ← Menu lateral do dashboard
│   │   │   ├── PublicSiteLayout.tsx   ← Layout para páginas públicas
│   │   │   ├── PublicHeader.tsx       ← Cabeçalho do site público
│   │   │   ├── PublicFooter.tsx       ← Rodapé do site público
│   │   │   └── TopNavigation.tsx      ← Navegação superior
│   │   ├── dashboard/                 ← Componentes do dashboard interno
│   │   ├── public/                    ← Componentes do site público
│   │   ├── amazon/                    ← Componentes da página Amazon
│   │   ├── premium/                   ← Componentes premium
│   │   └── ui/                        ← shadcn/ui components
│   ├── integrations/supabase/
│   │   ├── client.ts                  ← Cliente Supabase
│   │   └── types.ts                   ← Tipos TypeScript das tabelas
│   ├── hooks/                         ← React hooks customizados
│   └── services/                      ← Serviços (email, Amazon, IA, etc.)
├── supabase/functions/                ← Edge Functions (backend serverless)
├── inject-secrets.sh                  ← Injeta variáveis de ambiente
├── package.json
└── dist/                              ← Build de produção (gerado pelo npm run build)
```

---

## 📄 TODAS AS PÁGINAS (40 páginas)

### 🌐 Site Público (PublicSiteLayout)
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `PublicSite.tsx` | Página principal do site |
| `/public-site` | `PublicSite.tsx` | Alias da home |
| `/global-partnerships` | `GlobalPartnerships.tsx` | Parcerias globais |
| `/premium-portfolio` | `PremiumPortfolio.tsx` | Catálogo premium |
| `/product-patent-guide` | `ProductPatentGuide.tsx` | Guia de patents |
| `/enterprise-solutions` | `EnterpriseSolutions.tsx` | Soluções enterprise |
| `/real-time-execution` | `RealTimeExecution.tsx` | Execução em tempo real |
| `/market-intelligence` | `MarketIntelligence.tsx` | Inteligência de mercado |
| `/bundles` | `Bundles.tsx` | Pacotes de produtos |
| `/bundles/:bundleId` | `BundleDetail.tsx` | Detalhe do bundle |
| `/b2b` | `B2BDistribution.tsx` | Distribuição B2B |
| `/products` | `Products.tsx` | Catálogo de produtos |
| `/pre-order-policy` | `PreOrderPolicy.tsx` | Política de pré-venda |

### 📦 Categorias de Produtos (sem layout fixo)
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/beauty-supplements` | `BeautySupplements.tsx` | Suplementos de beleza |
| `/quantum-materials` | `QuantumMaterials.tsx` | Materiais quânticos |
| `/medical-grade` | `MedicalGrade.tsx` | Grau médico |
| `/smart-gadgets` | `SmartGadgets.tsx` | Gadgets inteligentes |
| `/traditional-wellness` | `TraditionalWellness.tsx` | Bem-estar tradicional |
| `/b2b-solutions` | `B2BSolutions.tsx` | Soluções B2B |
| `/government-contracts` | `GovernmentContracts.tsx` | Contratos governamentais |
| `/manufacturing` | `Manufacturing.tsx` | Manufatura |
| `/research-development` | `ResearchDevelopment.tsx` | P&D |
| `/market-intelligence-category` | `MarketIntelligenceCategory.tsx` | Intel por categoria |

### 🛒 Amazon Affiliate
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/amazon` | `Amazon.tsx` | Página de produtos Amazon |

### 💼 Dashboard Interno (AppLayout com sidebar)
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/dashboard` | `Index.tsx` → `Dashboard.tsx` | Painel principal |
| `/home` | `Home.tsx` | Home do dashboard |
| `/opportunities` | `Opportunities.tsx` | Oportunidades de negócio |
| `/suppliers` | `Suppliers.tsx` | Fornecedores |
| `/mycogenesis` | `Mycogenesis.tsx` | Linha Mycogenesis |
| `/logistics` | `Logistics.tsx` | Logística |
| `/compliance` | `Compliance.tsx` | Compliance/regulatório |

### 📢 Marketing (AppLayout)
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/ai-content-generator` | `AIContentGenerator.tsx` | Gerador de conteúdo IA |
| `/google-ads-campaigns` | `GoogleAdsCampaigns.tsx` | Campanhas Google Ads |
| `/marketing-dashboard` | `MarketingDashboard.tsx` | Dashboard de marketing |

### ⚙️ Config (AppLayout)
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/settings` | `Settings.tsx` | Configurações gerais |
| `/api-setup` | `APISetup.tsx` | Setup de APIs |
| `/credentials-manager` | `CredentialsManager.tsx` | Gerenciador de credenciais |
| `/registration-details` | `RegistrationDetails.tsx` | Dados do registro da empresa |
| `/company-documents` | `CompanyDocuments.tsx` | Documentos da empresa |

---

## 🔑 CREDENCIAIS E VARIÁVEIS DE AMBIENTE

### Supabase (principal banco de dados)
```
VITE_SUPABASE_URL=https://twglceexfetejawoumsr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY
```

### APIs disponíveis (configuradas via Replit Secrets)
| Serviço | Variável | Uso |
|---------|----------|-----|
| RapidAPI | `RAPIDAPI_KEY` | Produtos Amazon reais |
| OpenAI | `OPENAI_API_KEY` | GPT-4 para conteúdo |
| Stripe | `STRIPE_PUBLIC_KEY` + `STRIPE_SECRET_KEY` | Pagamentos (live!) |
| SendGrid | `SENDGRID_API_KEY` | Email marketing |
| Gmail OAuth | `GMAIL_CLIENT_ID` + `GMAIL_CLIENT_SECRET` + `GMAIL_REFRESH_TOKEN` | Email outreach |
| Payoneer | `PAYONEER_ID` = 99133638 | Pagamentos internacionais |

### Empresa
```
VITE_COMPANY_NAME=Rafael Roberto Rodrigues de Oliveira Consultoria em Tecnologia da Informação CORP
VITE_COMPANY_EIN=33-3939483
VITE_COMPANY_ADDRESS=6200 Metrowest, Orlando, FL 32385, USA
VITE_TRADE_NAME=Global Supplements - Premium Worldwide Network
```

---

## 🚀 COMO RODAR O PROJETO

### Desenvolvimento
```bash
cd projeto-copia
npm install
./inject-secrets.sh     # Cria o .env com as variáveis
npm run dev             # Servidor de dev na porta 8080
```

### Produção (como está rodando agora)
```bash
cd projeto-copia
./inject-secrets.sh
npm run build           # Gera a pasta dist/
npm start               # serve dist -l 5000 -s
```

### Workflow do Replit
- **Nome:** Server
- **Comando:** `cd projeto-copia && chmod +x inject-secrets.sh && ./inject-secrets.sh && npm start`
- **Porta:** 5000
- **Tipo:** webview

---

## 🗄️ BANCO DE DADOS SUPABASE

### Tabelas principais
- `opportunities` — Oportunidades de negócio
- `suppliers` — Fornecedores cadastrados
- `government_contracts` — Contratos governamentais
- `market_trends` — Tendências de mercado
- `b2b_buyers` — Compradores B2B
- `negotiations` — Negociações
- `execution_history` — Histórico de execuções
- `compliance_checks` — Verificações de compliance
- `amazon_products` — Produtos Amazon (via RapidAPI)

### Tabelas do sistema broker (existem no banco mas não têm frontend)
- `supplier_apis`, `supplier_product_mappings`, `parallel_negotiations`
- `risk_assessments`, `manual_interventions`, `supplier_selection_criteria`
- `rfq_inbox`, `learning_events`, `negotiation_strategies`, `conversation_timelines`

### Edge Functions (backend serverless — existem mas não são usadas pelo frontend atual)
As edge functions do broker ainda existem no Supabase:
`automation-scheduler`, `autonomous-negotiator`, `b2b-buyer-detector`,
`supplier-matcher`, `real-data-ingestion`, `generate-content`,
`sendgrid-integration`, `gmail-oauth-sender`, `buffer-integration`,
`gsc-integration`, `qa-assistant`, `notification-manager`, entre outras.

---

## 🎨 DESIGN SYSTEM

- **Framework CSS:** Tailwind CSS
- **Componentes:** shadcn/ui (baseado em Radix UI)
- **Cor primária:** Amarelo (`yellow-500` / `#EAB308`)
- **Tema:** Light/Dark mode suportado
- **Fonte:** Sistema padrão
- **Ícones:** Lucide React
- **Idiomas suportados:** 15+ via i18next (arquivo em `src/components/ui/I18nProvider.tsx`)

---

## 📐 ARQUITETURA DE LAYOUTS

### PublicSiteLayout
Para páginas voltadas a visitantes externos. Inclui:
- `PublicHeader.tsx` — Logo + menu de categorias + busca + idioma + Cart
- Conteúdo da página
- `PublicFooter.tsx` — Links, contato, redes sociais

### AppLayout
Para o dashboard interno. Inclui:
- `AppSidebar.tsx` — Menu lateral com todas as seções
- Conteúdo da página
- Sidebar colapsável em mobile

---

## 🔧 ARQUIVOS CRÍTICOS PARA MODIFICAR

| Arquivo | Para que serve |
|---------|---------------|
| `src/App.tsx` | Adicionar/remover rotas |
| `src/components/layout/AppSidebar.tsx` | Modificar menu lateral |
| `src/components/layout/PublicHeader.tsx` | Modificar menu superior do site público |
| `src/pages/PublicSite.tsx` | Página inicial do site |
| `src/pages/Dashboard.tsx` | Painel interno principal |
| `inject-secrets.sh` | Variáveis de ambiente |
| `vite.config.ts` | Configuração do Vite |

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "@supabase/supabase-js": "^2.58.0",
  "@tanstack/react-query": "^5.83.0",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.462.0",
  "i18next": "^25.5.2",
  "openai": "^6.1.0",
  "recharts": "^2.15.4",
  "sonner": "^1.7.4",
  "zustand": "^5.0.8",
  "serve": "^14.2.5"
}
```

---

## ✅ ESTADO ATUAL DO PROJETO

- ✅ Build funcionando sem erros TypeScript
- ✅ Servidor rodando na porta 5000
- ✅ Site público acessível em globalsupplements.site
- ✅ 40 páginas funcionais
- ✅ Sistema broker REMOVIDO do frontend (código ainda existe no Supabase)
- ✅ Dashboard limpo — apenas Global Supplements
- ✅ Sidebar reorganizado sem itens do broker
- ⚠️ O sistema broker ainda existe nas Edge Functions do Supabase (não afeta o frontend)

---

## 💬 INSTRUÇÕES PARA O CLAUDE

Para modificar este projeto, você precisa:

1. **Editar arquivos em** `projeto-copia/src/`
2. **Após editar**, rodar `npm run build` dentro de `projeto-copia/`
3. **Reiniciar o servidor** para ver as mudanças
4. **Nunca commitar secrets** — eles ficam no `inject-secrets.sh` e são injetados em runtime

### Comandos úteis
```bash
# Checar erros TypeScript
cd projeto-copia && npx tsc --noEmit

# Build de produção
cd projeto-copia && npm run build

# Ver logs do servidor
# (usar refresh_all_logs no Replit)

# Testar se servidor está respondendo
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/
```

### Padrão para adicionar nova página
1. Criar `projeto-copia/src/pages/NovaPagina.tsx`
2. Adicionar import em `src/App.tsx`
3. Adicionar `<Route path="/nova-pagina" element={<NovaPagina />} />`
4. Adicionar item no `AppSidebar.tsx` (se for dashboard) ou no menu público
5. Fazer build e reiniciar

---

*Exportado em: 2025-10-13 | Projeto: Global Supplements — Premium Worldwide Network*
*Supabase Project ID: twglceexfetejawoumsr*
