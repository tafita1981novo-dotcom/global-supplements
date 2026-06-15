export interface RapidAPIConfig {
  key: string;
  host: string;
  name: string;
}

export interface AmazonProduct {
  asin: string;
  title: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  prime: boolean;
  affiliateLink: string;
  _score?: number;
  _commission?: number;
}

// ── Cache duplo: memória (5min) + localStorage (30min) ──────────────────────
const MEM_CACHE = new Map<string, { data: AmazonProduct[]; ts: number }>();
const MEM_TTL  = 5  * 60 * 1000;
const LOC_TTL  = 30 * 60 * 1000;

function cacheGet(key: string): AmazonProduct[] | null {
  const m = MEM_CACHE.get(key);
  if (m && Date.now() - m.ts < MEM_TTL) return m.data;
  try {
    const raw = localStorage.getItem(`amz_${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > LOC_TTL) { localStorage.removeItem(`amz_${key}`); return null; }
    MEM_CACHE.set(key, { data, ts }); // promove para memória
    return data;
  } catch { return null; }
}

function cacheSet(key: string, data: AmazonProduct[]): void {
  MEM_CACHE.set(key, { data, ts: Date.now() });
  try { localStorage.setItem(`amz_${key}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// ── Mapeamentos ───────────────────────────────────────────────────────────────
const COUNTRY_MAP: Record<string, string> = {
  'UK': 'GB', 'US': 'US', 'CA': 'CA', 'DE': 'DE',
  'FR': 'FR', 'IT': 'IT', 'ES': 'ES', 'JP': 'JP',
  'AU': 'AU', 'NL': 'NL', 'SE': 'SE', 'SG': 'SG',
  'PL': 'PL', 'SA': 'SA', 'GB': 'GB',
};

const SORT_MAP: Record<string, string> = {
  'HIGHEST_RATED': 'REVIEWS',
  'RELEVANCE': 'RELEVANCE',
  'PRICE_LOW': 'PRICE_LOW_TO_HIGH',
  'PRICE_HIGH': 'PRICE_HIGH_TO_LOW',
};

export class MultiAPIClient {
  private apis: RapidAPIConfig[];
  private currentApiIndex = 0;
  private requestCounts: Map<string, number> = new Map();
  private readonly MAX_FREE_REQUESTS = 10000;

  constructor() {
    // Suporta até 3 chaves — adicione RAPIDAPI_KEY_2 e _3 no Replit Secrets se necessário
    const keys = [
      import.meta.env.VITE_RAPIDAPI_KEY_1,
      import.meta.env.VITE_RAPIDAPI_KEY_2,
      import.meta.env.VITE_RAPIDAPI_KEY_3,
    ].filter(Boolean);

    this.apis = keys.map((key, i) => ({
      key,
      host: 'real-time-amazon-data.p.rapidapi.com',
      name: `RapidAPI-${i + 1}`,
    }));
  }

  async searchProducts(
    query: string,
    limit: number = 50,
    countryCode: string = 'US',
    domain: string = 'amazon.com',
    sortBy: string = 'RELEVANCE'
  ): Promise<AmazonProduct[]> {
    // 1. Sem chaves configuradas
    if (this.apis.length === 0) {
      console.error('❌ Nenhuma VITE_RAPIDAPI_KEY_1 configurada nos Secrets do Replit.');
      return [];
    }

    // 2. Cache hit
    const cacheKey = `${countryCode}_${query}_${sortBy}_${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      console.log(`⚡ Cache: ${cached.length} produtos`);
      return cached;
    }

    const apiCountry = COUNTRY_MAP[countryCode] || countryCode;
    const apiSort    = SORT_MAP[sortBy] || sortBy;

    // 3. Tentar cada API com retry
    for (let attempt = 0; attempt < this.apis.length; attempt++) {
      const api  = this.apis[this.currentApiIndex];
      const used = this.requestCounts.get(api.name) || 0;

      if (used >= this.MAX_FREE_REQUESTS) {
        console.warn(`⚠️ ${api.name} atingiu limite, trocando...`);
        this.switchToNextAPI();
        continue;
      }

      try {
        const products = await this.fetchWithRetry(api, query, limit, apiCountry, domain, apiSort);
        this.incrementRequestCount(api.name);
        console.log(`✅ ${products.length} produtos reais da Amazon carregados via ${api.name}!`);
        cacheSet(cacheKey, products);
        return products;
      } catch (error: any) {
        const msg = String(error?.message || error);

        // 403 = assinatura expirada — instrução clara
        if (msg.includes('403') || msg.includes('not subscribed') || msg.includes('Forbidden')) {
          console.error(
            `❌ ${api.name}: Assinatura EXPIRADA (403).\n` +
            `   → Acesse: https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data\n` +
            `   → Assine o plano gratuito (500 req/mês)\n` +
            `   → Cole a nova key em Replit Secrets → RAPIDAPI_KEY`
          );
          this.switchToNextAPI();
          continue;
        }

        // 429 = rate limit — espera e tenta de novo
        if (msg.includes('429')) {
          console.warn(`⏳ ${api.name}: Rate limit (429), aguardando 2s...`);
          await this.sleep(2000);
          continue;
        }

        console.error(`❌ ${api.name} falhou:`, msg);
        this.switchToNextAPI();
      }
    }

    console.error('❌ Todas as APIs falharam.');
    return [];
  }

  // Fetch com retry automático (até 2 tentativas por API)
  private async fetchWithRetry(
    api: RapidAPIConfig,
    query: string,
    limit: number,
    country: string,
    domain: string,
    sortBy: string,
    retries = 2
  ): Promise<AmazonProduct[]> {
    for (let i = 0; i <= retries; i++) {
      try {
        const params = new URLSearchParams({
          query,
          page: '1',
          country,
          sort_by: sortBy,
          product_condition: 'ALL',
        });

        const response = await fetch(`https://${api.host}/search?${params}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key':  api.key,
            'x-rapidapi-host': api.host,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return this.parseAPIResponse(data, api.name, domain).slice(0, limit);
      } catch (err) {
        if (i === retries) throw err;
        await this.sleep(1000 * (i + 1));
      }
    }
    return [];
  }

  private parseAPIResponse(data: any, apiName: string, domain: string = 'amazon.com'): AmazonProduct[] {
    const AFFILIATE_TAG = 'globalsupleme-20';
    const products = data?.data?.products || [];

    if (products.length > 0) {
      console.log(`📦 [${domain}] Estrutura do produto:`, {
        asin:  products[0].asin,
        title: products[0].product_title?.substring(0, 50),
        photo: products[0].product_photo ? 'OK' : 'MISSING',
        url:   products[0].product_url   ? 'OK' : 'MISSING',
        image: products[0].image         ? 'OK' : 'MISSING',
        keys:  Object.keys(products[0]).filter((k: string) =>
          k.includes('photo') || k.includes('image') || k.includes('url')
        ),
      });
    }

    const parsed: AmazonProduct[] = products.map((p: any) => ({
      asin:          p.asin,
      title:         p.product_title || p.title,
      price:         p.product_price || p.price || '$0.00',
      rating:        parseFloat(p.product_star_rating || p.rating) || 4.5,
      reviews:       parseInt(p.product_num_ratings || p.reviews_count || '0') || 0,
      image:         p.product_photo || p.product_url || p.image || '',
      category:      p.product_category || p.category || 'Health & Personal Care',
      prime:         Boolean(p.is_prime || p.prime),
      affiliateLink: `https://www.${domain}/dp/${p.asin}?tag=${AFFILIATE_TAG}`,
    }));

    const problematicos = parsed.filter(p => !p.image || !p.asin);
    if (problematicos.length > 0) {
      console.warn(`⚠️ [${domain}] ${problematicos.length} produtos sem imagem/ASIN!`);
    }

    return parsed;
  }

  private getCategoryKeywords(category: string): string {
    const keywords: Record<string, string> = {
      'all':           'supplements vitamins health wellness',
      'beauty':        'collagen beauty supplements anti-aging skincare vitamins',
      'vitamins':      'vitamins supplements multivitamin health daily',
      'sports':        'sports nutrition protein powder pre-workout creatine',
      'wellness':      'wellness supplements herbal natural vitamins',
      'devices':       'health gadgets fitness tracker blood pressure monitor',
      'quantum':       'advanced supplements nootropics smart drugs cognitive enhancement',
      'mycogenesis':   'mushroom supplements lion mane reishi chaga fungi',
      'medical':       'medical grade supplements pharmaceutical vitamins',
      'gadgets':       'health gadgets fitness tracker smart watch wellness device',
      'b2b':           'bulk supplements wholesale vitamins business',
      'government':    'institutional supplements medical supplies',
      'manufacturing': 'industrial supplements raw materials',
    };
    return keywords[category] || 'health supplements vitamins';
  }

  private getCurrentAPI(): RapidAPIConfig {
    return this.apis[this.currentApiIndex];
  }

  private switchToNextAPI(): void {
    this.currentApiIndex = (this.currentApiIndex + 1) % Math.max(1, this.apis.length);
  }

  private incrementRequestCount(apiName: string): void {
    const current = this.requestCounts.get(apiName) || 0;
    this.requestCounts.set(apiName, current + 1);
    console.log(`📊 ${apiName}: ${current + 1}/${this.MAX_FREE_REQUESTS} requests usadas`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getUsageStats(): { api: string; used: number; remaining: number }[] {
    return this.apis.map(api => ({
      api:       api.name,
      used:      this.requestCounts.get(api.name) || 0,
      remaining: this.MAX_FREE_REQUESTS - (this.requestCounts.get(api.name) || 0),
    }));
  }
}
