/*
  # Fix admin user setup
  
  1. Changes
    - Ensure admin user exists
    - Set correct password hash
  
  2. Security
    - Uses secure password hashing
    - Maintains existing RLS policies
*/

-- Create admin user if not exists
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Check if admin exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    -- Insert admin user
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
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "System Admin", "role": "admin"}'::jsonb,
      '{"provider": "email"}'::jsonb
    )
    RETURNING id INTO admin_id;

    -- Create admin profile
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (admin_id, 'admin', 'System Admin');
  END IF;
END $$;