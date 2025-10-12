#!/bin/bash

echo "🔧 CORREÇÃO FINAL DO REPLIT DEPLOY"
echo ""
echo "Mudança aplicada: npm ci → npm install"
echo ""

git add .replit
git commit -m "Fix Replit Deploy: Use npm install instead of npm ci"
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PUSH REALIZADO COM SUCESSO!"
    echo ""
    echo "🚀 AGORA PODE DEPLOYAR NO REPLIT:"
    echo "   1. Clique em 'Deploy' (🚀)"
    echo "   2. npm install vai gerar/usar package-lock.json"
    echo "   3. Build vai completar sem erros"
    echo "   4. Site publicado! 🎉"
else
    echo ""
    echo "❌ Erro no push"
fi
