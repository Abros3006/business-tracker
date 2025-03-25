/*
  # Add Business Canvas Features

  1. New Tables
    - value_proposition_canvas
      - id (uuid, primary key)
      - business_id (uuid, foreign key)
      - customer_jobs (jsonb)
      - pains (jsonb)
      - gains (jsonb)
      - products_services (jsonb)
      - pain_relievers (jsonb)
      - gain_creators (jsonb)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - business_model_canvas
      - id (uuid, primary key)
      - business_id (uuid, foreign key)
      - key_partners (jsonb)
      - key_activities (jsonb)
      - key_resources (jsonb)
      - value_propositions (jsonb)
      - customer_relationships (jsonb)
      - channels (jsonb)
      - customer_segments (jsonb)
      - cost_structure (jsonb)
      - revenue_streams (jsonb)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for business owners to manage their data
*/

-- Create value proposition canvas table
CREATE TABLE IF NOT EXISTS value_proposition_canvas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  customer_jobs jsonb DEFAULT '[]'::jsonb,
  pains jsonb DEFAULT '[]'::jsonb,
  gains jsonb DEFAULT '[]'::jsonb,
  products_services jsonb DEFAULT '[]'::jsonb,
  pain_relievers jsonb DEFAULT '[]'::jsonb,
  gain_creators jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business model canvas table
CREATE TABLE IF NOT EXISTS business_model_canvas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  key_partners jsonb DEFAULT '[]'::jsonb,
  key_activities jsonb DEFAULT '[]'::jsonb,
  key_resources jsonb DEFAULT '[]'::jsonb,
  value_propositions jsonb DEFAULT '[]'::jsonb,
  customer_relationships jsonb DEFAULT '[]'::jsonb,
  channels jsonb DEFAULT '[]'::jsonb,
  customer_segments jsonb DEFAULT '[]'::jsonb,
  cost_structure jsonb DEFAULT '[]'::jsonb,
  revenue_streams jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE value_proposition_canvas ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_model_canvas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for value proposition canvas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'value_proposition_canvas' AND policyname = 'Users can view all value proposition canvases'
  ) THEN
    CREATE POLICY "Users can view all value proposition canvases"
      ON value_proposition_canvas
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'value_proposition_canvas' AND policyname = 'Users can manage their own value proposition canvas'
  ) THEN
    CREATE POLICY "Users can manage their own value proposition canvas"
      ON value_proposition_canvas
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM businesses
          WHERE businesses.id = value_proposition_canvas.business_id
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RLS Policies for business model canvas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_model_canvas' AND policyname = 'Users can view all business model canvases'
  ) THEN
    CREATE POLICY "Users can view all business model canvases"
      ON business_model_canvas
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_model_canvas' AND policyname = 'Users can manage their own business model canvas'
  ) THEN
    CREATE POLICY "Users can manage their own business model canvas"
      ON business_model_canvas
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM businesses
          WHERE businesses.id = business_model_canvas.business_id
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;