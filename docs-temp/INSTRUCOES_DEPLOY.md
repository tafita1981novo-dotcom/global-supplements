# 🚀 Instruções para Deploy no Hostinger via GitHub

## ✅ Status Atual

**15 commits locais** prontos para enviar ao GitHub:
- ✅ Recuperação do projeto-copia (436 arquivos)
- ✅ Correção de segurança (OpenAI API removido do frontend)
- ✅ Build testado e funcionando
- ✅ Ambos os sites operacionais (/ e /amazon)

## 📤 Como Fazer Push para GitHub

### Opção 1: Usando Git Pane do Replit (RECOMENDADO)

1. **Abra o painel Git** no Replit (ícone de ramificação no menu lateral esquerdo)
2. **Verifique os commits** que serão enviados
3. **Clique em "Push"** para enviar para o GitHub
4. **Aguarde confirmação** de sucesso

### Opção 2: Via Terminal do Replit

```bash
# No terminal do Replit, execute:
git push origin main
```

Se pedir autenticação, use seu **Personal Access Token** do GitHub.

## 🤖 Deploy Automático no Hostinger

Após o push ser bem-sucedido:

1. **GitHub Actions será acionado automaticamente**
   - Workflow: `.github/workflows/deploy-hostinger.yml` ✅ (CORRIGIDO)
   - Branch: `main`
   - **Deploy agendado**: 16x por dia (a cada 1.5h)

2. **Processo de Deploy:**
   ```
   ✅ Checkout do código
   ✅ Configurar Node.js 18
   ✅ Instalar dependências (npm ci em projeto-copia/)
   ✅ Build do projeto (npm run build em projeto-copia/)
   ✅ Deploy via FTP (projeto-copia/dist/ → /public_html/)
   ```

3. **Detalhes do Deploy:**
   - **Servidor FTP:** 82.29.199.81
   - **Usuário:** u930134944
   - **Porta:** 21
   - **Diretório:** /public_html/
   - **Origem:** ./dist/

4. **Verificar Deploy:**
   - Vá para: https://github.com/tafita81/global-supplements/actions
   - Veja o workflow "Deploy para Hostinger" em execução
   - Aguarde conclusão (geralmente 2-3 minutos)

## 🔐 Secret Necessário

O workflow usa o secret **`FTP_PASSWORD`** do GitHub.

**Para verificar se está configurado:**
1. Vá para: https://github.com/tafita81/global-supplements/settings/secrets/actions
2. Confirme que `FTP_PASSWORD` existe
3. Se não existir, adicione com a senha FTP do Hostinger

## ✅ Verificação Final

Após deploy completar:

1. **Acesse o domínio:** https://globalsupplements.site
2. **Verifique a página principal:** /
3. **Verifique a loja Amazon:** /amazon
4. **Teste funcionalidades:**
   - Carregamento de produtos
   - Navegação entre páginas
   - Links de afiliados funcionando

## ⚠️ Aviso de Segurança

**FTP não criptografado em uso:**
- O workflow atual usa FTP claro (porta 21)
- Credenciais estão protegidas via GitHub Secrets
- Recomendado: Verificar se Hostinger suporta FTPS/SFTP e migrar quando possível

## 🐛 Troubleshooting

**Se o push falhar:**
- Verifique autenticação do GitHub no Replit
- Use Personal Access Token se necessário

**Se o deploy falhar:**
- Verifique logs do GitHub Actions
- Confirme que FTP_PASSWORD está correto
- Verifique conexão FTP com Hostinger

**Se o site não atualizar:**
- Limpe cache do navegador (Ctrl+Shift+R)
- Aguarde alguns minutos (propagação DNS)
- Verifique se arquivos foram enviados via FTP

---

## 📋 Checklist Final

- [ ] Push para GitHub realizado
- [ ] GitHub Actions executado com sucesso
- [ ] Site principal (/) funcionando
- [ ] Loja Amazon (/amazon) funcionando
- [ ] Produtos carregando corretamente
- [ ] Links de afiliados funcionando
