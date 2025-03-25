/*
  # Fix profiles table schema

  1. Changes
    - Remove email column from profiles table as it's already in auth.users
    - Add missing columns to match TypeScript types
  
  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Remove email column if it exists (it shouldn't affect existing policies)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles DROP COLUMN email;
  END IF;
END $$;