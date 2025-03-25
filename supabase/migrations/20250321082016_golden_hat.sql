/*
  # Fix profiles table RLS policies

  1. Changes
    - Add policy for inserting new profiles during registration
    - Update select policy to allow users to read their own profile
    - Add policy for auth service to manage profiles
  
  2. Security
    - Users can only read their own profile
    - Auth service can manage all profiles
    - New users can create their initial profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow new users to create their profile during registration
CREATE POLICY "Users can create their initial profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow the auth service to manage profiles
CREATE POLICY "Auth service can manage profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);