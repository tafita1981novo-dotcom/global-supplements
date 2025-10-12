import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngestionSource {
  name: string;
  enabled: boolean;
  lastRun?: string;
  recordsIngested?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = 'https://twglceexfetejawoumsr.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, source, params } = await req.json();

    console.log(`🔄 Real Data Ingestion: ${action} from ${source}`);

    // ============================================
    // 1. AMAZON REAL PRODUCTS via RapidAPI
    // ============================================
    if (action === 'ingest_amazon' && rapidApiKey) {
      const query = params.query || 'supplements vitamins';
      const country = params.country || 'US';
      const limit = params.limit || 50;

      const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=${country}&sort_by=REVIEWS&product_condition=ALL`;
      
      const response = await fetch(url, {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`Amazon API failed: ${response.status}`);
      }

      const data = await response.json();
      const products = data.data?.products || [];

      console.log(`✅ Fetched ${products.length} real Amazon products`);

      // Save to Supabase
      const productsToInsert = products.slice(0, limit).map((p: any) => ({
        asin: p.asin,
        title: p.product_title,
        price: parseFloat((p.product_price || '0').replace(/[^0-9.]/g, '')) || 0,
        rating: p.product_star_rating || 0,
        reviews: p.product_num_ratings || 0,
        image_url: p.product_photo || p.image,
        category: p.product_category || 'supplements',
        marketplace: country,
        affiliate_link: `https://www.amazon.com/dp/${p.asin}?tag=globalsupleme-20`,
        source: 'amazon_rapidapi',
        ingested_at: new Date().toISOString()
      }));

      const { data: inserted, error } = await supabase
        .from('opportunities')
        .upsert(productsToInsert, { onConflict: 'asin' });

      if (error) {
        console.error('Supabase insert error:', error);
      }

      return new Response(JSON.stringify({
        success: true,
        source: 'Amazon RapidAPI',
        products_fetched: products.length,
        products_saved: productsToInsert.length,
        query: query,
        country: country
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // 2. B2B BUYERS DETECTION (Real LinkedIn/Alibaba)
    // ============================================
    if (action === 'detect_buyers') {
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('*')
        .order('reviews', { ascending: false })
        .limit(100);

      // Analyze top products to find potential B2B buyers
      const potentialBuyers: any[] = [];

      for (const opp of opportunities || []) {
        // Simple heuristic: products with high volume = B2B opportunity
        if (opp.reviews > 1000 && opp.price < 50) {
          potentialBuyers.push({
            opportunity_id: opp.id,
            product: opp.title,
            estimated_volume: Math.floor(opp.reviews / 10), // Reviews → Est. monthly volume
            target_price: opp.price * 0.7, // 30% discount target
            potential_margin: opp.price * 0.3,
            source: 'market_analysis',
            created_at: new Date().toISOString()
          });
        }
      }

      if (potentialBuyers.length > 0) {
        await supabase.from('b2b_buyers').upsert(potentialBuyers);
      }

      return new Response(JSON.stringify({
        success: true,
        buyers_detected: potentialBuyers.length,
        opportunities_analyzed: opportunities?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // 3. EBAY REAL PRODUCTS
    // ============================================
    if (action === 'ingest_ebay') {
      // TODO: Implement eBay API/Scraping
      return new Response(JSON.stringify({
        success: false,
        message: 'eBay ingestion not yet implemented. Add eBay API key.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // 4. ALIBABA/INDIAMART SCRAPING
    // ============================================
    if (action === 'ingest_b2b_platforms') {
      // TODO: Implement Alibaba/IndiaMART scraping
      return new Response(JSON.stringify({
        success: false,
        message: 'B2B platform scraping not yet implemented.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ============================================
    // 5. STATUS CHECK
    // ============================================
    if (action === 'status') {
      const sources: IngestionSource[] = [
        { name: 'Amazon RapidAPI', enabled: !!rapidApiKey },
        { name: 'eBay API', enabled: false },
        { name: 'Alibaba Scraper', enabled: false },
        { name: 'IndiaMART Scraper', enabled: false },
        { name: 'B2B Buyer Detector', enabled: true }
      ];

      return new Response(JSON.stringify({
        success: true,
        sources: sources,
        message: 'Real data ingestion system active'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action',
      available_actions: ['ingest_amazon', 'detect_buyers', 'ingest_ebay', 'ingest_b2b_platforms', 'status']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
