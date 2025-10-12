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

interface SAMGovRFQ {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  department: string;
  postedDate: string;
  responseDeadLine: string;
  type: string;
  naicsCode: string;
  description: string;
  pointOfContact: any[];
  placeOfPerformance: any;
  award?: any;
}

async function fetchSAMGovRFQs(params: {
  apiKey: string;
  naicsCode?: string;
  postedFrom?: string;
  postedTo?: string;
  limit?: number;
}): Promise<SAMGovRFQ[]> {
  const { apiKey, naicsCode, postedFrom, postedTo, limit = 100 } = params;
  
  const url = new URL('https://api.sam.gov/prod/opportunities/v2/search');
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('ptype', 'o'); // Opportunities only
  
  if (naicsCode) {
    url.searchParams.append('naicsCode', naicsCode);
  }
  
  if (postedFrom) {
    url.searchParams.append('postedFrom', postedFrom);
  }
  
  if (postedTo) {
    url.searchParams.append('postedTo', postedTo);
  }

  console.log(`🇺🇸 Fetching SAM.gov RFQs: ${url.toString()}`);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`SAM.gov API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.opportunitiesData || [];
}

function parseRFQRequirements(rfq: SAMGovRFQ): {
  product_needs: string[];
  estimated_value: number;
  deadline: string;
  location: string;
} {
  const description = rfq.description?.toLowerCase() || '';
  
  // Extract product needs from title and description
  const productKeywords = [
    'supplements', 'vitamins', 'medical supplies', 'pharmaceuticals',
    'equipment', 'software', 'hardware', 'services'
  ];
  
  const detectedProducts = productKeywords.filter(keyword => 
    rfq.title.toLowerCase().includes(keyword) || description.includes(keyword)
  );

  // Estimate value from award or description
  let estimatedValue = 0;
  if (rfq.award?.amount) {
    estimatedValue = parseFloat(rfq.award.amount.replace(/[^0-9.]/g, ''));
  } else {
    const valueMatch = description.match(/\$?([\d,]+)/);
    if (valueMatch) {
      estimatedValue = parseFloat(valueMatch[1].replace(/,/g, ''));
    }
  }

  return {
    product_needs: detectedProducts.length > 0 ? detectedProducts : ['general procurement'],
    estimated_value: estimatedValue || 50000,
    deadline: rfq.responseDeadLine || 'Not specified',
    location: rfq.placeOfPerformance?.state?.name || 'USA'
  };
}

async function storeSAMGovRFQ(rfq: SAMGovRFQ): Promise<void> {
  const requirements = parseRFQRequirements(rfq);
  
  const buyerData = {
    platform: 'SAM.gov (Federal Government)',
    company_name: rfq.department || 'US Federal Government',
    contact_person: rfq.pointOfContact?.[0]?.fullName || 'Contracting Officer',
    email: rfq.pointOfContact?.[0]?.email || 'contracting@sam.gov',
    phone: rfq.pointOfContact?.[0]?.phone || '+1-800-FED-BIZ',
    country: 'USA',
    industry: `NAICS ${rfq.naicsCode}`,
    product_needs: requirements.product_needs,
    order_volume: 'Government Contract',
    budget_range: `$${requirements.estimated_value.toLocaleString()}`,
    timeline: requirements.deadline,
    buying_history: {
      rfq_id: rfq.noticeId,
      solicitation_number: rfq.solicitationNumber,
      posted_date: rfq.postedDate,
      type: rfq.type,
      description: rfq.description,
      full_rfq_data: rfq
    },
    decision_maker_level: 'high',
    company_size: 'government',
    lead_score: 90, // Government contracts = high score
    contact_status: 'rfq_detected'
  };

  // Check if already exists
  const { data: existing } = await supabase
    .from('b2b_buyers')
    .select('id')
    .eq('buying_history->rfq_id', rfq.noticeId)
    .single();

  if (!existing) {
    const { error } = await supabase
      .from('b2b_buyers')
      .insert(buyerData);

    if (error) {
      console.error('Error storing SAM.gov RFQ:', error);
    } else {
      console.log(`✅ Stored SAM.gov RFQ: ${rfq.solicitationNumber}`);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();

    if (action === 'fetch_sam_gov_rfqs') {
      // Get SAM.gov API key from environment or params
      const samGovApiKey = Deno.env.get('SAM_GOV_API_KEY') || params?.apiKey;
      
      if (!samGovApiKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'SAM.gov API key required. Get free key at sam.gov'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch RFQs for relevant NAICS codes
      const naicsCodes = [
        '325411', // Medicinal and Botanical Manufacturing
        '325412', // Pharmaceutical Preparation Manufacturing
        '446110', // Pharmacies and Drug Stores
        '339112', // Surgical and Medical Instrument Manufacturing
        '541512', // Computer Systems Design
        '541519', // Other Computer Related Services
      ];

      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const postedFrom = thirtyDaysAgo.toLocaleDateString('en-US');
      const postedTo = today.toLocaleDateString('en-US');

      let totalRFQs = 0;
      const results = [];

      for (const naicsCode of naicsCodes) {
        const rfqs = await fetchSAMGovRFQs({
          apiKey: samGovApiKey,
          naicsCode,
          postedFrom,
          postedTo,
          limit: 50
        });

        console.log(`Found ${rfqs.length} RFQs for NAICS ${naicsCode}`);

        for (const rfq of rfqs) {
          await storeSAMGovRFQ(rfq);
          results.push({
            rfq_id: rfq.noticeId,
            title: rfq.title,
            department: rfq.department,
            deadline: rfq.responseDeadLine
          });
        }

        totalRFQs += rfqs.length;
      }

      return new Response(JSON.stringify({
        success: true,
        total_rfqs_found: totalRFQs,
        naics_codes_searched: naicsCodes,
        date_range: { from: postedFrom, to: postedTo },
        results: results,
        message: `Found ${totalRFQs} government RFQs and stored as buyer leads`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('SAM.gov RFQ Detector Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
