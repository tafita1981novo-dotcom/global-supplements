#!/bin/bash

echo "📦 ADICIONANDO PACKAGE-LOCK.JSON"
echo ""

git add projeto-copia/package-lock.json

git commit -m "Add package-lock.json for Replit Deploy npm ci"

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PUSH REALIZADO COM SUCESSO!"
    echo ""
    echo "🚀 Agora pode deployar no Replit:"
    echo "   1. Clique em 'Deploy' (🚀)"
    echo "   2. npm ci vai encontrar o lockfile"
    echo "   3. Build vai completar sem erros"
    echo "   4. Site publicado! 🎉"
else
    echo ""
    echo "❌ Erro no push ou nada para commitar"
    echo "   O package-lock.json pode já estar no GitHub"
    echo "   Tente deployar mesmo assim!"
fi
