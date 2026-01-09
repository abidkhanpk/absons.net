-- Allow authenticated users to insert themselves into users during signup
DROP POLICY IF EXISTS "Users can insert themselves" ON public.users;

CREATE POLICY "Users can insert themselves"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also allow admins to insert other admins
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.users;

CREATE POLICY "Admins can insert admin users"
  ON public.users FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));
