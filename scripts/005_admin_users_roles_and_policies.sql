-- Add role column if missing and backfill
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';

UPDATE public.users
SET role = COALESCE(role, 'admin');

-- Ensure at least one super_admin exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'super_admin') THEN
    UPDATE public.users
    SET role = 'super_admin'
    WHERE id = (
      SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1
    );
  END IF;
END;
$$;

-- Allow admins to update admin users
DROP POLICY IF EXISTS "Admins can update admin users" ON public.users;
CREATE POLICY "Admins can update admin users"
  ON public.users FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Allow admins to delete admin users (not themselves)
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.users;
CREATE POLICY "Admins can delete admin users"
  ON public.users FOR DELETE
  USING (public.is_admin(auth.uid()) AND auth.uid() != id);
