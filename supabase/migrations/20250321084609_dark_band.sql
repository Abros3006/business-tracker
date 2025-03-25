/*
  # Fix Profile Policies Final Version

  1. Changes
    - Remove recursive admin check
    - Simplify policies to avoid recursion
    - Use direct role check for admin access
    - Maintain security while improving performance

  2. Security
    - Maintain RLS protection
    - Keep existing access patterns
    - Fix admin access without recursion
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their initial profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for auth hooks)
CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to create their initial profile
CREATE POLICY "Users can create their initial profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read profiles (including admin access)
CREATE POLICY "Profile read access"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- User can read their own profile
  auth.uid() = id 
  OR 
  -- Admin can read all profiles (using direct role check)
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);