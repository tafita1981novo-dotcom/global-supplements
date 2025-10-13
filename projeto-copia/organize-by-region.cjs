const https = require('https');

const sql = `
-- Adicionar colunas de região/país se não existirem
ALTER TABLE rfq_api_credentials 
ADD COLUMN IF NOT EXISTS countries TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS continent VARCHAR(50) DEFAULT 'Global',
ADD COLUMN IF NOT EXISTS region_priority INTEGER DEFAULT 0;

-- Limpar e reorganizar por CONTINENTE + PAÍS
DELETE FROM rfq_api_credentials;

INSERT INTO rfq_api_credentials (key_name, description, required_for_sources, estimated_rfqs_unlocked, setup_url, countries, continent, region_priority) VALUES

-- ============================================
-- 🌎 AMÉRICAS (35 APIs)
-- ============================================

-- 🇺🇸 USA (20 APIs)
('SAM_GOV_API_KEY', 'SAM.gov - Government Contracts (GRÁTIS)', ARRAY['FedBizOpps', 'GSA Advantage', 'SAM.gov'], 1800, 'https://sam.gov/data-services/get-api-key', ARRAY['USA'], 'Americas', 1),
('DLA_API_KEY', 'DLA - Defense Logistics Agency', ARRAY['DLA', 'DSCC'], 700, 'https://www.dla.mil/api', ARRAY['USA'], 'Americas', 1),
('NASA_SEWP_KEY', 'NASA SEWP - Space/Tech Procurement', ARRAY['NASA SEWP'], 100, 'https://sewp.nasa.gov/api', ARRAY['USA'], 'Americas', 1),
('VA_PROCUREMENT_KEY', 'VA - Veterans Affairs', ARRAY['VA Procurement'], 400, 'https://va.gov/oal/api', ARRAY['USA'], 'Americas', 1),
('DOE_API_KEY', 'Department of Energy', ARRAY['DoE Procurement'], 150, 'https://energy.gov/api', ARRAY['USA'], 'Americas', 1),
('DOT_API_KEY', 'Department of Transportation', ARRAY['DOT Procurement'], 250, 'https://transportation.gov/api', ARRAY['USA'], 'Americas', 1),
('STATE_PROC_KEY', 'State Procurement (50 estados)', ARRAY['State Procurement'], 2000, 'https://various-states.gov/api', ARRAY['USA'], 'Americas', 1),
('THOMASNET_API_KEY', 'ThomasNet - Industrial B2B', ARRAY['ThomasNet'], 500, 'https://business.thomasnet.com/api', ARRAY['USA'], 'Americas', 1),
('KINNEK_API_KEY', 'Kinnek - Procurement', ARRAY['Kinnek'], 300, 'https://www.kinnek.com/api/docs', ARRAY['USA'], 'Americas', 1),
('GRAINGER_API_KEY', 'Grainger - Industrial Supply', ARRAY['Grainger Business'], 500, 'https://developer.grainger.com', ARRAY['USA'], 'Americas', 1),
('MCMASTER_API_KEY', 'McMaster-Carr - Industrial Parts', ARRAY['McMaster-Carr'], 200, 'https://www.mcmaster.com/api', ARRAY['USA'], 'Americas', 1),
('MSC_API_KEY', 'MSC Industrial - MRO Supplies', ARRAY['MSC Industrial'], 300, 'https://www.mscdirect.com/api', ARRAY['USA'], 'Americas', 1),
('FASTENAL_API_KEY', 'Fastenal - Industrial Fasteners', ARRAY['Fastenal'], 250, 'https://www.fastenal.com/api', ARRAY['USA'], 'Americas', 1),
('ZORO_API_KEY', 'Zoro - Industrial & Safety', ARRAY['Zoro Business'], 250, 'https://www.zoro.com/api', ARRAY['USA'], 'Americas', 1),
('ULINE_API_KEY', 'Uline - Shipping & Industrial', ARRAY['Uline B2B'], 400, 'https://www.uline.com/api', ARRAY['USA'], 'Americas', 1),
('NAPA_API_KEY', 'NAPA Auto Parts', ARRAY['NAPA Auto'], 300, 'https://www.napaonline.com/api', ARRAY['USA'], 'Americas', 1),
('AUTOZONE_KEY', 'AutoZone - Commercial', ARRAY['AutoZone B2B'], 250, 'https://www.autozone.com/api', ARRAY['USA'], 'Americas', 1),
('WALMART_API_KEY', 'Walmart - Marketplace', ARRAY['Walmart Business'], 2000, 'https://developer.walmart.com', ARRAY['USA'], 'Americas', 1),
('AMAZON_MWS_KEY', 'Amazon MWS/SP-API', ARRAY['Amazon Business'], 4500, 'https://developer-docs.amazon.com/sp-api', ARRAY['USA', 'Global'], 'Americas', 1),

-- 🇨🇦 CANADA (2 APIs)
('ACKLANDS_KEY', 'Acklands-Grainger - Canada', ARRAY['Acklands-Grainger'], 200, 'https://www.acklandsgrainger.com/api', ARRAY['Canada'], 'Americas', 2),

-- 🇧🇷 BRASIL (3 APIs)
('MERCADOLIBRE_BR', 'Mercado Livre Brasil', ARRAY['Mercado Livre BR'], 1500, 'https://developers.mercadolivre.com.br', ARRAY['Brasil'], 'Americas', 3),
('B2BRAZIL_KEY', 'B2Brazil - Brazil B2B', ARRAY['B2Brazil'], 600, 'https://www.b2brazil.com/api', ARRAY['Brasil'], 'Americas', 3),

-- 🇲🇽 MÉXICO (2 APIs)
('MERCADOLIBRE_MX', 'Mercado Libre México', ARRAY['Mercado Libre MX'], 1000, 'https://developers.mercadolibre.com.mx', ARRAY['México'], 'Americas', 4),

-- 🇦🇷 ARGENTINA (1 API)
('MERCADOLIBRE_AR', 'Mercado Libre Argentina', ARRAY['Mercado Libre AR'], 500, 'https://developers.mercadolibre.com.ar', ARRAY['Argentina'], 'Americas', 5),

-- 🇨🇴 COLOMBIA (1 API)
('COSMOSPNC_KEY', 'CosmosPNC - Colombia/LatAm', ARRAY['CosmosPnC'], 400, 'https://www.cosmospnc.com/api', ARRAY['Colombia', 'Latam'], 'Americas', 6),

-- ============================================
-- 🌏 ÁSIA (45 APIs)
-- ============================================

-- 🇨🇳 CHINA (15 APIs)
('ALIBABA_CLOUD_API_KEY', 'Alibaba Cloud - 1688.com Oficial', ARRAY['1688.com', 'Alibaba.com'], 70000, 'https://www.alibabacloud.com/product/api-gateway', ARRAY['China'], 'Asia', 10),
('APIFY_API_KEY', 'Apify - Scraping Universal (Alibaba, 1688)', ARRAY['Alibaba.com', '1688.com', 'Made-in-China', 'Taobao'], 78000, 'https://apify.com/settings/integrations', ARRAY['China', 'Global'], 'Asia', 10),
('MADEINCHINA_API_KEY', 'Made-in-China - API Direta', ARRAY['Made-in-China', 'China Manufacturers'], 4000, 'https://api.made-in-china.com', ARRAY['China'], 'Asia', 10),
('DHGATE_API_KEY', 'DHgate - Merchant API', ARRAY['DHgate'], 5000, 'https://seller.dhgate.com/apiservice/applyapi.do', ARRAY['China'], 'Asia', 10),
('JD_COM_API_KEY', 'JD.com - China B2B', ARRAY['JD.com Wholesale'], 5000, 'https://jos.jd.com', ARRAY['China'], 'Asia', 10),
('PINDUODUO_KEY', 'Pinduoduo - China B2B', ARRAY['Pinduoduo B2B'], 8000, 'https://open.pinduoduo.com', ARRAY['China'], 'Asia', 10),
('HKTDC_API_KEY', 'HKTDC - Hong Kong Trade', ARRAY['HKTDC Sourcing'], 800, 'https://hktdc.com/sourcing/api', ARRAY['Hong Kong', 'China'], 'Asia', 10),
('ALIBABA_US_KEY', 'Alibaba USA Suppliers', ARRAY['Alibaba USA'], 1800, 'https://alibaba.com/us/api', ARRAY['China', 'USA'], 'Asia', 10),
('GLOBALSOURCES_API_KEY', 'Global Sources - China/Asia', ARRAY['Global Sources'], 1200, 'https://www.globalsources.com/API', ARRAY['China', 'Asia'], 'Asia', 10),

-- 🇮🇳 ÍNDIA (8 APIs)
('INDIAMART_API_KEY', 'IndiaMART - API Principal', ARRAY['IndiaMART'], 10000, 'https://indiamart.com/my/dashboard/api-integration', ARRAY['India'], 'Asia', 11),
('INDIAMART_MOBILE', 'IndiaMART - Mobile (+91-XX)', ARRAY['IndiaMART'], 10000, 'https://indiamart.com/my/dashboard/api-integration', ARRAY['India'], 'Asia', 11),
('TRADEINDIA_API_KEY', 'TradeIndia - India B2B', ARRAY['TradeIndia', 'ExportersIndia'], 5300, 'https://www.tradeindia.com/api-services', ARRAY['India'], 'Asia', 11),

-- 🇯🇵 JAPÃO (2 APIs)
('RAKUTEN_API_KEY', 'Rakuten - Japan Marketplace', ARRAY['Rakuten B2B'], 1200, 'https://webservice.rakuten.co.jp', ARRAY['Japan'], 'Asia', 12),

-- 🇰🇷 COREIA DO SUL (2 APIs)
('ECPLAZA_API_KEY', 'EC Plaza - Korea B2B', ARRAY['EC Plaza'], 400, 'https://www.ecplaza.net/api', ARRAY['South Korea'], 'Asia', 13),

-- 🇸🇬 SINGAPURA + SUDESTE ASIÁTICO (5 APIs)
('LAZADA_API_KEY', 'Lazada - Southeast Asia', ARRAY['Lazada B2B'], 1500, 'https://open.lazada.com', ARRAY['Singapore', 'Thailand', 'Malaysia', 'Philippines', 'Vietnam', 'Indonesia'], 'Asia', 14),
('SHOPEE_API_KEY', 'Shopee - Southeast Asia', ARRAY['Shopee Wholesale'], 1800, 'https://open.shopee.com', ARRAY['Singapore', 'Thailand', 'Malaysia', 'Philippines', 'Vietnam', 'Indonesia'], 'Asia', 14),
('TOKOPEDIA_KEY', 'Tokopedia - Indonesia', ARRAY['Tokopedia B2B'], 1000, 'https://developer.tokopedia.com', ARRAY['Indonesia'], 'Asia', 14),

-- ============================================
-- 🌍 EUROPA (15 APIs)
-- ============================================

-- 🇪🇺 UNIÃO EUROPEIA (10 APIs)
('EUROPAGES_API_KEY', 'Europages - B2B Europa', ARRAY['Europages', 'Wer liefert was'], 2800, 'https://www.europages.com/api', ARRAY['France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium'], 'Europe', 20),
('KOMPASS_API_KEY', 'Kompass - Europa (60 países)', ARRAY['Kompass Europe'], 3000, 'https://www.kompass.com/api-access', ARRAY['France', 'Germany', 'UK', 'Italy', 'Spain'], 'Europe', 20),

-- ============================================
-- 🌍 ORIENTE MÉDIO & ÁFRICA (5 APIs)
-- ============================================
('TRADEKEY_API_KEY', 'TradeKey - Global (foco Ásia/Oriente Médio)', ARRAY['TradeKey'], 1500, 'https://www.tradekey.com/buyers/api', ARRAY['UAE', 'Saudi Arabia', 'Turkey', 'Pakistan'], 'Middle East', 30),

-- ============================================
-- 🌐 GLOBAL/MULTI-REGIÃO (20 APIs)
-- ============================================
('BRIGHTDATA_API_KEY', 'BrightData - Scraping Global Enterprise', ARRAY['Amazon', 'Alibaba', 'Global Sources'], 25000, 'https://brightdata.com/cp/start', ARRAY['Global'], 'Global', 40),
('SCRAPERAPI_KEY', 'ScraperAPI - Scraping Global', ARRAY['Amazon Business', 'Grainger'], 3500, 'https://www.scraperapi.com/signup', ARRAY['Global'], 'Global', 40),
('OXYLABS_API_KEY', 'Oxylabs - Premium Scraping', ARRAY['Amazon', 'eBay'], 15000, 'https://oxylabs.io/products/scraper-api', ARRAY['Global'], 'Global', 40),
('LINKEDIN_API_KEY', 'LinkedIn Sales Navigator - B2B', ARRAY['LinkedIn B2B'], 5000, 'https://www.linkedin.com/developers', ARRAY['Global'], 'Global', 40),
('HUNTER_IO_KEY', 'Hunter.io - Email Finder', ARRAY['Email Outreach'], 0, 'https://hunter.io/api', ARRAY['Global'], 'Global', 40),
('ZOOMINFO_KEY', 'ZoomInfo - B2B Contact Database', ARRAY['ZoomInfo B2B'], 2000, 'https://www.zoominfo.com/business/api', ARRAY['Global'], 'Global', 40),
('CLEARBIT_KEY', 'Clearbit - Company Enrichment', ARRAY['Company Data'], 0, 'https://clearbit.com/docs', ARRAY['Global'], 'Global', 40),
('EBAY_API_KEY', 'eBay - Global Marketplace', ARRAY['eBay Business'], 2500, 'https://developer.ebay.com', ARRAY['Global'], 'Global', 40),
('TRIDGE_API_KEY', 'Tridge - Food/Agriculture Global', ARRAY['Tridge'], 600, 'https://www.tridge.com/api', ARRAY['Global'], 'Global', 40);
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
      console.log('✅ Credenciais organizadas por continente e país!');
    } else {
      console.log('Response:', body);
    }
  });
});

req.on('error', (error) => console.error('Error:', error));
req.write(data);
req.end();
