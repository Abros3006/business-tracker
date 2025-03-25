/*
  # Update business schema with new features

  1. New Columns
    - Add featured flag for homepage promotion
    - Add rating for public reviews
    - Add contact information fields
    - Add category relationship
  
  2. New Tables
    - categories table for business categorization
  
  3. Security
    - Enable RLS on new table
    - Update existing policies
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add new columns to businesses table
DO $$ 
BEGIN
  -- Add featured column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'featured'
  ) THEN
    ALTER TABLE businesses ADD COLUMN featured boolean DEFAULT false;
  END IF;

  -- Add rating column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'rating'
  ) THEN
    ALTER TABLE businesses ADD COLUMN rating numeric(2,1) DEFAULT 0.0;
  END IF;

  -- Add contact information columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'phone'
  ) THEN
    ALTER TABLE businesses ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'email'
  ) THEN
    ALTER TABLE businesses ADD COLUMN email text;
  END IF;

  -- Add category relationship if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;
END $$;

-- Update RLS policies for businesses
CREATE POLICY "Admins can do everything"
  ON businesses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );