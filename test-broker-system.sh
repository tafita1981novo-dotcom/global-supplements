#!/bin/bash

URL="https://twglceexfetejawoumsr.supabase.co"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY"

echo "🧪 TESTING AI BROKER SYSTEM"
echo "============================"
echo ""

# Test 1: Check database tables
echo "1️⃣ Checking database tables..."
echo "----------------------------"
TABLES=$(curl -s "$URL/rest/v1/" \
  -H "apikey: $ANON" \
  -H "Authorization: Bearer $ANON" | grep -o '"table_name":"[^"]*"' | cut -d'"' -f4 | head -5)
echo "✅ Tables found: $TABLES"
echo ""

# Test 2: Get language context (test SQL function)
echo "2️⃣ Testing get_language_context() SQL function..."
echo "------------------------------------------------"
LANG_RESPONSE=$(curl -s -X POST "$URL/rest/v1/rpc/get_language_context" \
  -H "apikey: $ANON" \
  -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" \
  -d '{"p_country": "Brazil", "p_email": "test@example.com.br"}')
echo "Response: $LANG_RESPONSE"
echo ""

# Test 3: Check dropship partners
echo "3️⃣ Checking dropship partners..."
echo "-------------------------------"
PARTNERS=$(curl -s "$URL/rest/v1/dropship_partners?select=partner_name,country&limit=3" \
  -H "apikey: $ANON" \
  -H "Authorization: Bearer $ANON")
echo "Partners: $PARTNERS"
echo ""

# Test 4: Test supplier-matcher Edge Function
echo "4️⃣ Testing supplier-matcher Edge Function..."
echo "------------------------------------------"
MATCH_RESPONSE=$(curl -s -X POST "$URL/functions/v1/supplier-matcher" \
  -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_email": "buyer@testcorp.com",
    "buyer_company": "Test Health Corp",
    "buyer_country": "USA",
    "product": "Whey Protein Isolate",
    "quantity": 5000,
    "max_price": 22.00,
    "max_delivery_days": 5,
    "preferred_shipping": "air",
    "required_certifications": ["FDA", "GMP"]
  }')
echo "Response: ${MATCH_RESPONSE:0:200}..."
echo ""

echo "=========================================="
echo "✅ SYSTEM TESTS COMPLETE!"
echo "=========================================="
echo ""
echo "📊 View full dashboard at:"
echo "https://supabase.com/dashboard/project/twglceexfetejawoumsr"
echo ""
echo "📝 View Edge Function logs:"
echo "https://supabase.com/dashboard/project/twglceexfetejawoumsr/logs/edge-functions"

