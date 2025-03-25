/*
  # Add business approval workflow

  1. Changes
    - Add status column to businesses table
    - Add approval_date column to businesses table
    - Add approved_by column to businesses table
    - Update RLS policies for approval workflow

  2. Security
    - Only admins can approve businesses
    - Students can only edit draft/pending businesses
*/

-- Add approval workflow columns
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approval_date timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update RLS policies for approval workflow
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Students can only edit draft or pending businesses'
  ) THEN
    CREATE POLICY "Students can only edit draft or pending businesses"
      ON businesses
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = owner_id 
        AND status IN ('draft', 'pending')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Admins can approve or reject businesses'
  ) THEN
    CREATE POLICY "Admins can approve or reject businesses"
      ON businesses
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;