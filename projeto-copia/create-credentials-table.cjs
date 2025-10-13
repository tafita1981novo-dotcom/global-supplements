const https = require('https');

const sql = `
-- Criar tabela para armazenar credenciais das APIs
CREATE TABLE IF NOT EXISTS rfq_api_credentials (
  id SERIAL PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  key_value TEXT,
  description TEXT,
  is_configured BOOLEAN DEFAULT false,
  required_for_sources TEXT[],
  estimated_rfqs_unlocked INTEGER,
  setup_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE rfq_api_credentials ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Enable read access for all users" ON rfq_api_credentials;
CREATE POLICY "Enable read access for all users" ON rfq_api_credentials
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON rfq_api_credentials;
CREATE POLICY "Enable update access for all users" ON rfq_api_credentials
FOR UPDATE USING (true) WITH CHECK (true);

-- Inserir dados iniciais
INSERT INTO rfq_api_credentials (key_name, description, required_for_sources, estimated_rfqs_unlocked, setup_url) VALUES
('INDIAMART_MOBILE', 'IndiaMART Mobile (+91-XXXXXXXXXX)', ARRAY['IndiaMART'], 10000, 'https://indiamart.com'),
('INDIAMART_API_KEY', 'IndiaMART API Key', ARRAY['IndiaMART'], 10000, 'https://indiamart.com'),
('APIFY_API_KEY', 'Apify API Key (Alibaba, 1688, etc)', ARRAY['Alibaba.com', '1688.com', 'Made-in-China', 'ThomasNet'], 78000, 'https://apify.com'),
('DHGATE_API_KEY', 'DHgate Merchant API Key', ARRAY['DHgate'], 5000, 'https://dhgate.com/api'),
('KINNEK_API_KEY', 'Kinnek Procurement API', ARRAY['Kinnek'], 300, 'https://kinnek.com/api')
ON CONFLICT (key_name) DO NOTHING;
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
    console.log('Response:', body);
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Tabela rfq_api_credentials criada com sucesso!');
    } else {
      console.error('❌ Erro ao criar tabela');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
