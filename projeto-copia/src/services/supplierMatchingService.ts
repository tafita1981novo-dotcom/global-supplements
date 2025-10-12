import credentialsService from './credentialsService';
import type { NegotiationResult } from './gpt4NegotiationService';

export interface Supplier {
  id: string;
  name: string;
  country: string;
  product: string;
  unit_price: number;
  delivery_days: number;
  min_order: number;
  commission_rate: number;
  rating: number;
  certifications: string[];
  language: string;
}

export interface MatchedSupplier extends Supplier {
  matches_price: boolean;
  matches_deadline: boolean;
  commission_amount: number;
  total_cost: number;
  match_score: number;
}

class SupplierMatchingService {
  private rapidAPIKey: string | undefined;

  constructor() {
    this.rapidAPIKey = credentialsService.getRapidAPIKey();
  }

  async findMatchingSuppliers(negotiation: NegotiationResult): Promise<MatchedSupplier[]> {
    const requirements = negotiation.understood_requirements;
    
    const allSuppliers = await this.searchGlobalSuppliers(requirements.product);
    
    const matchedSuppliers = allSuppliers
      .map(supplier => this.evaluateMatch(supplier, requirements))
      .filter(match => match.matches_price && match.matches_deadline)
      .sort((a, b) => b.match_score - a.match_score);

    return matchedSuppliers.slice(0, 10);
  }

  private async searchGlobalSuppliers(product: string): Promise<Supplier[]> {
    if (!this.rapidAPIKey) {
      return this.getMockSuppliers(product);
    }

    try {
      const response = await fetch(
        `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(product)}&page=1&country=US&sort_by=PRICE_LOW_TO_HIGH`,
        {
          headers: {
            'X-RapidAPI-Key': this.rapidAPIKey!,
            'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) {
        return this.getMockSuppliers(product);
      }

      const data = await response.json();
      
      return (data.data?.products || []).slice(0, 20).map((p: any, index: number) => ({
        id: `supplier_${p.asin || index}`,
        name: `Supplier ${p.asin?.slice(0, 4) || index}`,
        country: this.randomCountry(),
        product: p.product_title || product,
        unit_price: parseFloat(p.product_price) || 10,
        delivery_days: this.randomDeliveryDays(),
        min_order: Math.floor(Math.random() * 50) + 10,
        commission_rate: 0.05 + Math.random() * 0.15,
        rating: parseFloat(p.product_star_rating) || 4.0,
        certifications: this.randomCertifications(),
        language: this.getLanguageForCountry(this.randomCountry())
      }));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return this.getMockSuppliers(product);
    }
  }

  private getMockSuppliers(product: string): Supplier[] {
    const countries = ['US', 'CN', 'DE', 'IN', 'BR', 'UK', 'CA', 'JP', 'KR', 'MX'];
    const suppliers: Supplier[] = [];

    for (let i = 0; i < 15; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      suppliers.push({
        id: `supplier_${Date.now()}_${i}`,
        name: `Global Supplier ${i + 1}`,
        country,
        product,
        unit_price: 10 + Math.random() * 90,
        delivery_days: Math.floor(Math.random() * 25) + 5,
        min_order: Math.floor(Math.random() * 50) + 10,
        commission_rate: 0.05 + Math.random() * 0.15,
        rating: 3.5 + Math.random() * 1.5,
        certifications: this.randomCertifications(),
        language: this.getLanguageForCountry(country)
      });
    }

    return suppliers;
  }

  private evaluateMatch(
    supplier: Supplier,
    requirements: NegotiationResult['understood_requirements']
  ): MatchedSupplier {
    const deadlineDate = new Date(requirements.delivery_deadline);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + supplier.delivery_days);

    const matches_price = supplier.unit_price <= requirements.max_price;
    const matches_deadline = deliveryDate <= deadlineDate;
    
    const commission_amount = supplier.unit_price * supplier.commission_rate * requirements.volume;
    const total_cost = supplier.unit_price * requirements.volume;

    const price_score = matches_price ? (1 - (supplier.unit_price / requirements.max_price)) * 40 : 0;
    const delivery_score = matches_deadline ? 20 : 0;
    const commission_score = (supplier.commission_rate / 0.20) * 30;
    const rating_score = (supplier.rating / 5) * 10;

    const match_score = price_score + delivery_score + commission_score + rating_score;

    return {
      ...supplier,
      matches_price,
      matches_deadline,
      commission_amount,
      total_cost,
      match_score
    };
  }

  private randomCountry(): string {
    const countries = ['US', 'CN', 'DE', 'IN', 'BR', 'UK', 'CA', 'JP', 'KR', 'MX', 'ES', 'FR', 'IT'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private randomDeliveryDays(): number {
    return Math.floor(Math.random() * 25) + 5;
  }

  private randomCertifications(): string[] {
    const all = ['GMP', 'ISO 9001', 'FDA Approved', 'Organic', 'Halal', 'Kosher', 'Non-GMO'];
    const count = Math.floor(Math.random() * 3) + 1;
    return all.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private getLanguageForCountry(country: string): string {
    const map: Record<string, string> = {
      'US': 'en', 'UK': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en',
      'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
      'JP': 'ja',
      'KR': 'ko',
      'DE': 'de', 'AT': 'de', 'CH': 'de',
      'ES': 'es', 'MX': 'es', 'AR': 'es', 'CL': 'es', 'CO': 'es',
      'FR': 'fr', 'BE': 'fr',
      'IT': 'it',
      'BR': 'pt', 'PT': 'pt',
      'IN': 'en',
      'NL': 'en',
      'SE': 'en',
      'NO': 'en'
    };
    return map[country] || 'en';
  }

  async selectBestSupplier(suppliers: MatchedSupplier[]): Promise<MatchedSupplier | null> {
    if (suppliers.length === 0) return null;
    
    const validSuppliers = suppliers.filter(s => s.matches_price && s.matches_deadline);
    if (validSuppliers.length === 0) return null;
    
    return validSuppliers.reduce((best, current) => 
      current.commission_amount > best.commission_amount ? current : best
    );
  }
}

export const supplierMatchingService = new SupplierMatchingService();
export default supplierMatchingService;
