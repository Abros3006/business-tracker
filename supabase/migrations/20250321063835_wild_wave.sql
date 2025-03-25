/*
  # Add single business per student constraint
  
  1. Changes
    - Add unique constraint on owner_id to ensure one business per student
    - Update RLS policies to enforce this rule
  
  2. Security
    - Maintains existing RLS policies
    - Adds additional validation
*/

-- Drop existing policy first
DROP POLICY IF EXISTS "Users can manage their own business" ON businesses;

-- Add unique constraint if it doesn't exist
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

-- Create new policy with single business check
CREATE POLICY "Users can manage their own business"
  ON businesses
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = owner_id AND (
      -- For admins
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      ) OR
      -- For students, ensure they don't have another business
      NOT EXISTS (
        SELECT 1 FROM businesses 
        WHERE owner_id = auth.uid() 
        AND id != COALESCE(businesses.id, '00000000-0000-0000-0000-000000000000'::uuid)
      )
    )
  )
  WITH CHECK (
    auth.uid() = owner_id AND (
      -- For admins
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      ) OR
      -- For students, ensure they don't have another business
      NOT EXISTS (
        SELECT 1 FROM businesses 
        WHERE owner_id = auth.uid() 
        AND id != COALESCE(businesses.id, '00000000-0000-0000-0000-000000000000'::uuid)
      )
    )
  );