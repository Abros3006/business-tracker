/*
  # Initial Schema Setup for Business Showcase

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - role (text)
      - full_name (text)
      - created_at (timestamp)
    - businesses
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - industry (text)
      - youtube_video_url (text)
      - website_url (text)
      - social_links (jsonb)
      - owner_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('admin', 'student')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  industry text NOT NULL,
  youtube_video_url text,
  website_url text,
  social_links jsonb DEFAULT '{}'::jsonb,
  owner_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Users can read all businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own business"
  ON businesses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own business"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, 'student', new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();