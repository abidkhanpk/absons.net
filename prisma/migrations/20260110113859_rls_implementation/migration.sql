-- RLS implementation using JWT claim (request.jwt.claim.sub) as user identifier
-- Helper to read current user id from JWT claims (or NULL if absent)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid AS $$
SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- Helper: is admin/super_admin based on users.role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_manager(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE;

-- Enable RLS on all tables (idempotent)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- USERS
DROP POLICY IF EXISTS "Users_select" ON public.users;
DROP POLICY IF EXISTS "Users_insert_self" ON public.users;
DROP POLICY IF EXISTS "Users_insert_admin" ON public.users;
DROP POLICY IF EXISTS "Users_update_admin" ON public.users;
DROP POLICY IF EXISTS "Users_delete_admin" ON public.users;

-- Only admins/super_admins or the user themselves can SELECT (protects password hashes)
CREATE POLICY "Users_select"
  ON public.users FOR SELECT
  USING (is_admin_manager(current_user_id()) OR current_user_id() = id);

CREATE POLICY "Users_insert_self"
  ON public.users FOR INSERT
  WITH CHECK (current_user_id() = id);

CREATE POLICY "Users_insert_admin"
  ON public.users FOR INSERT
  WITH CHECK (is_admin_manager(current_user_id()));

-- Allow admins/super_admins or the user themselves to update their row (for password/profile updates)
CREATE POLICY "Users_update_admin"
  ON public.users FOR UPDATE
  USING (is_admin_manager(current_user_id()) OR current_user_id() = id);

CREATE POLICY "Users_delete_admin"
  ON public.users FOR DELETE
  USING (is_admin_manager(current_user_id()) AND current_user_id() <> id);

-- SERVICES
DROP POLICY IF EXISTS "Services_select" ON public.services;
DROP POLICY IF EXISTS "Services_insert" ON public.services;
DROP POLICY IF EXISTS "Services_update" ON public.services;
DROP POLICY IF EXISTS "Services_delete" ON public.services;

CREATE POLICY "Services_select"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Services_insert"
  ON public.services FOR INSERT
  WITH CHECK (is_admin(current_user_id()));

CREATE POLICY "Services_update"
  ON public.services FOR UPDATE
  USING (is_admin(current_user_id()));

CREATE POLICY "Services_delete"
  ON public.services FOR DELETE
  USING (is_admin(current_user_id()));

-- BLOG POSTS
DROP POLICY IF EXISTS "Blog_select" ON public.blog_posts;
DROP POLICY IF EXISTS "Blog_insert" ON public.blog_posts;
DROP POLICY IF EXISTS "Blog_update" ON public.blog_posts;
DROP POLICY IF EXISTS "Blog_delete" ON public.blog_posts;

CREATE POLICY "Blog_select"
  ON public.blog_posts FOR SELECT
  USING (published = TRUE OR is_admin(current_user_id()));

CREATE POLICY "Blog_insert"
  ON public.blog_posts FOR INSERT
  WITH CHECK (is_admin(current_user_id()));

CREATE POLICY "Blog_update"
  ON public.blog_posts FOR UPDATE
  USING (is_admin(current_user_id()));

CREATE POLICY "Blog_delete"
  ON public.blog_posts FOR DELETE
  USING (is_admin(current_user_id()));

-- TRAINING COURSES
DROP POLICY IF EXISTS "Training_select" ON public.training_courses;
DROP POLICY IF EXISTS "Training_insert" ON public.training_courses;
DROP POLICY IF EXISTS "Training_update" ON public.training_courses;
DROP POLICY IF EXISTS "Training_delete" ON public.training_courses;

CREATE POLICY "Training_select"
  ON public.training_courses FOR SELECT
  USING (is_active = TRUE OR is_admin(current_user_id()));

CREATE POLICY "Training_insert"
  ON public.training_courses FOR INSERT
  WITH CHECK (is_admin(current_user_id()));

CREATE POLICY "Training_update"
  ON public.training_courses FOR UPDATE
  USING (is_admin(current_user_id()));

CREATE POLICY "Training_delete"
  ON public.training_courses FOR DELETE
  USING (is_admin(current_user_id()));

-- TESTIMONIALS
DROP POLICY IF EXISTS "Testimonials_select" ON public.testimonials;
DROP POLICY IF EXISTS "Testimonials_insert" ON public.testimonials;
DROP POLICY IF EXISTS "Testimonials_update" ON public.testimonials;
DROP POLICY IF EXISTS "Testimonials_delete" ON public.testimonials;

CREATE POLICY "Testimonials_select"
  ON public.testimonials FOR SELECT
  USING (true);

CREATE POLICY "Testimonials_insert"
  ON public.testimonials FOR INSERT
  WITH CHECK (is_admin(current_user_id()));

CREATE POLICY "Testimonials_update"
  ON public.testimonials FOR UPDATE
  USING (is_admin(current_user_id()));

CREATE POLICY "Testimonials_delete"
  ON public.testimonials FOR DELETE
  USING (is_admin(current_user_id()));

-- CONTACT INQUIRIES
DROP POLICY IF EXISTS "Inquiries_select" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Inquiries_insert" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Inquiries_update" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Inquiries_delete" ON public.contact_inquiries;

CREATE POLICY "Inquiries_insert"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Inquiries_select"
  ON public.contact_inquiries FOR SELECT
  USING (is_admin(current_user_id()));

CREATE POLICY "Inquiries_update"
  ON public.contact_inquiries FOR UPDATE
  USING (is_admin(current_user_id()));

CREATE POLICY "Inquiries_delete"
  ON public.contact_inquiries FOR DELETE
  USING (is_admin_manager(current_user_id()));

-- SITE SETTINGS
DROP POLICY IF EXISTS "Site_select" ON public.site_settings;
DROP POLICY IF EXISTS "Site_update" ON public.site_settings;

CREATE POLICY "Site_select"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Site_update"
  ON public.site_settings FOR UPDATE
  USING (is_super_admin(current_user_id()));
