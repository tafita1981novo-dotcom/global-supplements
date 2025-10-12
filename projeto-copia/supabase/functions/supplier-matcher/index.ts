import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SupplierMatch {
  supplier_id: string;
  supplier_name: string;
  country: string;
  product_match_score: number;
  price_per_unit: number;
  delivery_days: number;
  shipping_method: 'air' | 'sea' | 'land' | 'express';
  commission_percentage: number;
  broker_profit: number;
  reliability_score: number;
  total_score: number;
  can_meet_deadline: boolean;
  certifications: string[];
  payment_terms: string;
}

interface BuyerRequirements {
  product_name: string;
  quantity: number;
  max_price_per_unit: number;
  max_delivery_days: number;
  required_certifications?: string[];
  preferred_shipping: 'air' | 'sea' | 'any';
  country: string;
}

// 🎯 INTELLIGENT SUPPLIER MATCHING ENGINE
class SupplierMatcher {
  private openaiApiKey: string;
  private supabase: any;

  constructor(openaiApiKey: string, supabase: any) {
    this.openaiApiKey = openaiApiKey;
    this.supabase = supabase;
  }

  // 🔍 STEP 1: Find ALL suppliers that have the product
  async findProductSuppliers(productName: string): Promise<any[]> {
    console.log(`🔍 Searching suppliers for product: ${productName}`);

    // Get all suppliers from database
    const { data: suppliers } = await this.supabase
      .from('dropship_partners')
      .select('*')
      .or(`product_categories.cs.{${productName}},company_name.ilike.%${productName}%`);

    // Use GPT-4 to find EXACT product match across suppliers
    const supplierList = suppliers?.map(s => ({
      id: s.id,
      name: s.company_name,
      country: s.country,
      products: s.product_categories,
      price_range: s.price_range,
      moq: s.minimum_order_quantity,
      delivery_time: s.delivery_time_days,
      commission: s.commission_percentage,
      reliability: s.reliability_score,
      certifications: s.certifications || []
    })) || [];

    const prompt = `
TASK: Find ALL suppliers that sell this EXACT product: "${productName}"

SUPPLIERS DATABASE:
${JSON.stringify(supplierList, null, 2)}

INSTRUCTIONS:
1. Match suppliers that have this EXACT product or very similar
2. If product name is generic (e.g. "collagen"), match ALL collagen suppliers
3. Return ONLY suppliers that can actually supply this product
4. Include ALL relevant suppliers (don't limit to 1-2)

Return JSON array of matched supplier IDs:
["id1", "id2", "id3", ...]

If no suppliers match, return empty array: []
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a product matching expert. Return ONLY valid JSON array of supplier IDs.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const matchedIds = JSON.parse(data.choices[0].message.content).supplier_ids || [];
      
      return suppliers?.filter(s => matchedIds.includes(s.id)) || [];
    } catch (error) {
      console.error('Error matching products:', error);
      return suppliers || [];
    }
  }

  // 💰 STEP 2: Get pricing and delivery quote from EACH supplier
  async getSupplierQuotes(suppliers: any[], requirements: BuyerRequirements): Promise<SupplierMatch[]> {
    console.log(`💰 Getting quotes from ${suppliers.length} suppliers`);

    const quotes: SupplierMatch[] = [];

    for (const supplier of suppliers) {
      // Simulate getting actual quote (in real system, this calls supplier API)
      const basePricePerUnit = this.calculateBasePrice(supplier, requirements);
      const deliveryDays = this.estimateDeliveryTime(supplier, requirements);
      const shippingMethod = this.selectShippingMethod(supplier, requirements, deliveryDays);
      const commissionPercent = supplier.commission_percentage || 15;
      
      // Calculate broker profit
      const supplierCost = basePricePerUnit * requirements.quantity;
      const brokerRevenue = requirements.max_price_per_unit * requirements.quantity;
      const brokerProfit = brokerRevenue - supplierCost;
      const brokerCommission = brokerProfit * (commissionPercent / 100);

      const quote: SupplierMatch = {
        supplier_id: supplier.id,
        supplier_name: supplier.company_name,
        country: supplier.country,
        product_match_score: 95, // GPT-4 already filtered exact matches
        price_per_unit: basePricePerUnit,
        delivery_days: deliveryDays,
        shipping_method: shippingMethod,
        commission_percentage: commissionPercent,
        broker_profit: brokerCommission,
        reliability_score: supplier.reliability_score || 85,
        total_score: 0, // Calculated next
        can_meet_deadline: deliveryDays <= requirements.max_delivery_days,
        certifications: supplier.certifications || [],
        payment_terms: supplier.payment_terms || '100% advance payment'
      };

      // Calculate total score: Profit × Reliability × Delivery Speed
      quote.total_score = this.calculateSupplierScore(quote, requirements);
      quotes.push(quote);
    }

    return quotes;
  }

  private calculateBasePrice(supplier: any, req: BuyerRequirements): number {
    // Simulate price calculation based on supplier pricing
    const avgPrice = supplier.price_range?.avg || req.max_price_per_unit * 0.7;
    const quantityDiscount = req.quantity > 1000 ? 0.9 : req.quantity > 500 ? 0.95 : 1;
    return avgPrice * quantityDiscount;
  }

  private estimateDeliveryTime(supplier: any, req: BuyerRequirements): number {
    const baseDelivery = supplier.delivery_time_days || 21;
    
    // Adjust based on distance
    const sameCountry = supplier.country === req.country;
    if (sameCountry) return Math.min(baseDelivery, 7);
    
    // International
    return baseDelivery;
  }

  private selectShippingMethod(supplier: any, req: BuyerRequirements, deliveryDays: number): 'air' | 'sea' | 'express' {
    // Prefer air shipping if buyer wants it OR if deadline is tight
    if (req.preferred_shipping === 'air') return 'air';
    if (deliveryDays < 10) return 'express';
    if (deliveryDays < 20) return 'air';
    return 'sea';
  }

  private calculateSupplierScore(quote: SupplierMatch, req: BuyerRequirements): number {
    let score = 0;

    // 1. PROFIT WEIGHT (40%) - Higher commission = better
    const profitScore = (quote.broker_profit / (req.max_price_per_unit * req.quantity)) * 40;
    score += profitScore;

    // 2. RELIABILITY WEIGHT (30%) - Higher reliability = better
    score += (quote.reliability_score / 100) * 30;

    // 3. DELIVERY SPEED WEIGHT (20%) - Faster = better
    const deliveryScore = ((req.max_delivery_days - quote.delivery_days) / req.max_delivery_days) * 20;
    score += Math.max(0, deliveryScore);

    // 4. SHIPPING METHOD BONUS (10%)
    if (quote.shipping_method === 'air' || quote.shipping_method === 'express') {
      score += 10;
    }

    // 5. DEADLINE PENALTY - Can't meet deadline = disqualified
    if (!quote.can_meet_deadline) {
      score = 0;
    }

    return Math.round(score * 100) / 100;
  }

  // 🏆 STEP 3: Select BEST supplier based on profit + reliability
  async selectBestSupplier(quotes: SupplierMatch[], requirements: BuyerRequirements): Promise<SupplierMatch | null> {
    console.log(`🏆 Selecting best supplier from ${quotes.length} quotes`);

    // Filter: Must meet deadline
    const validQuotes = quotes.filter(q => q.can_meet_deadline);

    if (validQuotes.length === 0) {
      console.log('❌ No suppliers can meet the deadline');
      return null;
    }

    // Sort by total score (profit × reliability × speed)
    const sortedQuotes = validQuotes.sort((a, b) => b.total_score - a.total_score);

    // Use GPT-4 for final decision with business context
    const prompt = `
TASK: Select the BEST supplier for maximum profit and reliability

BUYER REQUIREMENTS:
- Product: ${requirements.product_name}
- Quantity: ${requirements.quantity.toLocaleString()} units
- Max Price: $${requirements.max_price_per_unit}/unit
- Max Delivery: ${requirements.max_delivery_days} days
- Preferred Shipping: ${requirements.preferred_shipping}

TOP SUPPLIER QUOTES:
${JSON.stringify(sortedQuotes.slice(0, 3), null, 2)}

DECISION CRITERIA:
1. Maximize broker commission/profit
2. Ensure reliability (score > 80)
3. Prefer air/express shipping
4. Must meet deadline
5. Consider certifications if required

Return JSON with decision:
{
  "selected_supplier_id": "xxx",
  "reason": "Brief explanation",
  "estimated_profit": 12345,
  "risk_level": "low|medium|high"
}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a B2B sourcing expert. Maximize profit while ensuring reliability.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const decision = JSON.parse(data.choices[0].message.content);
      
      const selectedSupplier = sortedQuotes.find(q => q.supplier_id === decision.selected_supplier_id);
      
      if (selectedSupplier) {
        console.log(`✅ Selected: ${selectedSupplier.supplier_name} - Profit: $${selectedSupplier.broker_profit}, Score: ${selectedSupplier.total_score}`);
      }

      return selectedSupplier || sortedQuotes[0]; // Fallback to highest score
    } catch (error) {
      console.error('Error selecting supplier:', error);
      return sortedQuotes[0]; // Return best score if GPT fails
    }
  }

  // 🤖 COMPLETE MATCHING FLOW
  async matchSupplierToRequirements(requirements: BuyerRequirements): Promise<any> {
    console.log('🎯 Starting intelligent supplier matching...');

    // Step 1: Find all suppliers with the product
    const suppliers = await this.findProductSuppliers(requirements.product_name);
    
    if (suppliers.length === 0) {
      return {
        success: false,
        error: 'No suppliers found for this product',
        product: requirements.product_name
      };
    }

    console.log(`✅ Found ${suppliers.length} potential suppliers`);

    // Step 2: Get quotes from all suppliers
    const quotes = await this.getSupplierQuotes(suppliers, requirements);

    // Step 3: Select best supplier
    const bestMatch = await this.selectBestSupplier(quotes, requirements);

    if (!bestMatch) {
      return {
        success: false,
        error: 'No suppliers can meet the delivery deadline',
        requirements: requirements,
        quotes_received: quotes.length
      };
    }

    // Step 4: Save to database
    await this.supabase
      .from('supplier_matches')
      .insert({
        buyer_requirements: requirements,
        selected_supplier_id: bestMatch.supplier_id,
        supplier_name: bestMatch.supplier_name,
        price_per_unit: bestMatch.price_per_unit,
        delivery_days: bestMatch.delivery_days,
        shipping_method: bestMatch.shipping_method,
        broker_commission: bestMatch.broker_profit,
        reliability_score: bestMatch.reliability_score,
        total_score: bestMatch.total_score,
        all_quotes: quotes,
        created_at: new Date().toISOString()
      });

    return {
      success: true,
      best_match: bestMatch,
      alternatives: quotes.filter(q => q.supplier_id !== bestMatch.supplier_id).slice(0, 2),
      total_suppliers_checked: suppliers.length,
      estimated_profit: bestMatch.broker_profit,
      estimated_delivery: `${bestMatch.delivery_days} days via ${bestMatch.shipping_method}`
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = 'https://twglceexfetejawoumsr.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { action, requirements } = await req.json();

    const matcher = new SupplierMatcher(openaiApiKey, supabase);

    if (action === 'match_supplier') {
      const result = await matcher.matchSupplierToRequirements(requirements);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action',
      available_actions: ['match_supplier']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Supplier Matcher error:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
