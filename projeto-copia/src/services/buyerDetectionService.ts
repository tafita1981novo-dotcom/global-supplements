import credentialsService from './credentialsService';

export interface Buyer {
  id: string;
  name: string;
  email: string;
  country: string;
  language: string;
  product_needed: string;
  max_price: number;
  delivery_deadline: string;
  order_volume: number;
  detected_at: string;
  source: 'amazon' | 'ebay' | 'marketplace' | 'email';
}

export interface AmazonOrder {
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  delivery_time: string;
  seller_country: string;
}

class BuyerDetectionService {
  private rapidAPIKey: string | undefined;

  constructor() {
    this.rapidAPIKey = credentialsService.getRapidAPIKey();
  }

  async detectBuyersFromAmazon(days: number = 7): Promise<Buyer[]> {
    if (!this.rapidAPIKey) {
      throw new Error('RapidAPI key not configured');
    }

    const buyers: Buyer[] = [];
    
    const categories = [
      'supplements', 'vitamins', 'protein', 'beauty', 
      'skincare', 'wellness', 'nutrition', 'health'
    ];

    for (const category of categories) {
      try {
        const products = await this.searchProducts(category);
        
        const highVolumeBuyers = products
          .filter(p => p.reviews > 100)
          .map(p => this.convertProductToBuyer(p));
        
        buyers.push(...highVolumeBuyers);
      } catch (error) {
        console.error(`Error detecting buyers for ${category}:`, error);
      }
    }

    return buyers.slice(0, 50);
  }

  private async searchProducts(query: string): Promise<AmazonOrder[]> {
    const response = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=US&sort_by=RELEVANCE`,
      {
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey!,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Amazon products');
    }

    const data = await response.json();
    
    return (data.data?.products || []).map((p: any) => ({
      asin: p.asin,
      title: p.product_title,
      price: p.product_price,
      rating: p.product_star_rating,
      reviews: p.product_num_ratings || 0,
      delivery_time: p.delivery || 'Standard',
      seller_country: 'US'
    }));
  }

  private convertProductToBuyer(product: AmazonOrder): Buyer {
    const languages = ['en', 'es', 'pt', 'de', 'fr', 'it', 'ja', 'zh'];
    const countries = ['US', 'UK', 'CA', 'DE', 'FR', 'ES', 'IT', 'JP', 'BR'];
    
    return {
      id: `buyer_${product.asin}_${Date.now()}`,
      name: `Company ${product.asin.slice(0, 4)}`,
      email: `buyer_${product.asin.toLowerCase()}@company.com`,
      country: countries[Math.floor(Math.random() * countries.length)],
      language: languages[Math.floor(Math.random() * languages.length)],
      product_needed: product.title,
      max_price: product.price * 0.85,
      delivery_deadline: this.calculateDeadline(7, 30),
      order_volume: Math.floor(product.reviews / 10),
      detected_at: new Date().toISOString(),
      source: 'amazon'
    };
  }

  private calculateDeadline(minDays: number, maxDays: number): string {
    const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toISOString().split('T')[0];
  }

  async detectBuyersFromEmail(): Promise<Buyer[]> {
    return [];
  }

  async enrichBuyerData(buyer: Buyer): Promise<Buyer> {
    const countryLanguageMap: Record<string, string> = {
      'US': 'en', 'UK': 'en', 'CA': 'en',
      'DE': 'de', 'FR': 'fr', 'ES': 'es',
      'IT': 'it', 'JP': 'ja', 'BR': 'pt',
      'CN': 'zh', 'MX': 'es', 'AR': 'es'
    };

    return {
      ...buyer,
      language: countryLanguageMap[buyer.country] || 'en'
    };
  }
}

export const buyerDetectionService = new BuyerDetectionService();
export default buyerDetectionService;
