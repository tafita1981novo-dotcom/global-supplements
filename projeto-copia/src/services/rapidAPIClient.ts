import { getCuratedProducts, type CuratedProduct } from "@/data/curatedProducts";

export interface RapidAPIConfig {
  key: string;
  host: string;
  name: string;
}

export class MultiAPIClient {
  private apis: RapidAPIConfig[];
  private currentApiIndex = 0;
  private requestCounts: Map<string, number> = new Map();
  private readonly MAX_FREE_REQUESTS = 10000;

  constructor() {
    this.apis = [
      {
        key: import.meta.env.VITE_RAPIDAPI_KEY_1 || '',
        host: 'real-time-amazon-data.p.rapidapi.com',
        name: 'Real-Time Amazon Data'
      }
    ].filter(api => api.key);
  }

  async searchProducts(
    query: string,
    limit: number = 50,
    countryCode: string = 'US',
    domain: string = 'amazon.com',
    sortBy: string = 'RELEVANCE'
  ): Promise<any[]> {
    // Try the real API first
    if (this.apis.length > 0) {
      let attempts = 0;
      while (attempts < this.apis.length) {
        const api = this.getCurrentAPI();
        const used = this.requestCounts.get(api.name) || 0;

        if (used >= this.MAX_FREE_REQUESTS) {
          this.switchToNextAPI();
          attempts++;
          continue;
        }

        try {
          const products = await this.fetchFromAPI(api, query, limit, countryCode, domain, sortBy);
          if (products.length > 0) {
            this.incrementRequestCount(api.name);
            console.log(`✅ ${products.length} produtos reais da Amazon via ${api.name}`);
            return products;
          }
          // API returned 0 products — fall through to curated
          console.warn(`⚠️ API retornou 0 produtos, usando curados`);
          break;
        } catch (error: any) {
          console.warn(`⚠️ ${api.name} falhou (${error.message}), usando produtos curados`);
          break;
        }
      }
    }

    // ── FALLBACK: Always return curated products ────────────────────────────
    console.log(`📦 Usando produtos curados para query="${query}"`);
    const category = this.queryToCategory(query);
    const curated = getCuratedProducts(category, null, null);
    // Shuffle for variety and cap at limit
    const shuffled = [...curated].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(limit, shuffled.length));
  }

  /** Map a query string to a curated category key */
  private queryToCategory(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('mushroom') || q.includes('reishi') || q.includes('lion') || q.includes('cordyceps') || q.includes('chaga')) return 'mycogenesis';
    if (q.includes('nootropic') || q.includes('nad') || q.includes('quantum') || q.includes('resveratrol') || q.includes('berberine')) return 'quantum';
    if (q.includes('protein') || q.includes('creatine') || q.includes('bcaa') || q.includes('pre-workout') || q.includes('whey') || q.includes('sport')) return 'sports';
    if (q.includes('tracker') || q.includes('monitor') || q.includes('blood pressure') || q.includes('thermometer') || q.includes('device') || q.includes('oximeter')) return 'devices';
    if (q.includes('vitamin') || q.includes('supplement') || q.includes('mineral') || q.includes('probiotic') || q.includes('omega') || q.includes('collagen capsule') || q.includes('biotin capsule')) return 'vitamins';
    if (q.includes('shampoo') || q.includes('conditioner') || q.includes('skincare') || q.includes('serum') || q.includes('moisturizer') || q.includes('makeup') || q.includes('beauty') || q.includes('hair') || q.includes('skin')) return 'beauty';
    if (q.includes('immune') || q.includes('pain') || q.includes('digestive') || q.includes('cold') || q.includes('flu') || q.includes('bandage') || q.includes('wellness')) return 'wellness';
    return 'all';
  }

  private async fetchFromAPI(
    api: RapidAPIConfig,
    query: string,
    limit: number,
    countryCode: string = 'US',
    domain: string = 'amazon.com',
    sortBy: string = 'RELEVANCE'
  ): Promise<any[]> {
    const url = `https://${api.host}/search`;

    const countryCodeMapping: Record<string, string> = {
      'UK': 'GB', 'US': 'US', 'CA': 'CA', 'DE': 'DE', 'FR': 'FR',
      'IT': 'IT', 'ES': 'ES', 'JP': 'JP', 'AU': 'AU', 'NL': 'NL',
      'SE': 'SE', 'SG': 'SG', 'PL': 'PL', 'SA': 'SA'
    };
    const apiCountryCode = countryCodeMapping[countryCode] || countryCode;

    const sortMapping: Record<string, string> = {
      'HIGHEST_RATED': 'REVIEWS',
      'RELEVANCE': 'RELEVANCE'
    };
    const apiSortValue = sortMapping[sortBy] || sortBy;

    const params = new URLSearchParams({
      query,
      page: '1',
      country: apiCountryCode,
      sort_by: apiSortValue,
      product_condition: 'ALL'
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': api.key,
        'x-rapidapi-host': api.host
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseAPIResponse(data, api.name, domain).slice(0, limit);
  }

  private parseAPIResponse(data: any, apiName: string, domain: string = 'amazon.com'): any[] {
    const AFFILIATE_TAG = 'globalsupleme-20';
    const products = data.data?.products || [];

    return products.map((p: any) => ({
      asin: p.asin,
      title: p.product_title || p.title,
      price: p.product_price || p.price || '$0.00',
      rating: p.product_star_rating || p.rating || 4.5,
      reviews: p.product_num_ratings || p.reviews_count || 0,
      image: p.product_photo || p.product_url || p.image || '',
      category: p.product_category || p.category || 'Health & Personal Care',
      prime: p.is_prime || p.prime || false,
      affiliateLink: `https://www.${domain}/dp/${p.asin}?tag=${AFFILIATE_TAG}`
    }));
  }

  private getCurrentAPI(): RapidAPIConfig {
    return this.apis[this.currentApiIndex];
  }

  private switchToNextAPI(): void {
    this.currentApiIndex = (this.currentApiIndex + 1) % this.apis.length;
  }

  private incrementRequestCount(apiName: string): void {
    const current = this.requestCounts.get(apiName) || 0;
    this.requestCounts.set(apiName, current + 1);
  }

  getUsageStats(): { api: string; used: number; remaining: number }[] {
    return this.apis.map(api => ({
      api: api.name,
      used: this.requestCounts.get(api.name) || 0,
      remaining: this.MAX_FREE_REQUESTS - (this.requestCounts.get(api.name) || 0)
    }));
  }
}
