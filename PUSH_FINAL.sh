#!/bin/bash

# 🚀 SCRIPT DE PUSH FINAL PARA DEPLOY NO HOSTINGER

echo "🔍 Verificando status atual..."
git status

echo ""
echo "📊 Commits locais não enviados:"
git log origin/main..HEAD --oneline

echo ""
echo "📤 Fazendo push para GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PUSH REALIZADO COM SUCESSO!"
    echo ""
    echo "🤖 GitHub Actions vai iniciar automaticamente o deploy:"
    echo "   👉 https://github.com/tafita81/global-supplements/actions"
    echo ""
    echo "⏱️  Aguarde 2-3 minutos para o deploy completar"
    echo ""
    echo "🌐 Após conclusão, acesse:"
    echo "   • Site principal: https://globalsupplements.site"
    echo "   • Loja Amazon: https://globalsupplements.site/amazon"
else
    echo ""
    echo "❌ ERRO no push. Tente manualmente:"
    echo "   git push origin main"
fi
