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

// ===== ALIBABA SUPPLIER SEARCH =====
async function searchAlibabaSuppliers(params: {
  productName: string;
  maxPrice?: number;
  country?: string;
}): Promise<any[]> {
  const { productName, maxPrice, country } = params;
  
  // Use RapidAPI Amazon API para buscar produtos reais
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  
  if (!rapidApiKey) {
    console.warn('RapidAPI key not found, using database suppliers only');
    return [];
  }

  try {
    const searchQuery = encodeURIComponent(productName);
    const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${searchQuery}&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL`;

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.data?.products || [];

    // Transform Amazon products to supplier format
    return products.slice(0, 10).map((product: any) => ({
      supplier_name: product.product_seller || 'Amazon Seller',
      supplier_country: country || 'USA',
      product_name: product.product_title,
      unit_price: product.product_price ? parseFloat(product.product_price.replace(/[^0-9.]/g, '')) : 0,
      moq: product.product_minimum_order_quantity || 1,
      delivery_days: product.delivery?.tagline ? 15 : 30,
      certifications: product.product_certifications || [],
      product_url: product.product_url,
      product_photo: product.product_photo,
      rating: product.product_star_rating || 4.0,
      reviews_count: product.product_num_ratings || 0,
      source: 'Amazon (via RapidAPI)'
    }));
  } catch (error) {
    console.error('Amazon supplier search error:', error);
    return [];
  }
}

// ===== THOMASNET SUPPLIER SEARCH (USA/Canada) =====
async function searchThomasNetSuppliers(params: {
  productName: string;
  category?: string;
}): Promise<any[]> {
  // Note: Requires Apify or scraping service
  // For now, return empty - to be implemented with Apify integration
  console.log('ThomasNet search not yet implemented - requires Apify subscription');
  return [];
}

// ===== DATABASE SUPPLIER SEARCH =====
async function searchDatabaseSuppliers(params: {
  productName: string;
  maxPrice?: number;
  maxDeliveryDays?: number;
  country?: string;
}): Promise<any[]> {
  const { productName, maxPrice, maxDeliveryDays, country } = params;
  
  let query = supabase
    .from('suppliers')
    .select('*')
    .ilike('product_name', `%${productName}%`);

  if (maxPrice) {
    query = query.lte('unit_price', maxPrice);
  }

  if (maxDeliveryDays) {
    query = query.lte('delivery_days', maxDeliveryDays);
  }

  if (country) {
    query = query.eq('supplier_country', country);
  }

  const { data, error } = await query.limit(20);

  if (error) {
    console.error('Database supplier search error:', error);
    return [];
  }

  return data || [];
}

// ===== STORE NEW SUPPLIERS =====
async function storeSuppliers(suppliers: any[]): Promise<void> {
  for (const supplier of suppliers) {
    // Check if supplier already exists
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('supplier_name', supplier.supplier_name)
      .eq('product_name', supplier.product_name)
      .single();

    if (!existing) {
      const supplierData = {
        supplier_name: supplier.supplier_name,
        supplier_country: supplier.supplier_country,
        product_name: supplier.product_name,
        category: supplier.category || 'general',
        unit_price: supplier.unit_price,
        moq: supplier.moq || 1,
        delivery_days: supplier.delivery_days || 30,
        certifications: supplier.certifications || [],
        contact_email: supplier.contact_email || `contact@${supplier.supplier_name.toLowerCase().replace(/\s+/g, '')}.com`,
        contact_phone: supplier.contact_phone || '+1-000-000-0000',
        api_source: supplier.source || 'manual',
        product_url: supplier.product_url,
        rating: supplier.rating || 4.0,
        verified: supplier.verified || false
      };

      const { error } = await supabase
        .from('suppliers')
        .insert(supplierData);

      if (error) {
        console.error('Error storing supplier:', error);
      } else {
        console.log(`✅ Stored supplier: ${supplier.supplier_name} - ${supplier.product_name}`);
      }
    }
  }
}

// ===== INTELLIGENT MATCHING =====
function calculateMatchScore(supplier: any, requirements: any): number {
  let score = 0;

  // Price match (40 points)
  if (requirements.max_price) {
    if (supplier.unit_price <= requirements.max_price) {
      const priceDiff = requirements.max_price - supplier.unit_price;
      const priceScore = Math.min(40, (priceDiff / requirements.max_price) * 40);
      score += priceScore;
    }
  } else {
    score += 20; // Default if no price requirement
  }

  // Delivery time match (30 points)
  if (requirements.max_delivery_days) {
    if (supplier.delivery_days <= requirements.max_delivery_days) {
      const timeDiff = requirements.max_delivery_days - supplier.delivery_days;
      const timeScore = Math.min(30, (timeDiff / requirements.max_delivery_days) * 30);
      score += timeScore;
    }
  } else {
    score += 15;
  }

  // Quality indicators (30 points)
  if (supplier.rating) {
    score += (supplier.rating / 5) * 15;
  }
  if (supplier.certifications && supplier.certifications.length > 0) {
    score += 10;
  }
  if (supplier.verified) {
    score += 5;
  }

  return Math.round(score);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();

    // ===== SEARCH GLOBAL SUPPLIERS =====
    if (action === 'search_suppliers') {
      const { productName, maxPrice, maxDeliveryDays, country } = params;

      console.log(`🔍 Searching global suppliers for: ${productName}`);

      // Search multiple sources in parallel
      const [amazonSuppliers, dbSuppliers] = await Promise.all([
        searchAlibabaSuppliers({ productName, maxPrice, country }),
        searchDatabaseSuppliers({ productName, maxPrice, maxDeliveryDays, country })
      ]);

      // Combine and deduplicate
      const allSuppliers = [...amazonSuppliers, ...dbSuppliers];
      
      // Store new suppliers
      if (amazonSuppliers.length > 0) {
        await storeSuppliers(amazonSuppliers);
      }

      // Calculate match scores
      const requirements = { max_price: maxPrice, max_delivery_days: maxDeliveryDays };
      const scoredSuppliers = allSuppliers.map(supplier => ({
        ...supplier,
        match_score: calculateMatchScore(supplier, requirements)
      }));

      // Sort by match score
      scoredSuppliers.sort((a, b) => b.match_score - a.match_score);

      return new Response(JSON.stringify({
        success: true,
        total_suppliers_found: scoredSuppliers.length,
        sources: {
          amazon: amazonSuppliers.length,
          database: dbSuppliers.length
        },
        suppliers: scoredSuppliers.slice(0, 20),
        message: `Found ${scoredSuppliers.length} suppliers matching requirements`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ===== MATCH BUYER WITH SUPPLIERS =====
    if (action === 'match_buyer_to_suppliers') {
      const { buyerId } = params;

      // Get buyer details
      const { data: buyer, error: buyerError } = await supabase
        .from('b2b_buyers')
        .select('*')
        .eq('id', buyerId)
        .single();

      if (buyerError || !buyer) {
        throw new Error('Buyer not found');
      }

      // Extract requirements
      const productNeeds = buyer.product_needs?.[0] || '';
      const budgetStr = buyer.budget_range || '0';
      const maxPrice = parseFloat(budgetStr.replace(/[^0-9.]/g, '')) || 0;

      // Search suppliers
      const [amazonSuppliers, dbSuppliers] = await Promise.all([
        searchAlibabaSuppliers({ productName: productNeeds, maxPrice, country: buyer.country }),
        searchDatabaseSuppliers({ productName: productNeeds, maxPrice, maxDeliveryDays: 30 })
      ]);

      const allSuppliers = [...amazonSuppliers, ...dbSuppliers];

      if (amazonSuppliers.length > 0) {
        await storeSuppliers(amazonSuppliers);
      }

      // Calculate matches
      const requirements = { max_price: maxPrice, max_delivery_days: 30 };
      const matches = allSuppliers
        .map(supplier => ({
          ...supplier,
          match_score: calculateMatchScore(supplier, requirements),
          estimated_commission: (maxPrice - supplier.unit_price) * (buyer.order_volume ? parseInt(buyer.order_volume) : 100) * 0.1
        }))
        .sort((a, b) => b.match_score - a.match_score);

      return new Response(JSON.stringify({
        success: true,
        buyer: {
          id: buyer.id,
          company: buyer.company_name,
          product_needed: productNeeds,
          max_price: maxPrice
        },
        total_matches: matches.length,
        best_match: matches[0] || null,
        all_matches: matches.slice(0, 10),
        message: `Found ${matches.length} supplier matches for ${buyer.company_name}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid action. Use: search_suppliers, match_buyer_to_suppliers'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Global Supplier Finder Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
