-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Admins can update services" ON public.services;
DROP POLICY IF EXISTS "Admins can delete services" ON public.services;
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.contact_inquiries;

-- Create helper function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin users policies - simplified to avoid recursion
CREATE POLICY "Authenticated users can view admin users"
  ON public.admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Blog posts policies - using helper function
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (published = TRUE OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Services policies - using helper function
CREATE POLICY "Admins can insert services"
  ON public.services FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update services"
  ON public.services FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete services"
  ON public.services FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Training courses policies - using helper function
CREATE POLICY "Anyone can view active courses"
  ON public.training_courses FOR SELECT
  USING (is_active = TRUE OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert courses"
  ON public.training_courses FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update courses"
  ON public.training_courses FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete courses"
  ON public.training_courses FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Testimonials policies - using helper function
CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Contact inquiries policies - using helper function
CREATE POLICY "Admins can view all inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update inquiries"
  ON public.contact_inquiries FOR UPDATE
  USING (public.is_admin(auth.uid()));
