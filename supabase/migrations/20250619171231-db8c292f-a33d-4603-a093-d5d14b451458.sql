
-- First, let's ensure the user_profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user',
  resume_url text,
  preferences jsonb,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create simple, non-recursive RLS policies
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create or replace the trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policies for other tables to ensure they work with authentication

-- Jobs table policies (allow all users to read jobs)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;

CREATE POLICY "Anyone can view jobs" 
  ON public.jobs 
  FOR SELECT 
  TO authenticated, anon 
  USING (true);

CREATE POLICY "Authenticated users can create jobs" 
  ON public.jobs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Applications table policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can create own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;

CREATE POLICY "Users can view own applications" 
  ON public.applications 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" 
  ON public.applications 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" 
  ON public.applications 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Saved jobs table policies
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Users can create own saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Users can delete own saved jobs" ON public.saved_jobs;

CREATE POLICY "Users can view own saved jobs" 
  ON public.saved_jobs 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved jobs" 
  ON public.saved_jobs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs" 
  ON public.saved_jobs 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Notifications table policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" 
  ON public.notifications 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
  ON public.notifications 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);
