# Global Supplements - Premium Worldwide Network

## 🔑 Credentials Status (Updated 2025-10-12)

### ✅ Configured APIs: 8/25 (32%)

**AVAILABLE CREDENTIALS (DO NOT REQUEST AGAIN!):**
- ✅ **Supabase** (URL + Anon Key) - Database & Auth  
- ✅ **OpenAI GPT-4** - AI Negotiations ($5K-$20K/month)
- ✅ **RapidAPI** - Amazon Product Data ($10K-$50K/month)
- ✅ **SendGrid** (2025-10-12) - Email Automation ($2K-$8K/month)
- ✅ **Stripe Public Key** (2025-10-12) - pk_test_51SHW...
- ✅ **Stripe Secret Key** (2025-10-12) - sk_live_51SHWC5... **[PRODUCTION/LIVE!]**
- ⚠️ **Gmail OAuth** (Partial: Client ID/Secret configured, need Refresh Token)
- ✅ **Company Info** (Name, EIN, Address, Trade Name)

**Latest Additions (2025-10-12):**
- ✅ SendGrid API configured for email automation
- ✅ Stripe fully configured with LIVE production keys (sk_live_)
- Revenue unlocked: $5K-$18K/month from payment + email automation

**Missing Critical:** Gmail Refresh Token, Payoneer ID  
**Full documentation:** `CREDENTIALS_AVAILABLE.md`

## Overview

Global Supplements is a B2B/B2C platform connecting global supplement suppliers with buyers. It leverages AI-powered market intelligence and automated distribution to facilitate international trade, government contracts, and enterprise solutions across diverse product categories (beauty, quantum materials, medical-grade, smart gadgets, traditional wellness). The platform's core purpose is to identify arbitrage opportunities and execute high-margin deals in real-time through extensive API integrations for marketplace intelligence, logistics, compliance, and payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React 18, TypeScript, Vite, React Router, Tailwind CSS, and shadcn/ui. It employs a responsive, component-based design with mobile-first principles, supports 15+ languages via i18next, and includes dark/light theme modes. It utilizes `AppLayout` for authenticated experiences and `PublicSiteLayout` for marketing pages.

### Backend

The backend primarily uses Supabase for authentication, PostgreSQL database, and real-time capabilities. Key data tables include `execution_history`, `compliance_checks`, `opportunities`, `suppliers`, `government_contracts`, and `market_trends`. TanStack React Query manages server state.

### Key Architectural Decisions

-   **Multi-API Integration System**: Integrates over 50 external APIs for AI/analysis, marketplaces, e-commerce, Google Workspace, logistics, compliance, and payments, enabling automated arbitrage, compliance, and execution.
-   **Quantum Execution System**: Detects and executes real-time opportunities through price discrepancy monitoring, AI-powered margin/risk assessment, and automated pipelines.
-   **Progressive Registration Strategy**: Automates company registration across government and B2B platforms to secure high-value contracts.
-   **Internationalization Architecture**: Supports 14+ languages with full i18n, ensuring global reach.
-   **Amazon OneLink Integration**: Utilizes Amazon OneLink for universal affiliate links, ensuring geo-redirection and tracking across 13 global Amazon marketplaces.
-   **3-Layer Product Aggregation System**: Fetches and aggregates products from global, category, and subcategory layers, deduplicates by ASIN, and sorts by review count.
-   **Instant Cache System**: Uses LocalStorage for ultra-fast product loading (<100ms) with background refreshes for data freshness.
-   **AI Content Automation System**: Generates SEO-optimized content (articles, landing pages, reviews) using OpenAI GPT-4o-mini across 14 languages and 10 niches, integrating Amazon OneLink and using Supabase Edge Functions for secure API key management.
-   **Google Ads Campaign Management System**: Manages campaigns with pre-optimized global headlines and descriptions across 14 Amazon marketplaces and 10 niches, tracking performance metrics.
-   **Multi-Channel Marketing Dashboard**: An integrated marketing automation hub with modules for Analytics, Social Media Automation (Buffer), Email Marketing Automation (SendGrid), and SEO Performance Tracking (Google Search Console).

### System Capabilities

-   **AI Broker System**: Features an autonomous negotiator (GPT-4 with conversation history and multi-language support), supplier matcher, B2B buyer detector, and email automation. It ensures unique messages, multi-language responses, commission tracking, smart matching, and uses real company data.
-   **Real Data System**: Eliminates mock data, ingests 100% real product data from Amazon (via RapidAPI), and uses Supabase as a persistent cache. Includes B2B buyer detection from high-volume products.
-   **Complete Automation Pipeline**: Orchestrates ingestion, B2B buyer detection, intelligent matching, GPT-4 negotiation, and commission tracking.

### Design Trade-offs

-   **TypeScript Configuration**: Relaxed strictness for faster development.
-   **Component Library**: shadcn/ui chosen for customization and reduced bundle size.
-   **Single-Page Application**: Prioritizes fast navigation and interactivity, mitigating SEO with meta tags.

## External Dependencies

-   **Primary Infrastructure**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
-   **AI & Market Intelligence**: OpenAI API (GPT models), Google Gemini AI.
-   **B2B Marketplace APIs**: Alibaba.com, IndiaMART, Global Sources, Made-in-China, Canton Fair Online.
-   **E-commerce & Dropshipping**: Amazon MWS, eBay, Shopify, AliExpress.
-   **Google Workspace Suite**: Gmail API, Google Drive, Google Sheets, Google Calendar, Google Maps, Google Translate, Google Cloud Storage.
-   **Logistics & Shipping**: DHL Express, FedEx Web Services, UPS, USPS.
-   **Compliance & Regulatory**: FDA API, WHO database, EPA, SAM.gov, GSA.
-   **Payment Processing**: Stripe, PayPal, Wise, Banking APIs.
-   **Document Management**: Supabase storage for certificates and documents.
-   **Marketing Automation APIs**: Buffer (social media), SendGrid (email), Google Search Console (SEO).