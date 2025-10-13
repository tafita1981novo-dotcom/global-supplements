const https = require('https');
const fs = require('fs');

const sql = fs.readFileSync('supabase/migrations/activate_100_sources_payoneer.sql', 'utf8');
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
      console.log('✅ Migration executada com sucesso!');
    } else {
      console.error('❌ Erro ao executar migration');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
