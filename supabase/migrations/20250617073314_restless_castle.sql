/*
  # Create attendance tracking schema

  1. New Tables
    - `employees`
      - `id` (text, primary key)
      - `name` (text, required)
      - `department` (text, optional)
      - `father_name` (text, optional)
      - `dob` (date, optional)
      - `cnic` (text, optional)
      - `address` (text, optional)
      - `phone1` (text, optional)
      - `phone2` (text, optional)
      - `education` (text, optional)
      - `shift` (text, default 'morning')
      - `weekends` (jsonb, default '[0,6]')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `attendance`
      - `id` (bigint, primary key)
      - `employee_id` (text, foreign key)
      - `date` (date, required)
      - `present` (boolean, default false)
      - `time_in` (time, optional)
      - `time_out` (time, optional)
      - `shift` (text, default 'morning')
      - `hours` (numeric, default 0)
      - `overtime_hours` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `settings`
      - `id` (bigint, primary key)
      - `key` (text, unique)
      - `value` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id text PRIMARY KEY DEFAULT 'EMP' || LPAD((RANDOM() * 9999)::int::text, 4, '0'),
  name text NOT NULL,
  department text,
  father_name text,
  dob date,
  cnic text,
  address text,
  phone1 text,
  phone2 text,
  education text,
  shift text DEFAULT 'morning',
  weekends jsonb DEFAULT '[0,6]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  employee_id text NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  present boolean DEFAULT false,
  time_in time,
  time_out time,
  shift text DEFAULT 'morning',
  hours numeric DEFAULT 0,
  overtime_hours numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_shift ON employees(shift);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read all employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert employees"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update employees"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete employees"
  ON employees
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update attendance"
  ON attendance
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete attendance"
  ON attendance
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert settings"
  ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete settings"
  ON settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
  ('weekends', '[0,6]'),
  ('shifts', '{"morning":{"start":"09:00","end":"17:00"},"night":{"start":"21:00","end":"05:00"}}'),
  ('holidays', '[]')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at 
  BEFORE UPDATE ON attendance 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();