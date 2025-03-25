/*
  # Remove approval workflow and simplify business management
  
  1. Changes
    - Drop existing policies
    - Remove approval workflow columns
    - Create new simplified policies
  
  2. Security
    - Enable anonymous access for business viewing
    - Allow authenticated users to manage their own businesses
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Students can only edit draft or pending businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can approve or reject businesses" ON businesses;
DROP POLICY IF EXISTS "Users can read all businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own business" ON businesses;

-- Remove approval workflow columns
ALTER TABLE businesses 
  DROP COLUMN IF EXISTS status CASCADE,
  DROP COLUMN IF EXISTS approval_date CASCADE,
  DROP COLUMN IF EXISTS approved_by CASCADE,
  DROP COLUMN IF EXISTS rejection_reason CASCADE;

-- Create new simplified policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Anyone can view businesses'
  ) THEN
    CREATE POLICY "Anyone can view businesses"
      ON businesses
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Users can manage their own business'
  ) THEN
    CREATE POLICY "Users can manage their own business"
      ON businesses
      FOR ALL
      TO authenticated
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;