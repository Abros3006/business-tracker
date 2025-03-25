/*
  # Add product management and team features

  1. New Tables
    - `products`: Store business products
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `product_variants`: Store product variations
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `name` (text)
      - `price` (numeric)
      - `created_at` (timestamp)
    
    - `team_members`: Store business team members
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `name` (text)
      - `role` (text)
      - `is_captain` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for business owners to manage their data
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  is_captain boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create a partial unique index to ensure only one captain per business
CREATE UNIQUE INDEX one_captain_per_business 
ON team_members (business_id) 
WHERE (is_captain = true);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own business products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for product variants
CREATE POLICY "Users can view all product variants"
  ON product_variants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own product variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN businesses ON businesses.id = products.business_id
      WHERE products.id = product_variants.product_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for team members
CREATE POLICY "Users can view all team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own business team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = team_members.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Add analytics columns to businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS visitor_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ratings integer DEFAULT 0;