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

interface IndiaMARTLead {
  UNIQUE_QUERY_ID: string;
  QUERY_TYPE: string;
  QUERY_TIME: string;
  SENDER_NAME: string;
  SENDER_MOBILE: string;
  SENDER_EMAIL: string;
  SENDER_COMPANY: string;
  SENDER_ADDRESS: string;
  SENDER_CITY: string;
  SENDER_STATE: string;
  SENDER_COUNTRY_ISO: string;
  SENDER_MOBILE_ALT?: string;
  SENDER_EMAIL_ALT?: string;
  QUERY_PRODUCT_NAME: string;
  QUERY_MESSAGE: string;
  CALL_DURATION?: string;
  RECEIVER_MOBILE?: string;
}

async function fetchIndiaMARTLeads(params: {
  mobile: string;
  apiKey: string;
  startTime?: string;
  endTime?: string;
}): Promise<IndiaMARTLead[]> {
  const { mobile, apiKey, startTime, endTime } = params;
  
  const url = new URL('https://mapi.indiamart.com/wservce/crm/crmListing/v2/');
  url.searchParams.append('glusr_crm_key', apiKey);
  url.searchParams.append('user_mobile', mobile);
  
  if (startTime) {
    url.searchParams.append('start_time', startTime);
  }
  
  if (endTime) {
    url.searchParams.append('end_time', endTime);
  }

  console.log(`🇮🇳 Fetching IndiaMART leads for mobile: ${mobile}`);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`IndiaMART API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.STATUS === 'SUCCESS' && data.CODE === 200) {
    return data.RESPONSE || [];
  } else {
    throw new Error(`IndiaMART API returned: ${data.MESSAGE || 'Unknown error'}`);
  }
}

function parseIndiaMARTRequirements(lead: IndiaMARTLead): {
  product_needs: string[];
  estimated_quantity: string;
  budget_range: string;
} {
  const message = lead.QUERY_MESSAGE?.toLowerCase() || '';
  const productName = lead.QUERY_PRODUCT_NAME || '';
  
  // Extract quantity from message
  const quantityPatterns = [
    /(\d+)\s*(pieces?|pcs|units?|kg|tons?|liter|boxes?)/i,
    /quantity[:\s]+(\d+)/i,
    /need\s+(\d+)/i,
  ];
  
  let quantity = 'Inquiry';
  for (const pattern of quantityPatterns) {
    const match = message.match(pattern);
    if (match) {
      quantity = match[0];
      break;
    }
  }

  // Extract budget if mentioned
  const budgetPatterns = [
    /(?:budget|price|cost)[:\s]*(?:rs|inr|usd)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /(?:rs|inr|usd)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  ];
  
  let budget = 'Contact for quote';
  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) {
      budget = `₹${match[1]} range`;
      break;
    }
  }

  return {
    product_needs: [productName, 'B2B inquiry'],
    estimated_quantity: quantity,
    budget_range: budget
  };
}

async function storeIndiaMARTLead(lead: IndiaMARTLead): Promise<void> {
  const requirements = parseIndiaMARTRequirements(lead);
  
  const buyerData = {
    platform: 'IndiaMART (B2B India)',
    company_name: lead.SENDER_COMPANY || 'IndiaMART Buyer',
    contact_person: lead.SENDER_NAME || 'Unknown',
    email: lead.SENDER_EMAIL || lead.SENDER_EMAIL_ALT || 'no-email@indiamart.com',
    phone: lead.SENDER_MOBILE || lead.SENDER_MOBILE_ALT || '+91-0000000000',
    country: lead.SENDER_COUNTRY_ISO || 'IN',
    industry: 'B2B Import/Export',
    product_needs: requirements.product_needs,
    order_volume: requirements.estimated_quantity,
    budget_range: requirements.budget_range,
    timeline: 'Contact for timeline',
    buying_history: {
      query_id: lead.UNIQUE_QUERY_ID,
      query_type: lead.QUERY_TYPE,
      query_time: lead.QUERY_TIME,
      product: lead.QUERY_PRODUCT_NAME,
      message: lead.QUERY_MESSAGE,
      location: `${lead.SENDER_CITY}, ${lead.SENDER_STATE}, ${lead.SENDER_COUNTRY_ISO}`,
      full_lead_data: lead
    },
    decision_maker_level: lead.QUERY_TYPE === 'W' ? 'high' : 'medium', // W = WhatsApp/Direct
    company_size: 'medium',
    lead_score: lead.QUERY_TYPE === 'W' ? 85 : 75,
    contact_status: 'rfq_detected'
  };

  // Check if already exists by unique query ID
  const { data: existing } = await supabase
    .from('b2b_buyers')
    .select('id')
    .eq('buying_history->query_id', lead.UNIQUE_QUERY_ID)
    .single();

  if (!existing) {
    const { error } = await supabase
      .from('b2b_buyers')
      .insert(buyerData);

    if (error) {
      console.error('Error storing IndiaMART lead:', error);
    } else {
      console.log(`✅ Stored IndiaMART lead: ${lead.QUERY_PRODUCT_NAME} from ${lead.SENDER_COMPANY}`);
    }
  } else {
    console.log(`⏭️ Lead already exists: ${lead.UNIQUE_QUERY_ID}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();

    if (action === 'fetch_indiamart_leads') {
      const mobile = params?.mobile || Deno.env.get('INDIAMART_MOBILE');
      const apiKey = params?.apiKey || Deno.env.get('INDIAMART_API_KEY');
      
      if (!mobile || !apiKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'IndiaMART mobile and API key required. Get from IndiaMART Lead Manager settings.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch leads from last 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const startTime = yesterday.toISOString().replace('T', ' ').split('.')[0];
      const endTime = now.toISOString().replace('T', ' ').split('.')[0];

      const leads = await fetchIndiaMARTLeads({
        mobile,
        apiKey,
        startTime,
        endTime
      });

      console.log(`Found ${leads.length} IndiaMART leads in last 24h`);

      const results = [];
      for (const lead of leads) {
        await storeIndiaMARTLead(lead);
        results.push({
          query_id: lead.UNIQUE_QUERY_ID,
          product: lead.QUERY_PRODUCT_NAME,
          company: lead.SENDER_COMPANY,
          location: `${lead.SENDER_CITY}, ${lead.SENDER_STATE}`
        });
      }

      return new Response(JSON.stringify({
        success: true,
        total_leads_found: leads.length,
        time_range: { from: startTime, to: endTime },
        results: results,
        message: `Found ${leads.length} IndiaMART B2B leads and stored as buyer requests`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'setup_push_webhook') {
      // Setup instructions for IndiaMART Push API
      return new Response(JSON.stringify({
        success: true,
        webhook_url: `${supabaseUrl}/functions/v1/indiamart-rfq-detector`,
        instructions: [
          '1. Login to IndiaMART seller account',
          '2. Go to Lead Manager → Import/Export Leads → Push API',
          '3. Enter webhook URL (above)',
          '4. Save settings',
          '5. Leads will be pushed in real-time to this endpoint'
        ],
        note: 'Push API requires SSL endpoint (HTTPS) and paid IndiaMART membership'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle incoming webhook from IndiaMART Push API
    if (action === 'webhook' || req.method === 'POST') {
      const webhookData = await req.json();
      
      if (webhookData.UNIQUE_QUERY_ID) {
        await storeIndiaMARTLead(webhookData as IndiaMARTLead);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Lead received and stored'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action. Use: fetch_indiamart_leads, setup_push_webhook'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('IndiaMART RFQ Detector Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
