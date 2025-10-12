/**
 * CENTRALIZED CREDENTIALS SERVICE
 * All APIs, tokens, and credentials in ONE place
 * Used by ALL pages and functions - NO duplicates!
 */

export interface APICredential {
  name: string;
  key: string | undefined;
  configured: boolean;
  category: 'infrastructure' | 'ai' | 'commerce' | 'marketing' | 'payment' | 'logistics';
  priority: 'critical' | 'high' | 'medium' | 'low';
  setupUrl?: string;
  description?: string;
}

export interface CompanyInfo {
  name: string;
  ein: string;
  address: string;
  tradeName: string;
}

class CredentialsService {
  // ============ INFRASTRUCTURE ============
  getSupabaseUrl(): string | undefined {
    return import.meta.env.VITE_SUPABASE_URL;
  }

  getSupabaseAnonKey(): string | undefined {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  // ============ AI SERVICES ============
  getOpenAIKey(): string | undefined {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }

  getGeminiKey(): string | undefined {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  // ============ COMMERCE & DATA ============
  getRapidAPIKey(): string | undefined {
    return import.meta.env.VITE_RAPIDAPI_KEY_1;
  }

  getAliExpressAppKey(): string | undefined {
    return import.meta.env.VITE_ALIEXPRESS_APP_KEY;
  }

  getAliExpressAppSecret(): string | undefined {
    return import.meta.env.VITE_ALIEXPRESS_APP_SECRET;
  }

  getAlibabaDropshippingKey(): string | undefined {
    return import.meta.env.VITE_ALIBABA_DROPSHIP_KEY;
  }

  getAlibabaDropshippingSecret(): string | undefined {
    return import.meta.env.VITE_ALIBABA_DROPSHIP_SECRET;
  }

  // ============ AFFILIATE PROGRAMS ============
  getIHerbAffiliateID(): string | undefined {
    return import.meta.env.VITE_IHERB_AFFILIATE_ID;
  }

  getVitacostAffiliateID(): string | undefined {
    return import.meta.env.VITE_VITACOST_AFFILIATE_ID;
  }

  // ============ MARKETING & COMMUNICATION ============
  // NOTE: Gmail OAuth credentials are stored SERVER-SIDE in Supabase Edge Function
  // These getters are deprecated and return undefined to prevent client-side exposure
  getGmailAPIKey(): string | undefined {
    return undefined; // Server-side only
  }

  getGmailClientID(): string | undefined {
    return undefined; // Server-side only in Supabase secrets
  }

  getGmailClientSecret(): string | undefined {
    return undefined; // Server-side only in Supabase secrets
  }

  getGmailRefreshToken(): string | undefined {
    return undefined; // Server-side only in Supabase secrets
  }

  getSendGridAPIKey(): string | undefined {
    return import.meta.env.VITE_SENDGRID_API_KEY;
  }

  getBufferAccessToken(): string | undefined {
    return import.meta.env.VITE_BUFFER_ACCESS_TOKEN;
  }

  getGoogleSearchConsoleCredentials(): string | undefined {
    return import.meta.env.VITE_GSC_CREDENTIALS;
  }

  // ============ SOCIAL MEDIA & SCRAPING ============
  getLinkedInEmail(): string | undefined {
    return import.meta.env.VITE_LINKEDIN_EMAIL;
  }

  getLinkedInPassword(): string | undefined {
    return import.meta.env.VITE_LINKEDIN_PASSWORD;
  }

  getYouTubeDataAPIKey(): string | undefined {
    return import.meta.env.VITE_YOUTUBE_DATA_API_KEY;
  }

  getYouTubeChannelID(): string | undefined {
    return import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  }

  // ============ PAYMENT & FINANCIAL ============
  getStripePublicKey(): string | undefined {
    return import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  }

  // Note: Stripe Secret Key is server-side only (not in VITE_ vars)
  getStripeSecretKey(): string | undefined {
    return undefined; // Server-side only for security
  }

  getPayoneerID(): string | undefined {
    return import.meta.env.VITE_PAYONEER_ID;
  }

  getExchangeRateAPIKey(): string | undefined {
    return import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
  }

  // ============ LOGISTICS ============
  getDHLAPIKey(): string | undefined {
    return import.meta.env.VITE_DHL_API_KEY;
  }

  getFedExAPIKey(): string | undefined {
    return import.meta.env.VITE_FEDEX_API_KEY;
  }

  getUPSAPIKey(): string | undefined {
    return import.meta.env.VITE_UPS_API_KEY;
  }

  // ============ AUTOMATION ============
  getZapierWebhook(): string | undefined {
    return import.meta.env.VITE_ZAPIER_WEBHOOK;
  }

  // ============ COMPANY INFORMATION ============
  getCompanyInfo(): CompanyInfo {
    return {
      name: import.meta.env.VITE_COMPANY_NAME || '',
      ein: import.meta.env.VITE_COMPANY_EIN || '',
      address: import.meta.env.VITE_COMPANY_ADDRESS || '',
      tradeName: import.meta.env.VITE_TRADE_NAME || ''
    };
  }

  hasCompanyInfo(): boolean {
    return !!(
      import.meta.env.VITE_COMPANY_NAME &&
      import.meta.env.VITE_COMPANY_EIN &&
      import.meta.env.VITE_COMPANY_ADDRESS &&
      import.meta.env.VITE_TRADE_NAME
    );
  }

  // ============ VALIDATION & STATUS ============
  getAllCredentials(): APICredential[] {
    return [
      // INFRASTRUCTURE
      {
        name: 'Supabase URL',
        key: this.getSupabaseUrl(),
        configured: !!this.getSupabaseUrl(),
        category: 'infrastructure',
        priority: 'critical',
        description: 'Database URL'
      },
      {
        name: 'Supabase Anon Key',
        key: this.getSupabaseAnonKey(),
        configured: !!this.getSupabaseAnonKey(),
        category: 'infrastructure',
        priority: 'critical',
        description: 'Database Auth Key'
      },

      // AI SERVICES
      {
        name: 'OpenAI GPT-4',
        key: this.getOpenAIKey(),
        configured: !!this.getOpenAIKey(),
        category: 'ai',
        priority: 'critical',
        setupUrl: 'https://platform.openai.com/api-keys',
        description: 'AI Negotiations & Content Generation'
      },
      {
        name: 'Google Gemini',
        key: this.getGeminiKey(),
        configured: !!this.getGeminiKey(),
        category: 'ai',
        priority: 'medium',
        setupUrl: 'https://aistudio.google.com/app/apikey',
        description: 'Additional AI Analysis'
      },

      // COMMERCE
      {
        name: 'RapidAPI (Amazon)',
        key: this.getRapidAPIKey(),
        configured: !!this.getRapidAPIKey(),
        category: 'commerce',
        priority: 'critical',
        setupUrl: 'https://rapidapi.com/hub',
        description: 'Real Amazon Product Data'
      },
      {
        name: 'AliExpress Dropshipping',
        key: this.getAliExpressAppKey(),
        configured: !!this.getAliExpressAppKey() && !!this.getAliExpressAppSecret(),
        category: 'commerce',
        priority: 'high',
        setupUrl: 'https://developers.aliexpress.com/',
        description: 'AliExpress Product Access'
      },
      {
        name: 'Alibaba Dropship Key',
        key: this.getAlibabaDropshippingKey(),
        configured: !!this.getAlibabaDropshippingKey(),
        category: 'commerce',
        priority: 'high',
        setupUrl: 'https://www.alibaba.com/dropshipping',
        description: 'Alibaba Dropship API Key'
      },
      {
        name: 'Alibaba Dropship Secret',
        key: this.getAlibabaDropshippingSecret(),
        configured: !!this.getAlibabaDropshippingSecret(),
        category: 'commerce',
        priority: 'high',
        setupUrl: 'https://www.alibaba.com/dropshipping',
        description: 'Alibaba Dropship API Secret'
      },

      // MARKETING
      {
        name: 'Gmail OAuth (Server-Side)',
        key: undefined, // Server-side only - never exposed to client
        configured: false, // Configure in Supabase Edge Function secrets
        category: 'marketing',
        priority: 'critical',
        setupUrl: 'https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions',
        description: 'Gmail OAuth - Configured server-side in Supabase'
      },
      {
        name: 'SendGrid',
        key: this.getSendGridAPIKey(),
        configured: !!this.getSendGridAPIKey(),
        category: 'marketing',
        priority: 'medium',
        setupUrl: 'https://app.sendgrid.com/settings/api_keys',
        description: 'Email Marketing'
      },
      {
        name: 'Buffer',
        key: this.getBufferAccessToken(),
        configured: !!this.getBufferAccessToken(),
        category: 'marketing',
        priority: 'medium',
        setupUrl: 'https://buffer.com/developers',
        description: 'Social Media Automation'
      },
      {
        name: 'Google Search Console',
        key: this.getGoogleSearchConsoleCredentials(),
        configured: !!this.getGoogleSearchConsoleCredentials(),
        category: 'marketing',
        priority: 'medium',
        setupUrl: 'https://search.google.com/search-console',
        description: 'SEO Performance'
      },
      {
        name: 'LinkedIn Scraper',
        key: this.getLinkedInEmail(),
        configured: !!this.getLinkedInEmail() && !!this.getLinkedInPassword(),
        category: 'marketing',
        priority: 'high',
        setupUrl: 'https://www.linkedin.com',
        description: 'B2B Buyer Detection'
      },

      // PAYMENT
      {
        name: 'Stripe Public Key',
        key: this.getStripePublicKey(),
        configured: !!this.getStripePublicKey(),
        category: 'payment',
        priority: 'high',
        setupUrl: 'https://dashboard.stripe.com/apikeys',
        description: 'Stripe Frontend Key (pk_)'
      },
      {
        name: 'Stripe Secret Key',
        key: undefined, // Server-side only
        configured: true, // Configured server-side
        category: 'payment',
        priority: 'high',
        setupUrl: 'https://dashboard.stripe.com/apikeys',
        description: 'Stripe Backend Key (sk_) - Server-side'
      },
      {
        name: 'Payoneer',
        key: this.getPayoneerID(),
        configured: !!this.getPayoneerID(),
        category: 'payment',
        priority: 'critical',
        setupUrl: 'https://www.payoneer.com',
        description: 'International Payments'
      },

      // LOGISTICS
      {
        name: 'DHL API',
        key: this.getDHLAPIKey(),
        configured: !!this.getDHLAPIKey(),
        category: 'logistics',
        priority: 'low',
        description: 'Shipping & Tracking'
      },
      {
        name: 'FedEx API',
        key: this.getFedExAPIKey(),
        configured: !!this.getFedExAPIKey(),
        category: 'logistics',
        priority: 'low',
        description: 'Shipping & Tracking'
      },
      {
        name: 'UPS API',
        key: this.getUPSAPIKey(),
        configured: !!this.getUPSAPIKey(),
        category: 'logistics',
        priority: 'low',
        description: 'Shipping & Tracking'
      },

      // ADDITIONAL
      {
        name: 'Exchange Rate API',
        key: this.getExchangeRateAPIKey(),
        configured: !!this.getExchangeRateAPIKey(),
        category: 'infrastructure',
        priority: 'low',
        description: 'Currency Conversion'
      },
      {
        name: 'iHerb Affiliate',
        key: this.getIHerbAffiliateID(),
        configured: !!this.getIHerbAffiliateID(),
        category: 'commerce',
        priority: 'low',
        description: 'Affiliate Commissions'
      },
      {
        name: 'Vitacost Affiliate',
        key: this.getVitacostAffiliateID(),
        configured: !!this.getVitacostAffiliateID(),
        category: 'commerce',
        priority: 'low',
        description: 'Affiliate Commissions'
      },
      {
        name: 'YouTube APIs',
        key: this.getYouTubeDataAPIKey(),
        configured: !!this.getYouTubeDataAPIKey() && !!this.getYouTubeChannelID(),
        category: 'marketing',
        priority: 'low',
        description: 'Video Analytics'
      },
      {
        name: 'Zapier Webhook',
        key: this.getZapierWebhook(),
        configured: !!this.getZapierWebhook(),
        category: 'infrastructure',
        priority: 'low',
        description: 'Automation Workflows'
      },
      {
        name: 'Company Information',
        key: this.hasCompanyInfo() ? 'configured' : undefined,
        configured: this.hasCompanyInfo(),
        category: 'infrastructure',
        priority: 'critical',
        description: 'Business Details (Name, EIN, Address)'
      }
    ];
  }

  getConfiguredCount(): number {
    return this.getAllCredentials().filter(c => c.configured).length;
  }

  getTotalCount(): number {
    return this.getAllCredentials().length;
  }

  getMissingCritical(): APICredential[] {
    return this.getAllCredentials().filter(c => c.priority === 'critical' && !c.configured);
  }

  // ============ QUICK ACCESS ============
  isFullyConfigured(): boolean {
    const critical = this.getAllCredentials().filter(c => c.priority === 'critical');
    return critical.every(c => c.configured);
  }

  getConfigurationStatus(): {
    total: number;
    configured: number;
    missing: number;
    percentage: number;
    missingCritical: string[];
  } {
    const all = this.getAllCredentials();
    const configured = all.filter(c => c.configured);
    const missingCritical = this.getMissingCritical();

    return {
      total: all.length,
      configured: configured.length,
      missing: all.length - configured.length,
      percentage: Math.round((configured.length / all.length) * 100),
      missingCritical: missingCritical.map(c => c.name)
    };
  }
}

// Export singleton instance
export const credentialsService = new CredentialsService();

// Export for use in any component
export default credentialsService;
