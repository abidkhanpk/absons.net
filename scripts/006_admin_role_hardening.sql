-- Helper to restrict user management to admins/super_admins
CREATE OR REPLACE FUNCTION public.is_admin_manager(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id
      AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restrict inserts into users to admins/super_admins (still allow self-insert policy from 004)
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.users;
CREATE POLICY "Admins can insert admin users"
  ON public.users FOR INSERT
  WITH CHECK (public.is_admin_manager(auth.uid()));

-- Restrict updates on users to admins/super_admins
DROP POLICY IF EXISTS "Admins can update admin users" ON public.users;
CREATE POLICY "Admins can update admin users"
  ON public.users FOR UPDATE
  USING (public.is_admin_manager(auth.uid()));

-- Restrict deletes on users to admins/super_admins and prevent self-delete
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.users;
CREATE POLICY "Admins can delete admin users"
  ON public.users FOR DELETE
  USING (public.is_admin_manager(auth.uid()) AND auth.uid() != id);

-- Allow admins/super_admins to delete inquiries
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins can delete inquiries"
  ON public.contact_inquiries FOR DELETE
  USING (public.is_admin_manager(auth.uid()));
