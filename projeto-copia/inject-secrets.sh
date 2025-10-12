#!/bin/bash

echo "🔐 Injetando secrets do Replit no .env..."

cat > .env << EOF
# Supabase (REAL - Configured)
VITE_SUPABASE_URL=https://twglceexfetejawoumsr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2xjZWV4ZmV0ZWphd291bXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjExOTAsImV4cCI6MjA3NDQ5NzE5MH0.kVKkE-dbIDi2-31-pCKBVzjjk5Hu-SV7SgmKzQVkaeY

# Amazon Real Products via RapidAPI (REAL - from Replit Secrets)
VITE_RAPIDAPI_KEY_1=${RAPIDAPI_KEY}

# AI (REAL - from Replit Secrets)
VITE_OPENAI_API_KEY=${OPENAI_API_KEY}

# Company Info (REAL)
VITE_COMPANY_NAME=Rafael Roberto Rodrigues de Oliveira Consultoria em Tecnologia da Informação CORP
VITE_COMPANY_EIN=33-3939483
VITE_COMPANY_ADDRESS=6200 Metrowest, Orlando, FL 32385, USA
VITE_TRADE_NAME=Global Supplements - Premium Worldwide Network

# Payment Processing - Stripe (REAL - from Replit Secrets)
VITE_STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}

# Email Marketing - SendGrid (REAL - from Replit Secrets)
VITE_SENDGRID_API_KEY=${SENDGRID_API_KEY}

# Gmail OAuth (REAL - from Replit Secrets) - Server-side only
GMAIL_CLIENT_ID=${GMAIL_CLIENT_ID}
GMAIL_CLIENT_SECRET=${GMAIL_CLIENT_SECRET}
GMAIL_REFRESH_TOKEN=${GMAIL_REFRESH_TOKEN}

# Payoneer (REAL - from Replit Secrets)
VITE_PAYONEER_ID=${PAYONEER_ID}
EOF

echo "✅ Secrets injetadas com sucesso!"
echo "📋 Verificando configuração:"
echo "  - RAPIDAPI_KEY: ${RAPIDAPI_KEY:0:20}..."
echo "  - OPENAI_API_KEY: ${OPENAI_API_KEY:0:20}..."
echo "  - STRIPE_PUBLIC_KEY: ${STRIPE_PUBLIC_KEY:0:20}..."
echo "  - STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:20}..."
echo "  - SENDGRID_API_KEY: ${SENDGRID_API_KEY:0:20}..."
echo "  - GMAIL_CLIENT_ID: ${GMAIL_CLIENT_ID:0:20}..."
echo "  - GMAIL_REFRESH_TOKEN: ${GMAIL_REFRESH_TOKEN:0:20}..."
echo "  - PAYONEER_ID: ${PAYONEER_ID}"
