/*
  # Remove approval workflow and simplify business management
  
  1. Changes
    - Remove approval workflow columns from businesses table
    - Update RLS policies to allow direct publishing
    - Add anonymous access for business viewing
*/

-- Remove approval workflow columns
ALTER TABLE businesses 
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS approval_date,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS rejection_reason;

-- Update RLS policies for businesses
DROP POLICY IF EXISTS "Users can read all businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own business" ON businesses;
DROP POLICY IF EXISTS "Admins can approve or reject businesses" ON businesses;
DROP POLICY IF EXISTS "Students can only edit draft or pending businesses" ON businesses;

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