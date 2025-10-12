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

      // Salva no Supabase (tabela opportunities) usando schema correto
      const productsToSave = products.map(p => {
        const price = parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0;
        const estimatedMonthlyRevenue = price * (p.reviews / 100); // Estimativa baseada em reviews
        
        return {
          type: 'B2B',
          source: 'Amazon RapidAPI (Real)',
          status: 'approved',
          product_category: p.category,
          product_name: p.title,
          quantity: p.reviews, // Usando reviews como proxy de demanda
          target_country: country,
          estimated_value: estimatedMonthlyRevenue,
          margin_percentage: 30.0, // Margem típica B2B
          risk_score: p.rating < 4.0 ? 50 : 10, // Menor rating = maior risco
          ai_analysis: {
            asin: p.asin,
            price: price,
            rating: p.rating,
            reviews: p.reviews,
            prime: p.prime,
            affiliate_link: p.affiliateLink,
            image: p.image
          },
          compliance_status: {
            amazon_verified: true,
            category: p.category
          },
          execution_data: null
        };
      });

      const { data, error } = await supabase
        .from('opportunities')
        .insert(productsToSave);

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
      // Busca oportunidades com alto volume (quantity = reviews)
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('*')
        .gt('quantity', 1000) // Mais de 1000 reviews/demanda
        .lt('risk_score', 30) // Baixo risco
        .order('quantity', { ascending: false })
        .limit(100);

      if (error || !opportunities || opportunities.length === 0) {
        return { success: false, buyers_detected: 0 };
      }

      const potentialBuyers: any[] = [];

      for (const opp of opportunities) {
        const volume = opp.quantity || 0;
        const aiData = (opp.ai_analysis as any) || {};
        const price = aiData.price || 20;
        
        // Heurística: >1000 volume = alta demanda = oportunidade B2B
        if (volume > 1000) {
          potentialBuyers.push({
            company_name: `Potential Buyer - ${opp.product_name.substring(0, 30)}`,
            country: opp.target_country || 'US',
            product_interest: opp.product_name,
            estimated_monthly_volume: Math.floor(volume / 10),
            target_price_per_unit: price * 0.7, // 30% desconto B2B
            potential_commission: price * 0.3,
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
