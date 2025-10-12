#!/bin/bash

echo "🚀 DEPLOYING AI BROKER EDGE FUNCTIONS..."
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Change to project directory
cd projeto-copia

# Check if logged in (this will show auth status)
echo "📋 Checking Supabase authentication..."
supabase projects list 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo "Please run: supabase login"
    echo "Then link your project: supabase link --project-ref twglceexfetejawoumsr"
    exit 1
fi

echo ""
echo "🔗 Linking to Supabase project..."
supabase link --project-ref twglceexfetejawoumsr 2>/dev/null || true

echo ""
echo "📦 Deploying Edge Functions..."
echo "--------------------------------"

# Deploy each function
FUNCTIONS=(
    "autonomous-negotiator"
    "supplier-matcher"
    "b2b-buyer-detector"
    "email-automation"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for func in "${FUNCTIONS[@]}"; do
    echo ""
    echo -e "${YELLOW}Deploying: $func${NC}"
    
    if npx supabase@beta functions deploy $func --no-verify-jwt --project-ref twglceexfetejawoumsr; then
        echo -e "${GREEN}✅ $func deployed successfully${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ Failed to deploy $func${NC}"
        ((FAIL_COUNT++))
    fi
done

echo ""
echo "=========================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "=========================================="
echo -e "${GREEN}✅ Successful: $SUCCESS_COUNT${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAIL_COUNT${NC}"
fi
echo ""

if [ $SUCCESS_COUNT -eq ${#FUNCTIONS[@]} ]; then
    echo -e "${GREEN}🎉 ALL FUNCTIONS DEPLOYED SUCCESSFULLY!${NC}"
    echo ""
    echo "🔍 View your functions at:"
    echo "https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions"
    echo ""
    echo "🧪 Test functions with:"
    echo "curl -X POST 'https://twglceexfetejawoumsr.supabase.co/functions/v1/autonomous-negotiator' \\"
    echo "  -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"negotiation_id\": \"test-uuid\"}'"
else
    echo -e "${YELLOW}⚠️  Some deployments failed. Check errors above.${NC}"
fi

echo ""
