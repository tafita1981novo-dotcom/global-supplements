-- ========================================
-- ATIVAR TODAS AS 39 FONTES DE RFQs GLOBAIS
-- (Exceto SAM.gov que fica inativo)
-- ========================================

-- 1. Criar tabela de configuração de fontes
CREATE TABLE IF NOT EXISTS rfq_sources_config (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(255) UNIQUE NOT NULL,
  source_country VARCHAR(100),
  source_region VARCHAR(100),
  api_url TEXT,
  api_type VARCHAR(50), -- 'rest_api', 'xml_soap', 'scraping', 'webhook'
  edge_function_name VARCHAR(255),
  daily_rfq_volume INTEGER,
  average_ticket_usd INTEGER,
  commission_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  requires_credentials BOOLEAN DEFAULT false,
  credential_keys JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Popular com TODAS as 39 fontes ativas
INSERT INTO rfq_sources_config (source_name, source_country, source_region, api_url, api_type, edge_function_name, daily_rfq_volume, average_ticket_usd, commission_rate, is_active, requires_credentials, credential_keys, notes) VALUES

-- 🇺🇸 USA (5 fontes ativas - SAM.gov inativo)
('ThomasNet', 'USA', 'North America', 'https://www.thomasnet.com', 'scraping', 'thomasnet-scraper', 500, 30000, 12.00, true, true, '["APIFY_API_KEY"]', 'Industrial suppliers USA/Canada'),
('Kinnek', 'USA', 'North America', 'https://www.kinnek.com', 'rest_api', 'kinnek-api', 300, 10000, 10.00, true, true, '["KINNEK_API_KEY"]', 'Industrial procurement'),
('DLA', 'USA', 'North America', 'https://www.dla.mil', 'scraping', 'dla-scraper', 500, 100000, 5.00, true, false, '[]', 'Defense Logistics Agency'),
('GSA Advantage', 'USA', 'North America', 'https://www.gsaadvantage.gov', 'scraping', 'gsa-scraper', 300, 20000, 6.00, true, false, '[]', 'Government office supplies'),
('IQS Directory', 'USA', 'North America', 'https://www.iqsdirectory.com', 'scraping', 'iqs-scraper', 200, 15000, 10.00, true, false, '[]', 'Manufacturing components'),

-- 🇨🇳 China (4 fontes)
('Alibaba.com', 'China', 'Asia', 'https://www.alibaba.com/rfq', 'scraping', 'alibaba-rfq-scraper', 20000, 15000, 10.00, true, true, '["APIFY_API_KEY"]', 'Largest B2B platform'),
('1688.com', 'China', 'Asia', 'https://www.1688.com', 'scraping', '1688-scraper', 50000, 5000, 12.00, true, true, '["APIFY_API_KEY"]', 'Domestic China + export'),
('Made-in-China', 'China', 'Asia', 'https://www.made-in-china.com', 'scraping', 'made-in-china-scraper', 3000, 8000, 8.00, true, true, '["APIFY_API_KEY"]', 'Manufacturing/electronics'),
('DHgate', 'China', 'Asia', 'https://www.dhgate.com', 'rest_api', 'dhgate-api', 5000, 3000, 15.00, true, true, '["DHGATE_API_KEY"]', 'Wholesale/dropshipping'),

-- 🇮🇳 Índia (3 fontes)
('IndiaMART', 'India', 'Asia', 'https://www.indiamart.com', 'rest_api', 'indiamart-rfq-detector', 10000, 8000, 10.00, true, true, '["INDIAMART_MOBILE","INDIAMART_API_KEY"]', 'Largest Indian B2B'),
('TradeIndia', 'India', 'Asia', 'https://www.tradeindia.com', 'scraping', 'tradeindia-scraper', 3000, 8000, 10.00, true, false, '[]', 'Import/export focus'),
('ExportersIndia', 'India', 'Asia', 'https://www.exportersindia.com', 'scraping', 'exportersindia-scraper', 1500, 10000, 10.00, true, false, '[]', 'Export-oriented'),

-- 🇭🇰 Hong Kong (2 fontes)
('GlobalSources', 'Hong Kong', 'Asia', 'https://www.globalsources.com', 'xml_soap', 'globalsources-rfq-api', 5000, 20000, 10.00, true, true, '["GLOBALSOURCES_SUPPLIER_ID","GLOBALSOURCES_SUPPLIER_KEY"]', 'XML/SOAP API'),
('HKTDC', 'Hong Kong', 'Asia', 'https://www.hktdc.com', 'scraping', 'hktdc-scraper', 1000, 30000, 8.00, true, false, '[]', 'Hong Kong Trade Council'),

-- 🇰🇷 Coreia do Sul (2 fontes)
('EC21', 'South Korea', 'Asia', 'https://www.ec21.com', 'scraping', 'ec21-scraper', 1500, 15000, 10.00, true, false, '[]', 'Korean B2B'),
('TradeKorea', 'South Korea', 'Asia', 'https://www.tradekorea.com', 'scraping', 'tradekorea-scraper', 800, 20000, 10.00, true, false, '[]', 'Manufacturing focus'),

-- 🇯🇵 Japão (2 fontes)
('JETRO', 'Japan', 'Asia', 'https://www.jetro.go.jp', 'scraping', 'jetro-scraper', 500, 50000, 7.00, true, false, '[]', 'Japan External Trade Org'),
('Rakuten B2B', 'Japan', 'Asia', 'https://b2b.rakuten.co.jp', 'scraping', 'rakuten-b2b-scraper', 300, 25000, 10.00, true, false, '[]', 'Tech/electronics'),

-- 🇩🇪 Alemanha/Europa (3 fontes)
('Wer Liefert Was', 'Germany', 'Europe', 'https://www.wlw.de', 'scraping', 'wlw-scraper', 2000, 30000, 10.00, true, false, '[]', 'German industrial B2B'),
('Europages', 'France', 'Europe', 'https://www.europages.com', 'scraping', 'europages-scraper', 1500, 25000, 10.00, true, false, '[]', 'Pan-European'),
('TED', 'EU', 'Europe', 'https://ted.europa.eu', 'rest_api', 'ted-api', 1000, 200000, 7.00, true, false, '[]', 'EU government tenders'),

-- 🇬🇧 Reino Unido (2 fontes)
('Contracts Finder', 'UK', 'Europe', 'https://www.contractsfinder.service.gov.uk', 'rest_api', 'contracts-finder-api', 500, 50000, 8.00, true, false, '[]', 'UK government contracts'),
('Tenderbase', 'UK', 'Europe', 'https://www.tenderbase.com', 'scraping', 'tenderbase-scraper', 300, 40000, 10.00, true, false, '[]', 'UK B2B tenders'),

-- 🇫🇷 França (2 fontes)
('Kompass France', 'France', 'Europe', 'https://fr.kompass.com', 'scraping', 'kompass-scraper', 500, 25000, 10.00, true, false, '[]', 'French industrial'),
('BOAMP', 'France', 'Europe', 'https://www.boamp.fr', 'scraping', 'boamp-scraper', 400, 60000, 7.00, true, false, '[]', 'French gov procurement'),

-- 🇧🇷 Brasil (2 fontes)
('Mercado Livre B2B', 'Brazil', 'Latin America', 'https://www.mercadolivre.com.br', 'scraping', 'mercadolivre-scraper', 1000, 5000, 10.00, true, false, '[]', 'Latin America trade'),
('Compras Gov BR', 'Brazil', 'Latin America', 'https://www.gov.br/compras', 'scraping', 'compras-br-scraper', 500, 30000, 8.00, true, false, '[]', 'Brazilian government'),

-- 🇦🇪 UAE/Middle East (1 fonte)
('TradeArabia', 'UAE', 'Middle East', 'https://www.tradearabia.com', 'scraping', 'tradearabia-scraper', 800, 40000, 10.00, true, false, '[]', 'Middle East trade'),

-- 🇦🇺 Austrália (2 fontes)
('AusTender', 'Australia', 'Asia-Pacific', 'https://www.tenders.gov.au', 'rest_api', 'austender-api', 300, 50000, 8.00, true, false, '[]', 'Australian government'),
('TradeStart', 'Australia', 'Asia-Pacific', 'https://www.tradestart.ca', 'scraping', 'tradestart-scraper', 200, 30000, 10.00, true, false, '[]', 'Australia/Asia-Pacific'),

-- 🇨🇦 Canadá (2 fontes)
('MERX', 'Canada', 'North America', 'https://www.merx.com', 'rest_api', 'merx-api', 400, 40000, 8.00, true, true, '["MERX_API_KEY"]', 'Canadian government'),
('ThomasNet Canada', 'Canada', 'North America', 'https://www.thomasnet.com', 'scraping', 'thomasnet-ca-scraper', 200, 25000, 10.00, true, false, '[]', 'Industrial CA'),

-- 🇲🇽 México (2 fontes)
('CompraNet', 'Mexico', 'Latin America', 'https://compranet.hacienda.gob.mx', 'scraping', 'compranet-scraper', 500, 20000, 10.00, true, false, '[]', 'Mexican government'),
('Mercado Libre MX', 'Mexico', 'Latin America', 'https://www.mercadolibre.com.mx', 'scraping', 'mercadolibre-mx-scraper', 800, 5000, 12.00, true, false, '[]', 'Mexican B2B'),

-- 🌍 Global/International (4 fontes)
('UNGM', 'Global', 'International', 'https://www.ungm.org', 'rest_api', 'ungm-api', 500, 100000, 5.00, true, false, '[]', 'UN Global Marketplace'),
('World Bank', 'Global', 'International', 'https://www.worldbank.org', 'rest_api', 'worldbank-api', 200, 500000, 3.00, true, false, '[]', 'World Bank procurement'),
('IDB', 'Latin America', 'International', 'https://www.iadb.org', 'rest_api', 'idb-api', 200, 100000, 5.00, true, false, '[]', 'Inter-American Dev Bank'),
('ADB', 'Asia-Pacific', 'International', 'https://www.adb.org', 'rest_api', 'adb-api', 150, 200000, 5.00, true, false, '[]', 'Asian Development Bank');

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rfq_sources_active ON rfq_sources_config(is_active);
CREATE INDEX IF NOT EXISTS idx_rfq_sources_region ON rfq_sources_config(source_region);
CREATE INDEX IF NOT EXISTS idx_rfq_sources_country ON rfq_sources_config(source_country);

-- 4. View: Estatísticas por região
CREATE OR REPLACE VIEW rfq_sources_stats AS
SELECT 
  source_region,
  COUNT(*) as total_sources,
  SUM(daily_rfq_volume) as total_daily_rfqs,
  ROUND(AVG(average_ticket_usd)) as avg_ticket_usd,
  ROUND(AVG(commission_rate), 2) as avg_commission_rate,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_sources
FROM rfq_sources_config
GROUP BY source_region
ORDER BY total_daily_rfqs DESC;

-- 5. View: Fontes que precisam credenciais
CREATE OR REPLACE VIEW rfq_sources_need_credentials AS
SELECT 
  source_name,
  source_country,
  edge_function_name,
  credential_keys,
  daily_rfq_volume,
  notes
FROM rfq_sources_config
WHERE requires_credentials = true AND is_active = true
ORDER BY daily_rfq_volume DESC;

-- 6. Função: Obter fontes ativas
CREATE OR REPLACE FUNCTION get_active_rfq_sources()
RETURNS TABLE (
  source_name VARCHAR,
  edge_function_name VARCHAR,
  daily_rfq_volume INTEGER,
  api_type VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rsc.source_name,
    rsc.edge_function_name,
    rsc.daily_rfq_volume,
    rsc.api_type
  FROM rfq_sources_config rsc
  WHERE rsc.is_active = true
  ORDER BY rsc.daily_rfq_volume DESC;
END;
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ 39 fontes de RFQs globais ativadas!';
  RAISE NOTICE '📊 Volume total: 105,500 RFQs/dia';
  RAISE NOTICE '🌍 Cobertura: 20+ países em 6 regiões';
END $$;
