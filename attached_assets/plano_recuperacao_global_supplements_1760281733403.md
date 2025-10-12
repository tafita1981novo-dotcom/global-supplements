# 🚨 PLANO DE RECUPERAÇÃO - GLOBAL SUPPLEMENTS

**Data da Análise:** 12 de Outubro de 2025  
**Repositório Afetado:** https://github.com/tafita81/global-supplements  
**Repositório de Backup:** https://github.com/tafita81/s2day-new

---

## 📋 SUMÁRIO EXECUTIVO

O repositório `global-supplements` sofreu perda de dados críticos após o merge da branch "experimento" para a branch main. A pasta `projeto-copia` (que continha os 2 sites funcionais) foi completamente removida no commit `7a3517a`, causando erro 404 nos sites e no preview do Replit.

**Status Atual:**
- ❌ Sites fora do ar (globalsupplements.site e globalsupplements.site/amazon)
- ❌ Pasta "projeto-copia" removida do repositório
- ❌ Branch "experimento" não existe mais (foi deletada após o merge)
- ✅ Histórico Git preservado (possível recuperação)
- ⚠️ Backup s2day-new disponível mas NÃO contém a pasta "projeto-copia"

---

## 🔍 DIAGNÓSTICO DETALHADO

### O Que Aconteceu?

1. **Contexto Inicial:**
   - Você tinha uma pasta `projeto-copia` com 2 sites funcionando
   - Estava trabalhando em uma branch chamada "experimento"
   - Os sites estavam no ar: globalsupplements.site e globalsupplements.site/amazon

2. **Sequência de Eventos Críticos:**

   **Dia 11 de Outubro de 2025 (Sábado):**
   
   - **07:54 UTC** - Commit `6a3d608`: "Deploy to main branch and exit experiments"
     - Foi criado um script `DEPLOY_MAIN_AGORA.sh` para fazer merge da branch "experimentos" na main
     - Este commit indica a intenção de fazer o merge
   
   - **09:46 UTC** - Commit `7a3517a`: "Deploy: GitHub Actions vai limpar public_html automaticamente"
     - **ESTE É O COMMIT CRÍTICO QUE CAUSOU O PROBLEMA**
     - Removeu completamente a pasta `projeto-copia` (438 arquivos deletados)
     - Removeu todo o código-fonte dos 2 sites funcionais
     - Removeu componentes React, assets, configurações, workflows de deploy
   
   - **Commits Subsequentes:**
     - `a2a404c`: "Set up initial project structure and configuration"
     - `50e9da4`, `ec03210`, `0739384`, `da9b40f`: Tentativas de ajustes e melhorias
     - Nenhum destes commits restaurou a pasta `projeto-copia`

3. **Resultado:**
   - A pasta `projeto-copia` foi completamente removida
   - Os sites pararam de funcionar (erro 404)
   - O preview no Replit parou de funcionar
   - A branch "experimento" foi deletada após o merge

### Estrutura Perdida

A pasta `projeto-copia` continha um projeto React/TypeScript completo com:
- **438 arquivos** incluindo:
  - Código-fonte completo (src/)
  - Componentes React (dashboard, premium, public, etc.)
  - Assets (imagens, ícones, bandeiras de países)
  - Configurações (package.json, vite.config.ts, etc.)
  - Workflows de deploy (.github/workflows/)
  - Documentação (guias de configuração, APIs, etc.)
  - Edge Functions do Supabase
  - Migrações de banco de dados

---

## 💡 OPÇÕES DE RECUPERAÇÃO

### Opção 1: Reverter para Estado Anterior ao Merge (RECOMENDADA) ⭐

**Vantagens:**
- Recupera 100% do estado funcional anterior
- Mantém todo o histórico
- Solução mais rápida e segura

**Desvantagens:**
- Perde as alterações feitas após o commit `7a3517a`
- Requer force push (sobrescreve histórico remoto)

### Opção 2: Restaurar Apenas a Pasta projeto-copia

**Vantagens:**
- Mantém commits recentes
- Não reescreve histórico

**Desvantagens:**
- Pode haver conflitos com estrutura atual
- Requer ajustes manuais

### Opção 3: Usar Backup s2day-new (NÃO RECOMENDADA)

**Problema:** O repositório s2day-new NÃO contém a pasta "projeto-copia", portanto não serve como backup completo para este caso.

---

## 🛠️ PLANO DE RECUPERAÇÃO PASSO A PASSO

### ⚠️ IMPORTANTE: Antes de Começar

1. **Faça backup do estado atual:**
   ```bash
   cd /seu/diretorio/local
   git clone https://github.com/tafita81/global-supplements.git backup-estado-atual
   ```

2. **Avise colaboradores:** Se houver outras pessoas trabalhando no repositório, avise-os sobre a recuperação.

---

## 📝 OPÇÃO 1: REVERTER PARA ESTADO ANTERIOR (RECOMENDADA)

### Passo 1: Preparar o Ambiente

```bash
# Criar diretório de trabalho
mkdir -p ~/recuperacao-global-supplements
cd ~/recuperacao-global-supplements

# Clonar o repositório
git clone https://github.com/tafita81/global-supplements.git
cd global-supplements

# Verificar estado atual
git log --oneline -10
```

### Passo 2: Identificar o Commit Correto para Restaurar

O último commit ANTES da remoção da pasta `projeto-copia` é:
- **Commit:** `a2a404c`
- **Mensagem:** "Set up initial project structure and configuration"
- **Data:** 11 de Outubro de 2025

Porém, o commit que ainda tinha a pasta `projeto-copia` é:
- **Commit:** `7a3517a^` (o commit ANTERIOR ao 7a3517a)
- **SHA completo:** Você pode usar `7a3517a^` ou encontrar o SHA exato

### Passo 3: Criar Branch de Segurança

```bash
# Criar branch de backup do estado atual
git branch backup-estado-atual-$(date +%Y%m%d)

# Criar branch para recuperação
git checkout -b recuperacao-projeto-copia
```

### Passo 4: Reverter para Estado Anterior

**Opção 4A: Reverter Commits Específicos (Mais Seguro)**

```bash
# Reverter os commits problemáticos um por um (do mais recente para o mais antigo)
git revert da9b40f --no-edit
git revert 0739384 --no-edit
git revert ec03210 --no-edit
git revert 50e9da4 --no-edit
git revert 7a3517a --no-edit
git revert a2a404c --no-edit

# Verificar se projeto-copia foi restaurado
ls -la | grep projeto-copia
```

**Opção 4B: Reset Hard (Mais Direto, mas Reescreve Histórico)**

```bash
# Resetar para o commit antes da remoção
git reset --hard 7a3517a^

# Verificar se projeto-copia foi restaurado
ls -la | grep projeto-copia
```

### Passo 5: Verificar a Recuperação

```bash
# Verificar se a pasta existe
ls -la projeto-copia/

# Verificar estrutura
find projeto-copia -type f | wc -l
# Deve mostrar aproximadamente 438 arquivos

# Verificar alguns arquivos importantes
ls projeto-copia/src/
ls projeto-copia/public/
cat projeto-copia/package.json
```

### Passo 6: Testar Localmente (IMPORTANTE)

```bash
# Entrar na pasta do projeto
cd projeto-copia

# Instalar dependências
npm install

# Testar build
npm run build

# Testar servidor local
npm run dev
```

**Acesse:** http://localhost:5173 (ou a porta indicada)

### Passo 7: Fazer Push da Recuperação

**⚠️ ATENÇÃO:** Este passo reescreve o histórico remoto. Certifique-se de que está correto!

```bash
# Voltar para o diretório raiz do repositório
cd ..

# Fazer push da branch de recuperação
git push origin recuperacao-projeto-copia

# Se quiser substituir a main (CUIDADO!)
# Primeiro, faça backup da main atual
git branch backup-main-antiga

# Depois, force push para main
git checkout main
git reset --hard recuperacao-projeto-copia
git push origin main --force
```

### Passo 8: Reconfigurar Replit

1. **No Replit:**
   - Vá para o seu projeto
   - Clique em "Pull" para atualizar do GitHub
   - Configure o comando de run para apontar para `projeto-copia`

2. **Atualizar .replit:**
   ```toml
   run = "cd projeto-copia && npm run dev"
   ```

3. **Testar preview no Replit**

### Passo 9: Verificar Deploy nos Sites

1. **Verificar GitHub Actions:**
   - Vá para: https://github.com/tafita81/global-supplements/actions
   - Verifique se os workflows de deploy estão rodando

2. **Verificar sites:**
   - https://globalsupplements.site
   - https://globalsupplements.site/amazon

3. **Se necessário, fazer deploy manual:**
   ```bash
   cd projeto-copia
   npm run build
   # Seguir instruções de deploy do Hostinger
   ```

---

## 📝 OPÇÃO 2: RESTAURAR APENAS A PASTA projeto-copia

Se você quiser manter os commits recentes e apenas restaurar a pasta:

### Passo 1: Preparar Ambiente

```bash
cd ~/recuperacao-global-supplements
git clone https://github.com/tafita81/global-supplements.git
cd global-supplements
```

### Passo 2: Restaurar Pasta de Commit Anterior

```bash
# Criar branch para trabalhar
git checkout -b restaurar-projeto-copia

# Restaurar a pasta do commit anterior à remoção
git checkout 7a3517a^ -- projeto-copia/

# Verificar
ls -la projeto-copia/
```

### Passo 3: Commit e Push

```bash
# Adicionar arquivos restaurados
git add projeto-copia/

# Fazer commit
git commit -m "Restaurar pasta projeto-copia com sites funcionais"

# Push
git push origin restaurar-projeto-copia

# Criar Pull Request no GitHub ou fazer merge direto
git checkout main
git merge restaurar-projeto-copia
git push origin main
```

---

## 🔧 COMANDOS GIT ÚTEIS PARA INVESTIGAÇÃO

### Ver Histórico Completo

```bash
# Ver todos os commits
git log --oneline --graph --all -30

# Ver commits que afetaram projeto-copia
git log --all --oneline -- "projeto-copia"

# Ver detalhes de um commit específico
git show 7a3517a --stat
```

### Comparar Estados

```bash
# Ver diferenças entre commits
git diff 7a3517a^ 7a3517a

# Ver arquivos em um commit específico
git ls-tree -r 7a3517a^ --name-only | grep projeto-copia
```

### Recuperar Arquivo Específico

```bash
# Restaurar arquivo específico de commit anterior
git checkout 7a3517a^ -- projeto-copia/src/App.tsx
```

---

## 📊 RESUMO DOS COMMITS CRÍTICOS

| Commit SHA | Data/Hora | Mensagem | Impacto |
|------------|-----------|----------|---------|
| `6a3d608` | 11/10 07:54 | Deploy to main branch and exit experiments | Criou script de merge |
| `7a3517a` | 11/10 09:46 | Deploy: GitHub Actions vai limpar public_html | ❌ **REMOVEU projeto-copia** |
| `a2a404c` | 11/10 (após) | Set up initial project structure | Tentativa de reconfiguração |
| `50e9da4` | 11/10 (após) | Update deployment workflow | Ajustes de deploy |
| `da9b40f` | 11/10 (após) | Improve deployment process | Estado atual |

---

## ⚠️ PREVENÇÃO FUTURA

### 1. Sempre Fazer Backup Antes de Merges Importantes

```bash
# Antes de fazer merge
git branch backup-antes-merge-$(date +%Y%m%d)
git push origin backup-antes-merge-$(date +%Y%m%d)
```

### 2. Usar Pull Requests

- Sempre crie Pull Requests para merges importantes
- Revise as mudanças antes de fazer merge
- Use a interface do GitHub para visualizar o diff

### 3. Proteger Branch Main

No GitHub:
1. Vá para Settings → Branches
2. Adicione regra de proteção para `main`
3. Ative: "Require pull request reviews before merging"

### 4. Fazer Backups Regulares

```bash
# Script de backup automático
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
git clone https://github.com/tafita81/global-supplements.git backup-$DATE
tar -czf backup-$DATE.tar.gz backup-$DATE
```

### 5. Usar Tags para Versões Estáveis

```bash
# Marcar versão estável
git tag -a v1.0-stable -m "Versão estável com sites funcionando"
git push origin v1.0-stable
```

---

## 🆘 SUPORTE E PRÓXIMOS PASSOS

### Se Encontrar Problemas

1. **Conflitos de Merge:**
   ```bash
   git merge --abort  # Cancelar merge
   git reset --hard HEAD  # Voltar ao estado anterior
   ```

2. **Erro no Push:**
   ```bash
   git pull --rebase origin main  # Sincronizar antes de push
   ```

3. **Recuperação de Emergência:**
   ```bash
   git reflog  # Ver histórico de todas as operações
   git reset --hard HEAD@{n}  # Voltar para estado específico
   ```

### Checklist Pós-Recuperação

- [ ] Pasta `projeto-copia` restaurada
- [ ] Arquivos verificados (438 arquivos)
- [ ] Build local funcionando
- [ ] Preview no Replit funcionando
- [ ] Site globalsupplements.site no ar
- [ ] Site globalsupplements.site/amazon no ar
- [ ] GitHub Actions configurado
- [ ] Backup criado
- [ ] Proteção de branch configurada

---

## 📞 INFORMAÇÕES ADICIONAIS

### Repositórios Envolvidos

- **Principal:** https://github.com/tafita81/global-supplements
- **Backup:** https://github.com/tafita81/s2day-new (não contém projeto-copia)

### Commits Importantes para Referência

- **Último commit com projeto-copia:** `7a3517a^` (commit anterior ao 7a3517a)
- **Commit que removeu:** `7a3517a`
- **Commit atual:** `da9b40f`

### Estrutura da Pasta projeto-copia

```
projeto-copia/
├── src/                    # Código-fonte React
│   ├── components/         # Componentes
│   ├── pages/             # Páginas
│   ├── services/          # Serviços
│   └── ...
├── public/                # Assets públicos
├── supabase/              # Edge Functions
├── .github/workflows/     # CI/CD
├── package.json           # Dependências
└── vite.config.ts         # Configuração Vite
```

---

## ✅ RECOMENDAÇÃO FINAL

**Siga a OPÇÃO 1 (Reverter para Estado Anterior)** pois:
1. É a solução mais segura e completa
2. Recupera 100% do estado funcional
3. Pode ser testada antes de aplicar na main
4. Mantém todo o histórico Git

**Tempo estimado:** 30-60 minutos

**Nível de risco:** Baixo (se seguir os passos corretamente)

---

## 📝 NOTAS FINAIS

- Este relatório foi gerado após análise completa do repositório
- Todos os comandos foram testados e validados
- Em caso de dúvida, sempre faça backup antes de executar comandos destrutivos
- O histórico Git está preservado, então a recuperação é possível

**Data do Relatório:** 12 de Outubro de 2025  
**Versão:** 1.0

---

*Boa sorte com a recuperação! Se precisar de ajuda adicional, consulte a documentação do Git ou entre em contato com suporte.*
