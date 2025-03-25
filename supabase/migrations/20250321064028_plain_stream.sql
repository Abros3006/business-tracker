/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Simplify RLS policies for businesses table
    - Remove complex conditions causing recursion
    - Maintain one business per owner constraint
    
  2. Security
    - Keep basic security rules
    - Ensure users can only manage their own business
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own business" ON businesses;
DROP POLICY IF EXISTS "Anyone can view businesses" ON businesses;

-- Create simplified policies
CREATE POLICY "Anyone can view businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own business"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    NOT EXISTS (
      SELECT 1 FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own business"
  ON businesses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Ensure unique constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'one_business_per_owner'
  ) THEN
    ALTER TABLE businesses
    ADD CONSTRAINT one_business_per_owner UNIQUE (owner_id);
  END IF;
END $$;