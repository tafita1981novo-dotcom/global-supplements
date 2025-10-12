#!/bin/bash

echo "🧪 TESTING ALL EDGE FUNCTIONS"
echo "=============================="
echo ""

# Get Supabase keys
PROJECT_URL="https://twglceexfetejawoumsr.supabase.co"
ANON_KEY=$(cd projeto-copia && npx supabase@beta secrets list --project-ref twglceexfetejawoumsr 2>/dev/null | grep SUPABASE_ANON_KEY | awk '{print $NF}')

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔑 Using Project: $PROJECT_URL"
echo ""

# Test 1: Autonomous Negotiator
echo "=========================================="
echo "TEST 1: Autonomous Negotiator (GPT-4)"
echo "=========================================="
echo ""

# First, create a test negotiation
echo "📝 Creating test negotiation..."
NEGOTIATION_RESPONSE=$(curl -s -X POST "$PROJECT_URL/rest/v1/negotiations" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "buyer_company": "Test Corp USA",
    "contact_email": "buyer@testcorp.com",
    "negotiation_stage": "initial_contact",
    "status": "sent"
  }')

NEGOTIATION_ID=$(echo $NEGOTIATION_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NEGOTIATION_ID" ]; then
    echo -e "${RED}❌ Failed to create test negotiation${NC}"
else
    echo -e "${GREEN}✅ Test negotiation created: $NEGOTIATION_ID${NC}"
    echo ""
    
    echo "🤖 Testing autonomous-negotiator..."
    RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/autonomous-negotiator" \
      -H "Authorization: Bearer $ANON_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"negotiation_id\": \"$NEGOTIATION_ID\"}")
    
    if echo "$RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Error: $RESPONSE${NC}"
    else
        echo -e "${GREEN}✅ Response:${NC}"
        echo "$RESPONSE" | head -c 200
        echo "..."
    fi
fi

echo ""
echo ""

# Test 2: Supplier Matcher
echo "=========================================="
echo "TEST 2: Supplier Matcher"
echo "=========================================="
echo ""

echo "🎯 Testing supplier-matcher..."
RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/supplier-matcher" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_email": "test@example.com",
    "buyer_company": "Test Corp",
    "buyer_country": "USA",
    "product": "Whey Protein",
    "quantity": 1000,
    "max_price": 25.00,
    "max_delivery_days": 7
  }')

if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Error: $RESPONSE${NC}"
else
    echo -e "${GREEN}✅ Response:${NC}"
    echo "$RESPONSE" | head -c 200
    echo "..."
fi

echo ""
echo ""

# Test 3: B2B Buyer Detector
echo "=========================================="
echo "TEST 3: B2B Buyer Detector"
echo "=========================================="
echo ""

echo "🔍 Testing b2b-buyer-detector..."
RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/b2b-buyer-detector" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "LinkedIn",
    "search_query": "health supplements buyer"
  }')

if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Error: $RESPONSE${NC}"
else
    echo -e "${GREEN}✅ Response:${NC}"
    echo "$RESPONSE" | head -c 200
    echo "..."
fi

echo ""
echo ""

# Test 4: Email Automation
echo "=========================================="
echo "TEST 4: Email Automation"
echo "=========================================="
echo ""

echo "📧 Testing email-automation..."
RESPONSE=$(curl -s -X POST "$PROJECT_URL/functions/v1/email-automation" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from Global Supplements"
  }')

if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Error: $RESPONSE${NC}"
else
    echo -e "${GREEN}✅ Response:${NC}"
    echo "$RESPONSE" | head -c 200
    echo "..."
fi

echo ""
echo ""
echo "=========================================="
echo "🎉 TESTING COMPLETE!"
echo "=========================================="
echo ""
echo "📊 Check full logs at:"
echo "https://supabase.com/dashboard/project/twglceexfetejawoumsr/logs/edge-functions"
