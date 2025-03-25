/*
  # Enable public access to businesses

  1. Changes
    - Allow anonymous users to view businesses
    - Update RLS policies for public access
  
  2. Security
    - Maintain existing security for management operations
    - Only allow read access for public users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view businesses" ON businesses;

-- Create new policy for public access
CREATE POLICY "Public can view businesses"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update other policies to use proper roles
CREATE POLICY "Authenticated users can manage their own business"
  ON businesses
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);