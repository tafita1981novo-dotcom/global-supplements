const https = require('https');

const sql = `
-- Adicionar coluna de instruções detalhadas
ALTER TABLE rfq_api_credentials 
ADD COLUMN IF NOT EXISTS setup_steps TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS api_docs_url TEXT,
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER DEFAULT 5;

-- Atualizar com instruções detalhadas
UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://sam.gov/data-services',
    '2. Clique em "Request API Key" (GRÁTIS)',
    '3. Preencha formulário com seu EIN: 33-3939483',
    '4. Receberá API key por email em 5 minutos',
    '5. Cole a key aqui e clique Salvar'
  ],
  api_docs_url = 'https://open.gsa.gov/api/sam-entity-management-api/',
  estimated_time_minutes = 10
WHERE key_name = 'SAM_GOV_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://apify.com/pricing',
    '2. Crie conta FREE (US$5 grátis todo mês)',
    '3. Vá em Settings → Integrations',
    '4. Copie "Personal API token"',
    '5. Cole aqui e salve - desbloqueia 78.000 RFQs/dia!'
  ],
  api_docs_url = 'https://docs.apify.com/api/v2',
  estimated_time_minutes = 3
WHERE key_name = 'APIFY_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://indiamart.com/my/dashboard/api-integration',
    '2. Faça login como Supplier',
    '3. Vá em "API Integration" no menu',
    '4. Copie "Mobile Number" (+91-XXXXXXXXXX)',
    '5. Cole aqui para desbloquear 10.000 RFQs/dia da Índia'
  ],
  api_docs_url = 'https://developer.indiamart.com/docs',
  estimated_time_minutes = 5
WHERE key_name = 'INDIAMART_MOBILE';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://indiamart.com/my/dashboard/api-integration',
    '2. Mesma página do Mobile Number',
    '3. Copie "API Key" (string alfanumérica)',
    '4. Cole aqui e salve',
    '5. Agora você tem acesso aos 10.000 RFQs/dia!'
  ],
  api_docs_url = 'https://developer.indiamart.com/docs',
  estimated_time_minutes = 2
WHERE key_name = 'INDIAMART_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://seller.dhgate.com/apiservice/applyapi.do',
    '2. Faça login como vendedor (ou crie conta)',
    '3. Preencha formulário "Apply for API"',
    '4. Aguarde aprovação (1-2 dias úteis)',
    '5. Receberá API key por email - cole aqui'
  ],
  api_docs_url = 'https://seller.dhgate.com/apidoc/index.html',
  estimated_time_minutes = 15
WHERE key_name = 'DHGATE_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://www.alibabacloud.com/product/api-gateway',
    '2. Clique "Free Trial" (US$300 créditos grátis)',
    '3. Console → API Gateway → Apps',
    '4. Crie App → Copie AppKey',
    '5. Cole aqui - desbloqueia 70.000 RFQs/dia!'
  ],
  api_docs_url = 'https://www.alibabacloud.com/help/en/api-gateway',
  estimated_time_minutes = 10
WHERE key_name = 'ALIBABA_CLOUD_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://www.linkedin.com/developers/apps',
    '2. Clique "Create app"',
    '3. Preencha dados da empresa',
    '4. Request access to "Sales Navigator API"',
    '5. Copie Client ID e Secret - cole aqui'
  ],
  api_docs_url = 'https://docs.microsoft.com/en-us/linkedin/sales/overview',
  estimated_time_minutes = 20
WHERE key_name = 'LINKEDIN_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://www.scraperapi.com/signup',
    '2. Plano FREE: 1.000 requests/mês grátis',
    '3. Após cadastro → Dashboard',
    '4. Copie "API Key" visível no topo',
    '5. Cole aqui para scraping global'
  ],
  api_docs_url = 'https://docs.scraperapi.com',
  estimated_time_minutes = 3
WHERE key_name = 'SCRAPERAPI_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://brightdata.com/cp/start',
    '2. Plano FREE disponível',
    '3. Dashboard → Proxies → API token',
    '4. Copie Bearer token',
    '5. Cole aqui - 25.000 RFQs/dia desbloqueados!'
  ],
  api_docs_url = 'https://docs.brightdata.com/scraping-automation/web-scraper-api/overview',
  estimated_time_minutes = 5
WHERE key_name = 'BRIGHTDATA_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://developer-docs.amazon.com/sp-api',
    '2. Seller Central → Apps & Services',
    '3. "Develop Apps" → Create new app',
    '4. Obtenha LWA credentials',
    '5. Use refresh token como API key'
  ],
  api_docs_url = 'https://developer-docs.amazon.com/sp-api/docs/sp-api-registration',
  estimated_time_minutes = 30
WHERE key_name = 'AMAZON_MWS_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://business.thomasnet.com/api',
    '2. Preencha "Request API Access"',
    '3. Aguarde contato comercial (1-2 dias)',
    '4. Receberá API key após aprovação',
    '5. Cole aqui para 500 RFQs/dia USA'
  ],
  api_docs_url = 'https://business.thomasnet.com/api-documentation',
  estimated_time_minutes = 30
WHERE key_name = 'THOMASNET_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://www.tradeindia.com/api-services',
    '2. Clique "Apply for API"',
    '3. Preencha formulário comercial',
    '4. Aguarde aprovação (2-3 dias)',
    '5. Cole API key recebida por email'
  ],
  api_docs_url = 'https://www.tradeindia.com/api-documentation',
  estimated_time_minutes = 20
WHERE key_name = 'TRADEINDIA_API_KEY';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://developers.mercadolivre.com.br',
    '2. "Criar aplicação" (grátis)',
    '3. Configure callback URL',
    '4. Copie App ID e Secret Key',
    '5. Cole aqui - 1.500 RFQs/dia Brasil!'
  ],
  api_docs_url = 'https://developers.mercadolivre.com.br/pt_br/api-docs-pt-br',
  estimated_time_minutes = 10
WHERE key_name = 'MERCADOLIBRE_BR';

UPDATE rfq_api_credentials SET 
  setup_steps = ARRAY[
    '1. Acesse https://developer.grainger.com',
    '2. "Register for API access"',
    '3. Preencha dados comerciais',
    '4. Aguarde aprovação (3-5 dias)',
    '5. Receberá Client ID e Secret'
  ],
  api_docs_url = 'https://developer.grainger.com/docs',
  estimated_time_minutes = 15
WHERE key_name = 'GRAINGER_API_KEY';

-- Atualizar demais com instruções genéricas
UPDATE rfq_api_credentials 
SET setup_steps = ARRAY[
  '1. Acesse o link de documentação',
  '2. Crie conta ou faça login',
  '3. Navegue até API Settings/Integration',
  '4. Gere ou copie API Key',
  '5. Cole aqui e clique Salvar & Ativar'
],
api_docs_url = setup_url,
estimated_time_minutes = 10
WHERE setup_steps IS NULL OR array_length(setup_steps, 1) IS NULL;
`;

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = 'twglceexfetejawoumsr';

const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Instruções detalhadas adicionadas para todas as APIs!');
    } else {
      console.log('Response:', body);
    }
  });
});

req.on('error', (error) => console.error('Error:', error));
req.write(data);
req.end();
