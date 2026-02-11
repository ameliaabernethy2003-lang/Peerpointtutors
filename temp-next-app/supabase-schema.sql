-- PeerPointTutors Database Schema
-- Run this in your Supabase SQL Editor after creating your project

-- Tutor Submissions (from signup form)
CREATE TABLE IF NOT EXISTS tutor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  headshot_filename VARCHAR(255),
  headshot_path VARCHAR(500),
  internship_or_job TEXT,
  company VARCHAR(255),
  grade VARCHAR(50) NOT NULL,
  college VARCHAR(255) NOT NULL,
  majors TEXT NOT NULL,
  contact_information VARCHAR(255) NOT NULL,
  meeting_preference VARCHAR(50) NOT NULL,
  booking_url TEXT NOT NULL,
  venmo_username VARCHAR(255) NOT NULL,
  classes TEXT NOT NULL,
  extracurriculars TEXT,
  rate VARCHAR(10) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  accepted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accepted Tutors (approved tutors added to website)
CREATE TABLE IF NOT EXISTS accepted_tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  short_label VARCHAR(255),
  major TEXT NOT NULL,
  role TEXT,
  company VARCHAR(255),
  grade VARCHAR(50),
  rate VARCHAR(10),
  booking_url TEXT,
  venmo_username VARCHAR(255),
  image_src VARCHAR(500),
  core_courses JSONB,
  finance_courses JSONB,
  accounting_courses JSONB,
  extracurriculars TEXT,
  college VARCHAR(255) NOT NULL,
  school VARCHAR(255),
  submitted_at VARCHAR(255), -- Keep original submission timestamp as reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Sessions (temporary sessions for payment flow)
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  tutor_name VARCHAR(255) NOT NULL,
  tutor_venmo VARCHAR(255),
  rate VARCHAR(10),
  booking_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Payments (completed payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255),
  tutor_name VARCHAR(255) NOT NULL,
  tutor_venmo VARCHAR(255),
  total_amount DECIMAL(10, 2) NOT NULL,
  tutor_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 2.00,
  status VARCHAR(50) DEFAULT 'completed',
  paid_out BOOLEAN DEFAULT FALSE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Removed Static Tutors (tutors removed from website)
CREATE TABLE IF NOT EXISTS removed_static_tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_name VARCHAR(255) UNIQUE NOT NULL,
  removed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor Overrides (edits to static tutor data)
CREATE TABLE IF NOT EXISTS tutor_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id VARCHAR(255) UNIQUE NOT NULL, -- Format: "static-{tutor_name}"
  override_data JSONB NOT NULL, -- Stores the fields that were edited
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tutor_submissions_processed ON tutor_submissions(processed);
CREATE INDEX IF NOT EXISTS idx_tutor_submissions_submitted_at ON tutor_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_accepted_tutors_college ON accepted_tutors(college);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON payment_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_tutor_name ON payments(tutor_name);

