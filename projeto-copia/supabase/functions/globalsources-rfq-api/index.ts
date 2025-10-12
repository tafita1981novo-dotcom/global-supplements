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

interface GlobalSourcesRFQ {
  inquiry_id: string;
  product_name: string;
  category: string;
  quantity: string;
  target_price: string;
  buyer_company: string;
  buyer_country: string;
  buyer_email: string;
  requirements: string;
  deadline: string;
  posted_date: string;
}

async function fetchGlobalSourcesRFQs(params: {
  supplierId: string;
  supplierKey: string;
  fromDate?: string;
  toDate?: string;
}): Promise<GlobalSourcesRFQ[]> {
  const { supplierId, supplierKey, fromDate, toDate } = params;
  
  // GlobalSources XML API endpoint
  const apiUrl = 'https://www.globalsources.com/gsol/SupplierAPI/Inquiry.asmx/GetInquiryList';
  
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetInquiryList xmlns="http://www.globalsources.com/">
      <supplierId>${supplierId}</supplierId>
      <supplierKey>${supplierKey}</supplierKey>
      <fromDate>${fromDate || ''}</fromDate>
      <toDate>${toDate || ''}</toDate>
    </GetInquiryList>
  </soap:Body>
</soap:Envelope>`;

  console.log('🇭🇰 Fetching GlobalSources RFQs...');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://www.globalsources.com/GetInquiryList'
      },
      body: xmlBody
    });

    if (!response.ok) {
      throw new Error(`GlobalSources API error: ${response.statusText}`);
    }

    const xmlResponse = await response.text();
    
    // Parse XML response
    const rfqs = parseGlobalSourcesXML(xmlResponse);
    return rfqs;

  } catch (error) {
    console.error('GlobalSources API error:', error);
    return [];
  }
}

function parseGlobalSourcesXML(xml: string): GlobalSourcesRFQ[] {
  const rfqs: GlobalSourcesRFQ[] = [];
  
  // Simple XML parsing (in production, use proper XML parser)
  const inquiryPattern = /<Inquiry>(.*?)<\/Inquiry>/gs;
  const matches = xml.match(inquiryPattern) || [];
  
  for (const match of matches) {
    const getTag = (tag: string) => {
      const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
      const tagMatch = match.match(regex);
      return tagMatch ? tagMatch[1].trim() : '';
    };

    rfqs.push({
      inquiry_id: getTag('InquiryID') || `gs_${Date.now()}`,
      product_name: getTag('ProductName') || 'Product Inquiry',
      category: getTag('Category') || 'General',
      quantity: getTag('Quantity') || 'Not specified',
      target_price: getTag('TargetPrice') || 'Contact for quote',
      buyer_company: getTag('CompanyName') || 'GlobalSources Buyer',
      buyer_country: getTag('Country') || 'Global',
      buyer_email: getTag('Email') || 'inquiry@globalsources.com',
      requirements: getTag('Requirements') || '',
      deadline: getTag('Deadline') || '7 days',
      posted_date: getTag('PostedDate') || new Date().toISOString()
    });
  }

  return rfqs;
}

async function storeGlobalSourcesRFQ(rfq: GlobalSourcesRFQ): Promise<void> {
  const buyerData = {
    platform: 'GlobalSources.com',
    company_name: rfq.buyer_company,
    contact_person: 'Purchasing Manager',
    email: rfq.buyer_email,
    phone: '+852-0000-0000',
    country: rfq.buyer_country,
    industry: rfq.category,
    product_needs: [rfq.product_name, rfq.category],
    order_volume: rfq.quantity,
    budget_range: rfq.target_price,
    timeline: rfq.deadline,
    buying_history: {
      inquiry_id: rfq.inquiry_id,
      requirements: rfq.requirements,
      posted_date: rfq.posted_date,
      source: 'GlobalSources XML API',
      full_rfq_data: rfq
    },
    decision_maker_level: 'high',
    company_size: 'medium',
    lead_score: 80,
    contact_status: 'rfq_detected'
  };

  const { data: existing } = await supabase
    .from('b2b_buyers')
    .select('id')
    .eq('buying_history->inquiry_id', rfq.inquiry_id)
    .single();

  if (!existing) {
    const { error } = await supabase
      .from('b2b_buyers')
      .insert(buyerData);

    if (error) {
      console.error('Error storing GlobalSources RFQ:', error);
    } else {
      console.log(`✅ Stored GlobalSources RFQ: ${rfq.product_name} from ${rfq.buyer_company}`);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();

    if (action === 'fetch_globalsources_rfqs') {
      const supplierId = params?.supplierId || Deno.env.get('GLOBALSOURCES_SUPPLIER_ID');
      const supplierKey = params?.supplierKey || Deno.env.get('GLOBALSOURCES_SUPPLIER_KEY');
      
      if (!supplierId || !supplierKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'GlobalSources Supplier ID and Key required',
          instructions: [
            '1. Register as supplier at globalsources.com',
            '2. Purchase Gold Supplier membership ($5K-$15K/year)',
            '3. Get Supplier ID and API Key from account settings',
            '4. Add to Replit Secrets: GLOBALSOURCES_SUPPLIER_ID, GLOBALSOURCES_SUPPLIER_KEY'
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch RFQs from last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const fromDate = sevenDaysAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];

      const rfqs = await fetchGlobalSourcesRFQs({
        supplierId,
        supplierKey,
        fromDate,
        toDate
      });

      console.log(`Found ${rfqs.length} GlobalSources RFQs`);

      const results = [];
      for (const rfq of rfqs) {
        await storeGlobalSourcesRFQ(rfq);
        results.push({
          inquiry_id: rfq.inquiry_id,
          product: rfq.product_name,
          company: rfq.buyer_company,
          country: rfq.buyer_country
        });
      }

      return new Response(JSON.stringify({
        success: true,
        total_rfqs_found: rfqs.length,
        date_range: { from: fromDate, to: toDate },
        results: results,
        message: `Found ${rfqs.length} GlobalSources RFQs and stored as buyer leads`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action. Use: fetch_globalsources_rfqs'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('GlobalSources RFQ API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
