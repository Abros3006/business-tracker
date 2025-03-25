/*
  # Add single business per student constraint
  
  1. Changes
    - Add unique constraint on owner_id to ensure one business per student
    - Update RLS policies to enforce this rule
  
  2. Security
    - Maintains existing RLS policies
    - Adds additional validation
*/

-- Add unique constraint on owner_id
ALTER TABLE businesses
ADD CONSTRAINT one_business_per_owner UNIQUE (owner_id);

-- Update the insert policy to check for existing business
DROP POLICY IF EXISTS "Users can manage their own business" ON businesses;

CREATE POLICY "Users can manage their own business"
  ON businesses
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = owner_id AND (
      -- For inserts, check if user doesn't have a business yet
      NOT EXISTS (
        SELECT 1 FROM businesses 
        WHERE owner_id = auth.uid() AND id != COALESCE(businesses.id, '00000000-0000-0000-0000-000000000000'::uuid)
      )
    )
  )
  WITH CHECK (
    auth.uid() = owner_id AND (
      -- For inserts, check if user doesn't have a business yet
      NOT EXISTS (
        SELECT 1 FROM businesses 
        WHERE owner_id = auth.uid() AND id != COALESCE(businesses.id, '00000000-0000-0000-0000-000000000000'::uuid)
      )
    )
  );