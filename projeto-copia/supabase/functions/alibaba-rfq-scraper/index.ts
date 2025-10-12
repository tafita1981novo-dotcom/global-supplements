import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://twglceexfetejawoumsr.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AlibabaRFQ {
  rfq_id: string;
  title: string;
  category: string;
  quantity: string;
  target_price: string;
  buyer_country: string;
  buyer_requirements: string;
  quote_deadline: string;
  posted_date: string;
  rfq_url: string;
}

async function scrapeAlibabaRFQs(params: {
  category?: string;
  country?: string;
  limit?: number;
}): Promise<AlibabaRFQ[]> {
  const { category = '', country = '', limit = 50 } = params;
  
  // Use Apify Actor for Alibaba scraping (requires Apify API key)
  const apifyApiKey = Deno.env.get('APIFY_API_KEY');
  
  if (!apifyApiKey) {
    console.warn('Apify API key not found. Using direct scraping (limited)...');
    return await directScrapeAlibaba(category, limit);
  }

  try {
    // Apify Actor: alibaba-scraper
    const actorUrl = 'https://api.apify.com/v2/acts/misceres~alibaba-scraper/runs';
    
    const runResponse = await fetch(actorUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startUrls: [{ url: `https://www.alibaba.com/rfq?SearchText=${category}` }],
        maxItems: limit,
        proxy: { useApifyProxy: true }
      })
    });

    const runData = await runResponse.json();
    const runId = runData.data.id;

    // Wait for completion (polling)
    let attempts = 0;
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { headers: { 'Authorization': `Bearer ${apifyApiKey}` } }
      );
      
      const statusData = await statusResponse.json();
      
      if (statusData.data.status === 'SUCCEEDED') {
        const datasetId = statusData.data.defaultDatasetId;
        const itemsResponse = await fetch(
          `https://api.apify.com/v2/datasets/${datasetId}/items`,
          { headers: { 'Authorization': `Bearer ${apifyApiKey}` } }
        );
        
        const items = await itemsResponse.json();
        return transformApifyData(items);
      }
      
      attempts++;
    }

    throw new Error('Apify scraping timeout');
  } catch (error) {
    console.error('Apify scraping error:', error);
    return await directScrapeAlibaba(category, limit);
  }
}

async function directScrapeAlibaba(category: string, limit: number): Promise<AlibabaRFQ[]> {
  // Direct scraping (backup method)
  const url = `https://www.alibaba.com/rfq?SearchText=${encodeURIComponent(category)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Alibaba fetch failed: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract RFQ data using regex/parsing
    const rfqPattern = /<div class="rfq-item"[^>]*>(.*?)<\/div>/gs;
    const matches = html.match(rfqPattern) || [];
    
    const rfqs: AlibabaRFQ[] = [];
    
    for (let i = 0; i < Math.min(matches.length, limit); i++) {
      const match = matches[i];
      
      // Parse individual RFQ (simplified - would need proper HTML parsing)
      const titleMatch = match.match(/<h3[^>]*>(.*?)<\/h3>/);
      const qtyMatch = match.match(/Quantity[:\s]*([\d,]+)/i);
      const priceMatch = match.match(/Target Price[:\s]*\$?([\d,\.]+)/i);
      
      if (titleMatch) {
        rfqs.push({
          rfq_id: `alibaba_${Date.now()}_${i}`,
          title: titleMatch[1].trim(),
          category: category,
          quantity: qtyMatch ? qtyMatch[1] : 'Not specified',
          target_price: priceMatch ? `$${priceMatch[1]}` : 'Contact for quote',
          buyer_country: 'Global',
          buyer_requirements: 'See RFQ details',
          quote_deadline: '7 days',
          posted_date: new Date().toISOString(),
          rfq_url: url
        });
      }
    }

    return rfqs;
  } catch (error) {
    console.error('Direct Alibaba scraping error:', error);
    return [];
  }
}

function transformApifyData(items: any[]): AlibabaRFQ[] {
  return items.map((item: any, index: number) => ({
    rfq_id: item.rfqId || `alibaba_${Date.now()}_${index}`,
    title: item.title || item.productName || 'RFQ',
    category: item.category || 'General',
    quantity: item.quantity || item.moq || 'Not specified',
    target_price: item.targetPrice || item.price || 'Contact for quote',
    buyer_country: item.buyerCountry || item.country || 'Global',
    buyer_requirements: item.requirements || item.description || '',
    quote_deadline: item.deadline || '7 days',
    posted_date: item.postedDate || new Date().toISOString(),
    rfq_url: item.url || 'https://www.alibaba.com/rfq'
  }));
}

async function storeAlibabaRFQ(rfq: AlibabaRFQ): Promise<void> {
  const buyerData = {
    platform: 'Alibaba.com RFQ Market',
    company_name: 'Alibaba Buyer',
    contact_person: 'RFQ Contact',
    email: 'rfq@alibaba-buyer.com',
    phone: '+86-000-0000',
    country: rfq.buyer_country,
    industry: rfq.category,
    product_needs: [rfq.title, rfq.category],
    order_volume: rfq.quantity,
    budget_range: rfq.target_price,
    timeline: rfq.quote_deadline,
    buying_history: {
      rfq_id: rfq.rfq_id,
      requirements: rfq.buyer_requirements,
      posted_date: rfq.posted_date,
      rfq_url: rfq.rfq_url,
      full_rfq_data: rfq
    },
    decision_maker_level: 'medium',
    company_size: 'medium',
    lead_score: 70,
    contact_status: 'rfq_detected'
  };

  const { data: existing } = await supabase
    .from('b2b_buyers')
    .select('id')
    .eq('buying_history->rfq_id', rfq.rfq_id)
    .single();

  if (!existing) {
    const { error } = await supabase
      .from('b2b_buyers')
      .insert(buyerData);

    if (error) {
      console.error('Error storing Alibaba RFQ:', error);
    } else {
      console.log(`✅ Stored Alibaba RFQ: ${rfq.title}`);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();

    if (action === 'scrape_alibaba_rfqs') {
      const categories = params?.categories || [
        'vitamins supplements',
        'medical equipment',
        'beauty products',
        'electronics',
        'industrial supplies'
      ];

      const allRfqs: AlibabaRFQ[] = [];

      for (const category of categories) {
        console.log(`🇨🇳 Scraping Alibaba RFQs for: ${category}`);
        
        const rfqs = await scrapeAlibabaRFQs({
          category,
          limit: params?.limit || 20
        });

        for (const rfq of rfqs) {
          await storeAlibabaRFQ(rfq);
          allRfqs.push(rfq);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        total_rfqs_found: allRfqs.length,
        categories_searched: categories,
        rfqs: allRfqs,
        message: `Found ${allRfqs.length} Alibaba RFQs and stored as buyer leads`,
        note: params?.apifyApiKey ? 'Using Apify scraper' : 'Using direct scraping (limited)'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action. Use: scrape_alibaba_rfqs'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Alibaba RFQ Scraper Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
