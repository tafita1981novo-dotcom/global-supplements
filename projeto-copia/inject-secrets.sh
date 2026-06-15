#!/bin/bash

echo "🔐 Injetando secrets do Replit no .env..."

cat > .env << ENVEOF
# Supabase
VITE_SUPABASE_URL=https://twglceexfetejawoumsr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY

# Amazon RapidAPI (suporta até 3 chaves para rotação automática)
VITE_RAPIDAPI_KEY_1=${RAPIDAPI_KEY}
VITE_RAPIDAPI_KEY_2=${RAPIDAPI_KEY_2:-}
VITE_RAPIDAPI_KEY_3=${RAPIDAPI_KEY_3:-}

# OpenAI
VITE_OPENAI_API_KEY=${OPENAI_API_KEY}

# Empresa
VITE_COMPANY_NAME=Rafael Roberto Rodrigues de Oliveira Consultoria em Tecnologia da Informação CORP
VITE_COMPANY_EIN=33-3939483
VITE_COMPANY_ADDRESS=6200 Metrowest, Orlando, FL 32385, USA
VITE_TRADE_NAME=Global Supplements - Premium Worldwide Network

# Stripe (LIVE — cuidado, cobra dinheiro real!)
VITE_STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}

# SendGrid
VITE_SENDGRID_API_KEY=${SENDGRID_API_KEY}

# Gmail OAuth
GMAIL_CLIENT_ID=${GMAIL_CLIENT_ID}
GMAIL_CLIENT_SECRET=${GMAIL_CLIENT_SECRET}
GMAIL_REFRESH_TOKEN=${GMAIL_REFRESH_TOKEN}

# Payoneer
VITE_PAYONEER_ID=${PAYONEER_ID}
ENVEOF

echo "✅ Secrets injetadas com sucesso!"
echo ""
echo "📋 Verificando configuração:"
echo "  - RAPIDAPI_KEY_1:   ${RAPIDAPI_KEY:0:20}..."
echo "  - RAPIDAPI_KEY_2:   ${RAPIDAPI_KEY_2:0:10}${RAPIDAPI_KEY_2:+...}${RAPIDAPI_KEY_2:-[não configurada]}"
echo "  - OPENAI_API_KEY:   ${OPENAI_API_KEY:0:20}..."
echo "  - STRIPE_PUBLIC:    ${STRIPE_PUBLIC_KEY:0:20}..."
echo "  - STRIPE_SECRET:    ${STRIPE_SECRET_KEY:0:20}..."
echo "  - SENDGRID_API_KEY: ${SENDGRID_API_KEY:0:20}..."
echo "  - GMAIL_CLIENT_ID:  ${GMAIL_CLIENT_ID:0:20}..."
echo "  - PAYONEER_ID:      ${PAYONEER_ID}"
