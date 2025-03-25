/*
  # Disable email confirmation requirement

  1. Changes
    - Disable email confirmation requirement for authentication
    - This allows users to log in immediately after registration
*/

ALTER TABLE auth.users
  ALTER COLUMN email_confirmed_at 
  SET DEFAULT NOW();