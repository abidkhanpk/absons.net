-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin users table (references auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admins can view all admin users"
  ON public.admin_users FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services policies - public can read, only admins can modify
CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can update services"
  ON public.services FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can delete services"
  ON public.services FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (published = TRUE OR auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create training courses table
CREATE TABLE IF NOT EXISTS public.training_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT,
  level TEXT,
  provider TEXT DEFAULT 'Mobius Institute',
  featured_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Training courses policies
CREATE POLICY "Anyone can view active courses"
  ON public.training_courses FOR SELECT
  USING (is_active = TRUE OR auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can insert courses"
  ON public.training_courses FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can update courses"
  ON public.training_courses FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can delete courses"
  ON public.training_courses FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_position TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Testimonials policies
CREATE POLICY "Anyone can view testimonials"
  ON public.testimonials FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Create contact inquiries table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Contact inquiries policies
CREATE POLICY "Anyone can insert inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view all inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY "Admins can update inquiries"
  ON public.contact_inquiries FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_courses_updated_at
  BEFORE UPDATE ON public.training_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
