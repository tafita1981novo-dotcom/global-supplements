# Global Supplements - Premium Worldwide Network

## Overview

Global Supplements is a B2B/B2C platform connecting global supplement suppliers with buyers. It uses AI-powered market intelligence and automated distribution to facilitate international trade, government contracts, and enterprise solutions across various product categories (beauty, quantum materials, medical-grade, smart gadgets, traditional wellness). The platform aims to identify arbitrage opportunities and execute high-margin deals in real-time by integrating numerous APIs for marketplace intelligence, logistics, compliance, and payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React 18, TypeScript, Vite, React Router, Tailwind CSS, and shadcn/ui. It features a responsive, component-based design with mobile-first principles, supports 15+ languages via i18next, and includes dark/light theme modes. It uses `AppLayout` for authenticated experiences and `PublicSiteLayout` for marketing pages.

### Backend

The backend primarily uses Supabase for authentication, PostgreSQL database, and real-time capabilities. Key data tables include `execution_history`, `compliance_checks`, `opportunities`, `suppliers`, `government_contracts`, and `market_trends`. TanStack React Query manages server state.

### Key Architectural Decisions

-   **Multi-API Integration System**: Integrates over 50 external APIs for AI/analysis, marketplaces, e-commerce, Google Workspace, logistics, compliance, and payments, enabling automated arbitrage, compliance, and execution.
-   **Quantum Execution System**: Detects and executes real-time opportunities through price discrepancy monitoring, AI-powered margin/risk assessment, and automated pipelines.
-   **Progressive Registration Strategy**: Automates company registration across government and B2B platforms to secure high-value contracts.
-   **Internationalization Architecture**: Supports 14+ languages with full i18n, ensuring global reach. The brand name "Global Supplements" is not translated.
-   **Amazon OneLink Integration**: Utilizes Amazon OneLink for universal affiliate links, ensuring geo-redirection and tracking across 13 global Amazon marketplaces.
-   **3-Layer Product Aggregation System**: Fetches and aggregates products from global, category, and subcategory layers, deduplicates by ASIN, and sorts by review count.
-   **Instant Cache System**: Uses LocalStorage for ultra-fast product loading (<100ms) with background refreshes for data freshness.
-   **AI Content Automation System (Phase 1)**: Generates SEO-optimized content (articles, landing pages, reviews) using OpenAI GPT-4o-mini across 14 languages and 10 niches, integrating Amazon OneLink and using Supabase Edge Functions for secure API key management.
-   **Google Ads Campaign Management System**: Manages campaigns with pre-optimized global headlines and descriptions. Supports 14 Amazon marketplaces and 10 niches, tracks campaign status and performance metrics (impressions, clicks, CTR, revenue, ROI).
-   **Multi-Channel Marketing Dashboard (Phase 2)**: An integrated marketing automation hub with modules for Analytics, Social Media Automation (Buffer), Email Marketing Automation (SendGrid), and SEO Performance Tracking (Google Search Console). Features include real-time tracking, AI-powered content, audience segmentation, and decoupled credential checking.

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
## ✅ AI Broker System Status (2025-10-12)

### Database (DEPLOYED ✅)
- 8 tables created: opportunities, b2b_buyers, dropship_partners, negotiations, messages, commissions, supplier_matches, country_language_map
- 3 views: conversation_context, contact_history, broker_performance
- 4 SQL functions: get_conversation_context, get_contact_history, detect_buyer_language, get_language_context

### Edge Functions (DEPLOYED ✅)
All functions deployed via `npx supabase@beta` (no Docker required):
- ✅ `autonomous-negotiator` - GPT-4 with conversation history + multi-language (15+ languages)
- ✅ `supplier-matcher` - Intelligent matching with profit optimization
- ✅ `b2b-buyer-detector` - Detects buyers from LinkedIn, Alibaba, IndiaMART, etc.
- ✅ `email-automation` - Automated emails via Gmail/SendGrid
- Dashboard: https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions

### System Capabilities
- 🧠 **Never repeats messages**: Permanent conversation history with context awareness
- 🌍 **Multi-language**: Auto-detects and responds in buyer's native language (15+ languages)
- 💰 **Commission tracking**: Automatic profit calculation and commission management
- 🎯 **Smart matching**: Optimizes supplier selection by profit × reliability × speed
- 📧 **Real company data**: Uses actual company info in all communications

### Next Steps
1. Configure environment variables (OPENAI_API_KEY, GMAIL_API_KEY, etc.)
2. Test functions individually via Dashboard or cURL
3. Set up automation triggers (webhooks, cron jobs)
4. Monitor logs and performance metrics
