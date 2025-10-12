#!/bin/bash

echo "🚀 Deploying migrations to Supabase..."

# Supabase project details
PROJECT_URL="https://twglceexfetejawoumsr.supabase.co"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-your-service-role-key}"

echo "📊 Executing SQL migrations via Supabase REST API..."

# Read SQL file
SQL_CONTENT=$(cat DEPLOY_COMPLETE.sql)

# Execute via Supabase REST API
curl -X POST "$PROJECT_URL/rest/v1/rpc/exec" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}"

echo ""
echo "✅ Migration deployment attempted!"
echo "📋 Check Supabase Dashboard to verify: $PROJECT_URL"
