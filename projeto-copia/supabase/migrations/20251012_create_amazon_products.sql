-- Create amazon_products table for real Amazon product data
CREATE TABLE IF NOT EXISTS public.amazon_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asin VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2),
  rating DECIMAL(3,2),
  reviews INTEGER,
  image_url TEXT,
  category VARCHAR(100),
  marketplace VARCHAR(10),
  affiliate_link TEXT,
  source VARCHAR(50) DEFAULT 'amazon_rapidapi',
  ingested_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_amazon_asin ON public.amazon_products(asin);
CREATE INDEX IF NOT EXISTS idx_amazon_reviews ON public.amazon_products(reviews DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_marketplace ON public.amazon_products(marketplace);

-- Enable RLS
ALTER TABLE public.amazon_products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (authenticated users)
CREATE POLICY "Allow all for authenticated users" ON public.amazon_products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policy for anon users to read
CREATE POLICY "Allow read for anon" ON public.amazon_products
  FOR SELECT
  USING (true);
