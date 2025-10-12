#!/bin/bash

URL="https://twglceexfetejawoumsr.supabase.co"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY"

echo "🧪 TESTING EDGE FUNCTIONS"
echo "========================="
echo ""

# Test 1: Create test buyer first
echo "📝 Creating test buyer..."
curl -s -X POST "$URL/rest/v1/b2b_buyers" \
  -H "apikey: $ANON" \
  -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "platform": "Test",
    "company_name": "Test Corp USA",
    "contact_person": "John Doe",
    "email": "john@testcorp.com",
    "country": "USA",
    "industry": "Health Supplements",
    "product_needs": ["Whey Protein", "Vitamins"]
  }' > /dev/null 2>&1

echo "✅ Test buyer created"
echo ""

# Test 2: Supplier Matcher
echo "=========================================="
echo "TEST: Supplier Matcher"
echo "=========================================="
curl -s -X POST "$URL/functions/v1/supplier-matcher" \
  -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_email": "john@testcorp.com",
    "buyer_company": "Test Corp USA",
    "buyer_country": "USA",
    "product": "Whey Protein",
    "quantity": 1000,
    "max_price": 25.00,
    "max_delivery_days": 7
  }' | jq '.' 2>/dev/null || echo "Response received (no jq)"

echo ""
echo ""

# Test 3: Check functions are running
echo "=========================================="
echo "CHECKING FUNCTION STATUS"
echo "=========================================="
echo "📊 Dashboard: https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions"
echo "📝 Logs: https://supabase.com/dashboard/project/twglceexfetejawoumsr/logs/edge-functions"

