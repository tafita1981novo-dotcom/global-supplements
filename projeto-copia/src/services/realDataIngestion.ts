import { supabase } from '@/integrations/supabase/client';
import { MultiAPIClient } from './rapidAPIClient';

export class RealDataIngestionService {
  private apiClient: MultiAPIClient;

  constructor() {
    this.apiClient = new MultiAPIClient();
  }

  /**
   * Ingere produtos REAIS da Amazon e salva no Supabase
   */
  async ingestAmazonProducts(query: string, country: string = 'US', limit: number = 50): Promise<{
    success: boolean;
    products_fetched: number;
    products_saved: number;
    error?: string;
  }> {
    try {
      console.log(`🔄 Ingesting real Amazon products: ${query} (${country})`);

      // Busca produtos REAIS via RapidAPI
      const products = await this.apiClient.searchProducts(query, limit, country);

      if (products.length === 0) {
        return {
          success: false,
          products_fetched: 0,
          products_saved: 0,
          error: 'No products found from Amazon API'
        };
      }

      console.log(`✅ Fetched ${products.length} real Amazon products`);

      // Salva no Supabase (tabela opportunities)
      const productsToSave = products.map(p => ({
        product_name: p.title,
        supplier_name: 'Amazon',
        category: p.category,
        price_per_unit: parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0,
        minimum_order_quantity: 1,
        delivery_days: 2, // Amazon Prime
        commission_percentage: 5.0, // Amazon affiliate
        reliability_score: p.rating || 4.5,
        certifications: ['Amazon Verified'],
        payment_terms: 'Credit Card',
        source: 'amazon_rapidapi',
        metadata: {
          asin: p.asin,
          reviews: p.reviews,
          prime: p.prime,
          affiliate_link: p.affiliateLink,
          image: p.image,
          marketplace: country
        },
        status: 'active'
      }));

      const { data, error } = await supabase
        .from('opportunities')
        .upsert(productsToSave, { onConflict: 'product_name,supplier_name' });

      if (error) {
        console.error('Supabase save error:', error);
        return {
          success: false,
          products_fetched: products.length,
          products_saved: 0,
          error: error.message
        };
      }

      console.log(`💾 Saved ${productsToSave.length} products to Supabase`);

      return {
        success: true,
        products_fetched: products.length,
        products_saved: productsToSave.length
      };

    } catch (error: any) {
      console.error('Ingestion error:', error);
      return {
        success: false,
        products_fetched: 0,
        products_saved: 0,
        error: error.message
      };
    }
  }

  /**
   * Detecta B2B Buyers baseado em oportunidades reais
   */
  async detectB2BBuyers(): Promise<{
    success: boolean;
    buyers_detected: number;
  }> {
    try {
      // Busca oportunidades com alto volume de reviews (indicador de demanda B2B)
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('*')
        .gt('reliability_score', 4.0)
        .lt('price_per_unit', 50)
        .order('metadata->reviews', { ascending: false })
        .limit(100);

      if (error || !opportunities || opportunities.length === 0) {
        return { success: false, buyers_detected: 0 };
      }

      const potentialBuyers: any[] = [];

      for (const opp of opportunities) {
        const reviews = opp.metadata?.reviews || 0;
        
        // Heurística: >1000 reviews = alta demanda = oportunidade B2B
        if (reviews > 1000) {
          potentialBuyers.push({
            company_name: `Potential Buyer - ${opp.product_name.substring(0, 30)}`,
            country: opp.metadata?.marketplace || 'US',
            product_interest: opp.product_name,
            estimated_monthly_volume: Math.floor(reviews / 10),
            target_price_per_unit: opp.price_per_unit * 0.7, // 30% desconto B2B
            potential_commission: opp.price_per_unit * 0.3,
            source: 'market_analysis',
            contact_status: 'prospect'
          });
        }
      }

      if (potentialBuyers.length > 0) {
        await supabase.from('b2b_buyers').upsert(potentialBuyers, { 
          onConflict: 'company_name' 
        });
      }

      console.log(`🎯 Detected ${potentialBuyers.length} potential B2B buyers`);

      return {
        success: true,
        buyers_detected: potentialBuyers.length
      };

    } catch (error: any) {
      console.error('Buyer detection error:', error);
      return { success: false, buyers_detected: 0 };
    }
  }

  /**
   * Pipeline completo de ingestão de dados reais
   */
  async runFullIngestionPipeline(categories: string[] = ['supplements', 'vitamins', 'protein']): Promise<{
    total_products: number;
    total_buyers: number;
    success: boolean;
  }> {
    let totalProducts = 0;
    let totalBuyers = 0;

    for (const category of categories) {
      const result = await this.ingestAmazonProducts(category, 'US', 30);
      if (result.success) {
        totalProducts += result.products_saved;
      }
      
      // Aguarda 1 segundo entre requests para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Detecta B2B buyers baseado nos produtos ingeridos
    const buyersResult = await this.detectB2BBuyers();
    totalBuyers = buyersResult.buyers_detected;

    return {
      total_products: totalProducts,
      total_buyers: totalBuyers,
      success: totalProducts > 0 || totalBuyers > 0
    };
  }

  /**
   * Obtém estatísticas de dados reais
   */
  async getRealDataStats(): Promise<{
    total_opportunities: number;
    total_buyers: number;
    total_suppliers: number;
    last_ingestion?: string;
  }> {
    const [opps, buyers, suppliers] = await Promise.all([
      supabase.from('opportunities').select('id', { count: 'exact', head: true }),
      supabase.from('b2b_buyers').select('id', { count: 'exact', head: true }),
      supabase.from('dropship_partners').select('id', { count: 'exact', head: true })
    ]);

    return {
      total_opportunities: opps.count || 0,
      total_buyers: buyers.count || 0,
      total_suppliers: suppliers.count || 0
    };
  }
}
