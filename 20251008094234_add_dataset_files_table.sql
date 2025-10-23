/*
  # Add Dataset Files Table

  1. New Tables
    - `dataset_files`
      - `id` (uuid, primary key)
      - `dataset_id` (uuid, foreign key to datasets)
      - `file_name` (text)
      - `file_content` (text) - stores actual file content
      - `file_size` (bigint) - file size in bytes
      - `row_count` (integer) - number of rows/records
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on dataset_files table
    - Add policies for authenticated users to access files
*/

CREATE TABLE IF NOT EXISTS dataset_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_content text NOT NULL,
  file_size bigint NOT NULL,
  row_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dataset_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read dataset files"
  ON dataset_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Manager can manage dataset files"
  ON dataset_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Admin', 'Manager')
    )
  );