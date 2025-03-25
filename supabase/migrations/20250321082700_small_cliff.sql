/*
  # Fix Business RLS Policies

  1. Changes
    - Drop existing policies that may be causing recursion
    - Create clear, non-recursive policies for businesses table
    - Add proper RLS policies for CRUD operations

  2. Security
    - Enable RLS on businesses table
    - Add policies for:
      - Public read access
      - Owner-based write access
      - Admin full access
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own business" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can manage their own business" ON businesses;
DROP POLICY IF EXISTS "Public can view businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Admins can do everything" ON businesses;

-- Create new, simplified policies

-- Allow anyone to view businesses (public read access)
CREATE POLICY "Public can view businesses"
ON businesses
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create their own business
CREATE POLICY "Users can create their own business"
ON businesses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own business
CREATE POLICY "Users can update their own business"
ON businesses
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Allow users to delete their own business
CREATE POLICY "Users can delete their own business"
ON businesses
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Allow admins full access to all businesses
CREATE POLICY "Admins have full access"
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