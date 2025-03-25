/*
  # Remove approval workflow and simplify business management
  
  1. Changes
    - Remove approval workflow columns from businesses table using CASCADE
    - Update RLS policies to allow direct publishing
    - Add anonymous access for business viewing
  
  2. Security
    - Drop existing policies
    - Create new simplified policies for business management
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can read all businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own business" ON businesses;
DROP POLICY IF EXISTS "Admins can approve or reject businesses" ON businesses;
DROP POLICY IF EXISTS "Students can only edit draft or pending businesses" ON businesses;

-- Remove approval workflow columns with CASCADE to handle dependencies
ALTER TABLE businesses 
  DROP COLUMN IF EXISTS status CASCADE,
  DROP COLUMN IF EXISTS approval_date CASCADE,
  DROP COLUMN IF EXISTS approved_by CASCADE,
  DROP COLUMN IF EXISTS rejection_reason CASCADE;

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