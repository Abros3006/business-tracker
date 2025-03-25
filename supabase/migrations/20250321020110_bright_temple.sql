/*
  # Add Super Admin User

  1. Changes
    - Temporarily disable the new user trigger
    - Insert admin user into auth.users table
    - Create admin profile in profiles table
    - Re-enable the trigger
  
  2. Security
    - Uses secure password hashing
    - Maintains existing RLS policies
*/

-- Create admin user
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Temporarily disable trigger
  ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

  -- Insert into auth.users if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'dr.vikram.shete@gmail.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      raw_app_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'dr.vikram.shete@gmail.com',
      crypt('test123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "Dr. Vikram Shete"}'::jsonb,
      '{"provider": "email"}'::jsonb
    )
    RETURNING id INTO admin_id;

    -- Create admin profile
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (admin_id, 'admin', 'Dr. Vikram Shete');
  END IF;

  -- Re-enable trigger
  ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
END $$;