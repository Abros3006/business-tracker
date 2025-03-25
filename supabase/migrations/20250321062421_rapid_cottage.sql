/*
  # Remove approval workflow and simplify business management
  
  1. Changes
    - Drop policies in correct order to handle dependencies
    - Remove approval workflow columns
    - Create new simplified policies
  
  2. Security
    - Enable anonymous access for business viewing
    - Allow authenticated users to manage their own businesses
*/

DO $$ 
BEGIN
  -- First drop all policies that might depend on the columns we want to remove
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Students can only edit draft or pending businesses'
  ) THEN
    DROP POLICY "Students can only edit draft or pending businesses" ON businesses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Admins can approve or reject businesses'
  ) THEN
    DROP POLICY "Admins can approve or reject businesses" ON businesses;
  END IF;

  -- Drop other existing policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Users can read all businesses'
  ) THEN
    DROP POLICY "Users can read all businesses" ON businesses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Users can insert their own business'
  ) THEN
    DROP POLICY "Users can insert their own business" ON businesses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Users can update their own business'
  ) THEN
    DROP POLICY "Users can update their own business" ON businesses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Users can delete their own business'
  ) THEN
    DROP POLICY "Users can delete their own business" ON businesses;
  END IF;

  -- Now we can safely remove the columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'status'
  ) THEN
    ALTER TABLE businesses DROP COLUMN status CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'approval_date'
  ) THEN
    ALTER TABLE businesses DROP COLUMN approval_date CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE businesses DROP COLUMN approved_by CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE businesses DROP COLUMN rejection_reason CASCADE;
  END IF;
END $$;

-- Create new simplified policies
CREATE POLICY "Anyone can view businesses"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can manage their own business"
  ON businesses
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);